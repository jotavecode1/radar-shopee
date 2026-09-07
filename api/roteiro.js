// Gera gancho, ângulo, CTA e script de vídeo (<901 caracteres) a partir dos
// dados do produto. Sem IA generativa — usa regras de copy e categorização.

const CATEGORIAS = [
  {
    id: "cozinha",
    kws: ["cozedor","ovos","cozinha","panela","fatiador","descasca","utensi","pote","tábua","ralador","tapioc","boleira","forma","assadeira","air fryer","liquidificador"],
    dor: "perder tempo e sujar tudo na cozinha",
    beneficio: "praticidade e comida pronta em minutos",
    cenaGancho: "mostre o produto em ação logo no primeiro segundo",
    hashtags: "#cozinha #achadinhos #shopee",
  },
  {
    id: "fitness",
    kws: ["academia","fitness","top","calça","legging","suplex","conjunto fitness","short 2 em 1","compressão"],
    dor: "roupa de treino que fica transparente ou desconfortável",
    beneficio: "confiança e caimento perfeito no treino",
    cenaGancho: "faça o teste do agachamento na frente do espelho",
    hashtags: "#fitness #moda #shopee",
  },
  {
    id: "saude",
    kws: ["melatonina","colágeno","vitamina","suplemento","cápsula","whey","creatina","ômega","chá"],
    dor: "noites mal dormidas e falta de energia",
    beneficio: "mais disposição e bem-estar no dia a dia",
    cenaGancho: "grave sua rotina noturna com luz baixa e tom calmo",
    hashtags: "#bemestar #autocuidado #shopee",
  },
  {
    id: "beleza",
    kws: ["sérum","skincare","clareador","hidratante","protetor","shampoo","máscara","batom","base","axila","virilha"],
    dor: "um problema de pele que ninguém comenta em voz alta",
    beneficio: "resultado visível e autoestima lá em cima",
    cenaGancho: "mostre o antes e depois respeitando as regras da plataforma",
    hashtags: "#skincare #beleza #shopee",
  },
  {
    id: "eletronico",
    kws: ["fone","bluetooth","carregador","cabo","led","usb","suporte","luminária","câmera","smart","fonte tipo c"],
    dor: "acessório vagabundo que estraga rápido ou funciona mal",
    beneficio: "resolver de vez com algo que funciona",
    cenaGancho: "compare o produto velho ruim com o novo, com cronômetro na tela",
    hashtags: "#gadgets #tecnologia #shopee",
  },
  {
    id: "casa",
    kws: ["manta","cobertor","lençol","lixeira","organizador","cabide","toalha","tapete","cortina"],
    dor: "casa bagunçada ou desconfortável",
    beneficio: "aconchego e organização por pouco dinheiro",
    cenaGancho: "mostre o ambiente antes e depois do produto",
    hashtags: "#casa #organização #shopee",
  },
  {
    id: "pet",
    kws: ["pet","cachorro","gato","ração","coleira","comedouro"],
    dor: "gastar caro com coisas pro pet",
    beneficio: "cuidar do seu bicho gastando pouco",
    cenaGancho: "grave a reação do seu pet usando o produto",
    hashtags: "#pet #petshop #shopee",
  },
];

const GENERICA = {
  id: "geral",
  dor: "gastar mais do que precisa numa solução simples",
  beneficio: "resolver um problema do dia a dia por pouco",
  cenaGancho: "mostre o produto funcionando nos primeiros 2 segundos",
  hashtags: "#achadinhos #shopee #ofertas",
};

function categorizar(nome) {
  const n = (nome || "").toLowerCase();
  for (const c of CATEGORIAS) {
    if (c.kws.some((k) => n.includes(k))) return c;
  }
  return GENERICA;
}

function nomeCurto(nome) {
  let base = (nome || "").split(/[|\-–—]/)[0].trim();
  base = base.replace(/\{.*?\}/g, "").replace(/\s+/g, " ").trim();
  const palavras = base.split(" ").slice(0, 5).join(" ");
  return palavras || "esse produto";
}

function gerarGancho(cat, p, curto) {
  const opcoes = {
    cozinha: `Parei de sofrer na cozinha depois que achei ${curto} por R$${p.preco}.`,
    fitness: `Testei ${curto} de R$${p.preco} que promete zero transparência. Olha o resultado.`,
    saude: `Se você não dorme direito, esse vídeo é pra você.`,
    beleza: `Ninguém fala sobre isso, mas tem solução de R$${p.preco}.`,
    eletronico: `Seu acessório vive estragando? Descobri por que — e a solução.`,
    casa: `Transformei minha casa com um achadinho de R$${p.preco}.`,
    pet: `Meu pet aprovou esse achadinho de R$${p.preco}.`,
    geral: `Achei ${curto} por R$${p.preco} e precisava mostrar pra você.`,
  };
  return opcoes[cat.id] || opcoes.geral;
}

function gerarAngulo(cat, p, curto) {
  const base = {
    cozinha: `Rotina real usando ${curto}: filme o antes (a dor) e o depois (a facilidade). Foque no visual satisfatório do produto funcionando.`,
    fitness: `Try-on honesto: vista, faça o teste de movimento e mostre o tecido de perto. Autenticidade converte mais que edição.`,
    saude: `Conte um problema pessoal que ${curto} ajudou a resolver. Tom de conversa, não de propaganda.`,
    beleza: `Formato "conselho de amiga": fale do problema como algo comum, mostre resultado e prometa discrição.`,
    eletronico: `Comparação direta: o produto ruim que você tinha vs. ${curto}. Use números na tela (tempo, velocidade).`,
    casa: `Antes e depois do ambiente. Mostre como algo barato muda o conforto ou a organização do espaço.`,
    pet: `Reação do pet em primeiro plano — fofura vende. Mostre você economizando sem abrir mão do cuidado.`,
    geral: `Mostre o problema nos primeiros segundos e ${curto} resolvendo logo em seguida. Ritmo rápido.`,
  };
  return base[cat.id] || base.geral;
}

function gerarCTA(cat, p) {
  const emoji = {
    cozinha: "🛒", fitness: "👇", saude: "🌙", beleza: "🤫",
    eletronico: "🔌", casa: "🏠", pet: "🐾", geral: "🛒",
  }[cat.id];
  const frases = {
    cozinha: `Link na sacolinha ${emoji} corre que tá com ${p.comissao}% de desconto pra você.`,
    fitness: `Achei na Shopee, link aqui embaixo ${emoji}`,
    saude: `Original, link na sacolinha ${emoji}`,
    beleza: `Salva esse vídeo e corre no link ${emoji}`,
    eletronico: `Para de sofrer com coisa vagabunda, link aqui ${emoji}`,
    casa: `Link na descrição ${emoji} seu cantinho merece.`,
    pet: `Link na sacolinha ${emoji} seu pet agradece.`,
    geral: `Link na sacolinha ${emoji} não perde essa.`,
  };
  return frases[cat.id] || frases.geral;
}

function gerarScript(cat, p, curto) {
  // Script pensado para YouTube Create / Shorts — falado, com marcações de cena.
  // Objetivo: caber abaixo de 901 caracteres com folga.
  const gancho = gerarGancho(cat, p, curto).replace(/\.$/, "");
  const cta = gerarCTA(cat, p);

  let s = `[0-3s] ${gancho}.\n`;
  s += `[3-8s] Sabe quando dá aquela raiva de ${cat.dor}? Eu vivia isso.\n`;
  s += `[8-18s] Aí testei ${curto} — R$${p.preco}, ${p.rating}⭐ e mais de ${p.vendas} vendas. `;
  s += `${cat.cenaGancho[0].toUpperCase() + cat.cenaGancho.slice(1)}.\n`;
  s += `[18-25s] O melhor: ${cat.beneficio}, gastando quase nada.\n`;
  s += `[25-30s] ${cta}\n`;
  s += cat.hashtags;

  // Garante o limite de 901 caracteres
  if (s.length > 900) {
    s = `[0-3s] ${gancho}.\n`;
    s += `[3-10s] Cansei de ${cat.dor}. Testei ${curto} — R$${p.preco}, ${p.rating}⭐.\n`;
    s += `[10-22s] ${cat.cenaGancho[0].toUpperCase() + cat.cenaGancho.slice(1)}. ${cat.beneficio[0].toUpperCase() + cat.beneficio.slice(1)}.\n`;
    s += `[22-30s] ${cta}\n${cat.hashtags}`;
  }
  return s;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Use POST" });
  }
  const p = req.body?.produto;
  if (!p || !p.produto) {
    return res.status(400).json({ erro: "Envie os dados do produto no corpo." });
  }

  const cat = categorizar(p.produto);
  const curto = nomeCurto(p.produto);

  const script = gerarScript(cat, p, curto);

  res.status(200).json({
    categoria: cat.id,
    gancho: gerarGancho(cat, p, curto),
    angulo: gerarAngulo(cat, p, curto),
    cta: gerarCTA(cat, p),
    script,
    caracteres: script.length,
    link_afiliado: p.link_afiliado,
    link_produto: p.link_produto,
  });
}
