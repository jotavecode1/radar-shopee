// Serverless function da Vercel — busca produtos na Shopee Afiliados por NICHO.
// Credenciais vêm das variáveis de ambiente (SHOPEE_APP_ID, SHOPEE_SECRET).

import crypto from "crypto";

const ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql";
const CAMPOS =
  "itemId productName priceMin priceMax sales ratingStar commissionRate " +
  "commission priceDiscountRate imageUrl shopId shopName shopType offerLink productLink";

// Palavras-chave de busca por nicho. A API busca por keyword.
const NICHOS = {
  "cozinha":         ["cozinha","utensílio cozinha","organizador cozinha","panela","air fryer"],
  "casa":            ["decoração casa","organizador","luminária","cortina","tapete"],
  "beleza":          ["skincare","maquiagem","sérum facial","protetor solar","perfume"],
  "saude":           ["suplemento","vitamina","colágeno","whey protein","melatonina"],
  "fitness":         ["roupa academia","legging fitness","conjunto fitness","tênis corrida"],
  "moda_feminina":   ["vestido feminino","blusa feminina","conjunto feminino","saia","bolsa feminina"],
  "eletronicos":     ["fone bluetooth","carregador","smartwatch","caixa de som","led"],
  "pet":             ["pet","cachorro","gato","comedouro","coleira"],
  "bebe":            ["bebê","maternidade","enxoval","brinquedo infantil"],
  "natal":           ["natal","decoração natal","enfeite natal","presente natal","pisca pisca natal"],
};

function assinar(appId, secret, payload) {
  const ts = Math.floor(Date.now() / 1000);
  const base = appId + ts + payload + secret;
  const sig = crypto.createHash("sha256").update(base, "utf8").digest("hex");
  return { ts, sig };
}

async function chamarShopee(appId, secret, keyword, sortType, page, limit) {
  const kwPart = keyword ? `keyword:${JSON.stringify(keyword)},` : "";
  const query =
    `query{productOfferV2(${kwPart}sortType:${sortType},page:${page},limit:${limit})` +
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

// Classifica a fase pelo que a API permite deduzir (sem histórico).
function classificarFase(p) {
  if (p._vendas >= 500) return "alta";
  if (p._rating >= 4.6 && p._comissao >= 11 && p._concorrencia >= 0.55) return "explodir";
  return "crescendo";
}

function pontuar(produtos) {
  produtos.forEach((p) => {
    p._comissao = num(p.commissionRate) * 100;
    p._vendas = num(p.sales);
    p._rating = num(p.ratingStar);
    p._preco = num(p.priceMin);
    p._ganho = num(p.commission);
  });

  // --- PROXY DE "MENOS AFILIADOS" (concorrência) ---
  // A API não informa nº de afiliados. Estimamos por:
  //  - densidade da loja nos resultados (loja muito repetida = mais divulgada)
  //  - saturação por vendas (produto no topo de vendas = já explorado)
  //  - tipo de loja (Mall/oficial atrai muito mais afiliados)
  const freq = {};
  produtos.forEach((p) => (freq[p.shopId] = (freq[p.shopId] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq), 1);
  const rVen = ranquear(produtos.map((p) => p._vendas));

  produtos.forEach((p) => {
    const satVen = rVen[p._vendas];
    const dens = (freq[p.shopId] - 1) / Math.max(maxFreq - 1, 1);
    const tipos = p.shopType || [];
    const oficial = Array.isArray(tipos) && tipos.some((t) => [1, 2, 4].includes(Number(t))) ? 1 : 0;
    // saturação alta => concorrência alta => menos espaço para viralizar
    const saturacao = 0.45 * satVen + 0.35 * dens + 0.20 * oficial;
    p._concorrencia = 1 - saturacao; // 1 = pouca concorrência (bom)
  });

  const rCom = ranquear(produtos.map((p) => p._comissao));
  const rVen2 = ranquear(produtos.map((p) => p._vendas));
  const rRat = ranquear(produtos.map((p) => p._rating));

  produtos.forEach((p) => {
    // PESO MAIOR em concorrência baixa, como o usuário pediz (menos afiliados manda)
    p._score =
      0.50 * p._concorrencia +
      0.25 * rCom[p._comissao] +
      0.15 * rVen2[p._vendas] +
      0.10 * rRat[p._rating];
    p._fase = classificarFase(p);
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

  const paginas = Math.min(parseInt(req.query.paginas) || 3, 10);
  const nicho = (req.query.nicho || "").toLowerCase();
  const keywords = NICHOS[nicho];
  if (!keywords) {
    return res.status(400).json({ erro: "Nicho inválido. Escolha um nicho da lista." });
  }

  try {
    const vistos = {};
    // Para cada palavra-chave do nicho, busca ordenando por comissão e por vendas.
    for (const kw of keywords) {
      for (const sort of [5, 2]) { // 5 = maior comissão, 2 = mais vendidos
        for (let page = 1; page <= paginas; page++) {
          const bloco = await chamarShopee(APP_ID, SECRET, kw, sort, page, 50);
          const nodes = bloco?.nodes || [];
          for (const n of nodes) vistos[n.itemId] = n;
          if (!bloco?.pageInfo?.hasNextPage) break;
          await new Promise((r) => setTimeout(r, 350));
        }
      }
    }

    let produtos = Object.values(vistos);
    // FILTRO: comissão SEMPRE acima de 5%, rating mínimo 4, vendas mínimas 30
    produtos = pontuar(produtos).filter(
      (p) => p._vendas >= 30 && p._rating >= 4 && p._comissao > 5
    );
    // Ordena priorizando MENOS concorrência (score já pesa 50% nisso)
    produtos.sort((a, b) => b._score - a._score);
    produtos = produtos.slice(0, 45);

    const limpos = produtos.map((p, i) => ({
      posicao: i + 1,
      score: Math.round(p._score * 100),
      fase: p._fase,
      concorrencia_baixa: Math.round(p._concorrencia * 100) / 100,
      poucos_afiliados: p._concorrencia >= 0.6,
      produto: p.productName,
      preco: Math.round(p._preco * 100) / 100,
      comissao: Math.round(p._comissao),
      recomendado: p._comissao >= 11,
      ganho: Math.round(p._ganho * 100) / 100,
      vendas: Math.round(p._vendas),
      rating: p._rating,
      desconto: num(p.priceDiscountRate),
      loja: p.shopName,
      imagem: p.imageUrl,
      link_afiliado: p.offerLink,
      link_produto: p.productLink,
    }));

    res.status(200).json({ nicho, total: limpos.length, produtos: limpos });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}
