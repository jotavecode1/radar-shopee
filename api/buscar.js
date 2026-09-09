// Serverless function da Vercel — busca produtos na Shopee Afiliados por NICHO.
// Credenciais vêm das variáveis de ambiente (SHOPEE_APP_ID, SHOPEE_SECRET).

import crypto from "crypto";

const ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql";
const CAMPOS =
  "itemId productName priceMin priceMax sales ratingStar commissionRate " +
  "commission priceDiscountRate imageUrl shopId shopName shopType offerLink productLink";

// Palavras-chave de busca por nicho. A API busca por keyword.
const NICHOS = {
  "cozinha":         ["utensílios cozinha","organizador cozinha","panela antiaderente","air fryer","potes herméticos"],
  "casa":            ["organizador casa","luminária mesa","cortina blackout","tapete sala","cabide"],
  "beleza":          ["skincare","maquiagem","sérum facial","protetor solar","perfume feminino"],
  "saude":           ["suplemento","vitamina","colágeno","whey protein","melatonina"],
  "fitness":         ["roupa academia","legging fitness","conjunto fitness feminino","tênis academia"],
  "moda_feminina":   ["vestido feminino","blusa feminina","conjunto feminino","saia feminina","bolsa feminina"],
  "eletronicos":     ["fone bluetooth","carregador turbo","smartwatch","caixa de som bluetooth","fita led"],
  "pet":             ["comedouro pet","coleira cachorro","brinquedo pet","cama pet"],
  "bebe":            ["enxoval bebê","mamadeira","organizador maternidade","brinquedo bebê"],
  "natal":           ["decoração natal","enfeite natal","árvore de natal","pisca pisca natal","guirlanda natal"],
};

// LISTA DE BLOQUEIO: produtos que nunca devem aparecer (poluem os resultados).
// Quadros, pôsteres, adesivos de parede etc. entram por engano nas buscas amplas.
const BLOQUEADOS = [
  "quadro","quadros","poster","pôster","posters","pôsteres","placa decorativa",
  "adesivo","adesivos","papel de parede","gravura","tela decorativa","tela canvas",
  "banner","painel decorativo","plexiglass","acrílico decorativo","toalha personalizada",
  "caneca personalizada","camiseta personalizada","chaveiro personalizado",
];

function ehBloqueado(nome) {
  const n = (nome || "").toLowerCase();
  return BLOQUEADOS.some((b) => n.includes(b));
}

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
// Produtos/categorias que costumam se destacar sozinhos no vídeo:
// efeito visual "uau" ou resolvem um problema claro (bom para antes/depois).
const PALAVRAS_CHAMATIVAS = [
  // efeito visual / satisfatório
  "led","luminária","luminaria","projetor","galaxy","rgb","neon","fumaça","umidificador",
  "aquário","fonte","giratór","automático","automatico","elétrico","eletrico","portátil","dobrável","dobravel",
  // resolve problema claro / antes e depois
  "limpa","tira mancha","clareador","organizador","descasca","fatiador","cortador","removedor",
  "corretor","modelador","emagrec","anti","massageador","aparador","depilador","escova alisadora",
];

function indiceDestaque(p) {
  const n = (p.productName || "").toLowerCase();
  let d = 0;
  if (PALAVRAS_CHAMATIVAS.some((k) => n.includes(k))) d += 0.6; // tem apelo visual/problema
  if (p._desconto >= 20) d += 0.2; // desconto forte chama atenção
  if (p._rating >= 4.7) d += 0.2;  // muito bem avaliado = mostra bem no vídeo
  return Math.min(d, 1);
}

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
    p._desconto = num(p.priceDiscountRate);
  });

  // --- PROXY DE "MENOS AFILIADOS" (concorrência) ---
  const freq = {};
  produtos.forEach((p) => (freq[p.shopId] = (freq[p.shopId] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq), 1);
  const rVen = ranquear(produtos.map((p) => p._vendas));

  produtos.forEach((p) => {
    const satVen = rVen[p._vendas];
    const dens = (freq[p.shopId] - 1) / Math.max(maxFreq - 1, 1);
    const tipos = p.shopType || [];
    const oficial = Array.isArray(tipos) && tipos.some((t) => [1, 2, 4].includes(Number(t))) ? 1 : 0;
    const saturacao = 0.45 * satVen + 0.35 * dens + 0.20 * oficial;
    p._concorrencia = 1 - saturacao;
  });

  const rCom = ranquear(produtos.map((p) => p._comissao));
  const rVen2 = ranquear(produtos.map((p) => p._vendas));
  const rRat = ranquear(produtos.map((p) => p._rating));

  produtos.forEach((p) => {
    p._destaque = indiceDestaque(p);
    // EQUILÍBRIO: vendas fortes E espaço para viralizar E destaque no vídeo.
    // vendas 30% + concorrência baixa 30% + destaque 20% + comissão 15% + rating 5%
    p._score =
      0.30 * rVen2[p._vendas] +
      0.30 * p._concorrencia +
      0.20 * p._destaque +
      0.15 * rCom[p._comissao] +
      0.05 * rRat[p._rating];
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

  // Se não escolher nicho (ou escolher "todos"), busca em TODOS os nichos.
  let keywords;
  if (!nicho || nicho === "todos") {
    // pega 2 palavras-chave de cada nicho para cobrir tudo sem estourar o tempo
    keywords = [];
    for (const lista of Object.values(NICHOS)) {
      keywords.push(...lista.slice(0, 2));
    }
  } else {
    keywords = NICHOS[nicho];
    if (!keywords) {
      return res.status(400).json({ erro: "Nicho inválido. Escolha um nicho da lista." });
    }
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
    // FILTRO: campeões de venda (>=150 vendas), sem bloqueados, comissão >5%, rating >=4.3
    produtos = pontuar(produtos).filter(
      (p) => !ehBloqueado(p.productName) && p._vendas >= 150 && p._rating >= 4.3 && p._comissao > 5
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
      destaque_video: p._destaque >= 0.6, // se destaca sozinho no vídeo
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
