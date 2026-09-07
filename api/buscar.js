// Serverless function da Vercel — busca produtos na Shopee Afiliados.
// As credenciais vêm das variáveis de ambiente (SHOPEE_APP_ID, SHOPEE_SECRET),
// nunca ficam no código nem chegam ao navegador.

import crypto from "crypto";

const ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql";
const CAMPOS =
  "itemId productName priceMin priceMax sales ratingStar commissionRate " +
  "commission priceDiscountRate imageUrl shopId shopName offerLink productLink";

function assinar(appId, secret, payload) {
  const ts = Math.floor(Date.now() / 1000);
  const base = appId + ts + payload + secret;
  const sig = crypto.createHash("sha256").update(base, "utf8").digest("hex");
  return { ts, sig };
}

async function chamarShopee(appId, secret, sortType, page, limit) {
  const query =
    `query{productOfferV2(listType:0,sortType:${sortType},page:${page},limit:${limit})` +
    `{nodes{${CAMPOS}}pageInfo{hasNextPage}}}`;
  const payload = JSON.stringify({ query });
  const { ts, sig } = assinar(appId, secret, payload);

  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `SHA256 Credential=${appId}, Timestamp=${ts}, Signature=${sig}`,
    },
    body: payload,
  });
  const j = await r.json();
  if (j.errors) {
    const e = j.errors[0];
    throw new Error(`Shopee ${e.extensions?.code}: ${e.message}`);
  }
  return j.data?.productOfferV2;
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function ranquear(valores) {
  const unicos = [...new Set(valores)].sort((a, b) => a - b);
  const div = Math.max(unicos.length - 1, 1);
  const mapa = {};
  unicos.forEach((v, i) => (mapa[v] = i / div));
  return mapa;
}

function pontuar(produtos) {
  produtos.forEach((p) => {
    p._comissao = num(p.commissionRate) * 100;
    p._vendas = num(p.sales);
    p._rating = num(p.ratingStar);
    p._preco = num(p.priceMin);
    p._ganho = num(p.commission);
  });

  const freq = {};
  produtos.forEach((p) => (freq[p.shopId] = (freq[p.shopId] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq), 1);
  const rVen = ranquear(produtos.map((p) => p._vendas));

  produtos.forEach((p) => {
    const satVen = rVen[p._vendas];
    const dens = (freq[p.shopId] - 1) / Math.max(maxFreq - 1, 1);
    p._concorrencia = 1 - (0.6 * satVen + 0.4 * dens);
  });

  const rCom = ranquear(produtos.map((p) => p._comissao));
  const rVen2 = ranquear(produtos.map((p) => p._vendas));
  const rRat = ranquear(produtos.map((p) => p._rating));

  produtos.forEach((p) => {
    p._score =
      0.4 * p._concorrencia +
      0.28 * rCom[p._comissao] +
      0.2 * rVen2[p._vendas] +
      0.12 * rRat[p._rating];
  });
  return produtos;
}

export default async function handler(req, res) {
  const APP_ID = process.env.SHOPEE_APP_ID;
  const SECRET = process.env.SHOPEE_SECRET;

  if (!APP_ID || !SECRET) {
    return res.status(500).json({
      erro: "Credenciais não configuradas. Defina SHOPEE_APP_ID e SHOPEE_SECRET nas variáveis de ambiente da Vercel.",
    });
  }

  const paginas = Math.min(parseInt(req.query.paginas) || 4, 10);

  try {
    const vistos = {};
    for (const sort of [2, 5]) {
      for (let page = 1; page <= paginas; page++) {
        const bloco = await chamarShopee(APP_ID, SECRET, sort, page, 50);
        const nodes = bloco?.nodes || [];
        for (const n of nodes) vistos[n.itemId] = n;
        if (!bloco?.pageInfo?.hasNextPage) break;
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    let produtos = Object.values(vistos);
    produtos = pontuar(produtos).filter(
      (p) => p._vendas >= 50 && p._rating >= 4 && p._comissao >= 3
    );
    produtos.sort((a, b) => b._score - a._score);
    produtos = produtos.slice(0, 30);

    const limpos = produtos.map((p, i) => ({
      posicao: i + 1,
      score: Math.round(p._score * 100),
      concorrencia_baixa: Math.round(p._concorrencia * 100) / 100,
      produto: p.productName,
      preco: Math.round(p._preco * 100) / 100,
      comissao: Math.round(p._comissao),
      ganho: Math.round(p._ganho * 100) / 100,
      vendas: Math.round(p._vendas),
      rating: p._rating,
      desconto: num(p.priceDiscountRate),
      loja: p.shopName,
      imagem: p.imageUrl,
      link_afiliado: p.offerLink,
      link_produto: p.productLink,
    }));

    res.status(200).json({ total: limpos.length, produtos: limpos });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}
