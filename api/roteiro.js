// Gera LEGENDA (com 5 hashtags virais) e DOIS prompts de video de 8 segundos
// (YouTube Create e Google Flow), cada um com no maximo 900 caracteres.
// Falas family friendly. Sem IA generativa — templates por categoria.

const CATEGORIAS = [
  {
    id: "cozinha",
    kws: ["cozedor","ovos","cozinha","panela","fatiador","descasca","utensi","tábua","ralador","tapioc","boleira","forma","assadeira","air fryer","liquidificador","marmita"],
    desejo: "praticidade que transforma a rotina na cozinha",
    cena: "o produto em ação preparando algo apetitoso, em cima de uma bancada limpa e iluminada",
    fala: "Isso mudou a minha cozinha!",
    hashtags: ["#achadinhosdacozinha","#cozinhapratica","#shopeeachados","#dicasdecozinha","#receitafacil"],
  },
  {
    id: "fitness",
    kws: ["academia","fitness","top","calça","legging","suplex","conjunto fitness","short 2 em 1","compressão","modeladora","cinta"],
    desejo: "confiança e caimento perfeito no treino",
    cena: "uma pessoa vestindo a roupa e se movimentando com segurança em frente ao espelho de uma academia",
    fala: "Caimento perfeito e sem transparência!",
    hashtags: ["#modafitness","#lookdetreino","#fitnessbrasil","#shopeefinds","#roupadeacademia"],
  },
  {
    id: "saude",
    kws: ["melatonina","colágeno","vitamina","suplemento","cápsula","whey","creatina","ômega","chá","proteína","protein","pote 900","suplement"],
    desejo: "mais energia, bem-estar e disposição no dia a dia",
    cena: "uma pessoa acordando descansada e sorrindo, com luz suave da manhã entrando pela janela",
    fala: "Minha disposição mudou completamente!",
    hashtags: ["#bemestar","#autocuidado","#vidasaudavel","#saudeequalidade","#shopeeachadinhos"],
  },
  {
    id: "beleza",
    kws: ["sérum","skincare","clareador","hidratante","protetor","shampoo","máscara","batom","base","axila","virilha","perfume","creme"],
    desejo: "resultado visível na pele e autoestima renovada",
    cena: "close no rosto ou na pele mostrando textura suave e luminosa, com aplicação delicada do produto",
    fala: "O resultado me surpreendeu!",
    hashtags: ["#skincarebrasil","#cuidadoscomapele","#belezanatural","#autoestima","#shopeebeleza"],
  },
  {
    id: "eletronico",
    kws: ["fone","bluetooth","carregador","cabo","led","usb","suporte","luminária","câmera","smart","fonte tipo c","lâmpada","fita led","ventilador"],
    desejo: "resolver de vez um probleminha chato do dia a dia",
    cena: "o produto funcionando em close, com detalhes tecnológicos e um ambiente moderno ao fundo",
    fala: "Como eu vivia sem isso?",
    hashtags: ["#gadgets","#tecnologia","#achadinhostech","#shopeefinds","#novidades"],
  },
  {
    id: "casa",
    kws: ["manta","cobertor","lençol","lixeira","organizador","cabide","toalha","tapete","cortina","luminária","decoração","arandela","espelho","boleira"],
    desejo: "deixar a casa mais bonita e aconchegante gastando pouco",
    cena: "um cantinho da casa antes simples e depois transformado e aconchegante com o produto",
    fala: "Meu cantinho ficou perfeito!",
    hashtags: ["#decoração","#organização","#casadosonhos","#achadinhosdecasa","#shopeedecor"],
  },
  {
    id: "pet",
    kws: ["pet","cachorro","gato","ração","coleira","comedouro","brinquedo pet"],
    desejo: "cuidar do pet com carinho gastando menos",
    cena: "um pet feliz e fofo interagindo com o produto, com uma pessoa sorrindo ao lado",
    fala: "Meu pet aprovou na hora!",
    hashtags: ["#petlovers","#cachorros","#gatos","#vidadepet","#shopeepet"],
  },
  {
    id: "maternidade",
    kws: ["bebê","maternidade","gestante","fralda","mamadeira","infantil","criança","organizador mala"],
    desejo: "facilitar a vida de quem cuida de um bebê",
    cena: "um ambiente delicado de quarto de bebê, com o produto sendo usado com cuidado e carinho",
    fala: "Facilitou demais a minha rotina!",
    hashtags: ["#maternidade","#enxovaldebebe","#maedemenino","#maedemenina","#shopeebebe"],
  },
];

const GENERICA = {
  id: "geral",
  desejo: "resolver um problema do dia a dia por um preço que cabe no bolso",
  cena: "o produto sendo usado de forma prática e satisfatória, bem iluminado e em foco",
  fala: "Não acredito que achei por esse preço!",
  hashtags: ["#achadinhos","#shopeebrasil","#ofertas","#dicasdecompra","#novidades"],
};

function categorizar(nome) {
  const n = (nome || "").toLowerCase();
  for (const c of CATEGORIAS) {
    if (c.kws.some((k) => n.includes(k))) return c;
  }
  return GENERICA;
}

function nomeCurto(nome) {
  let base = (nome || "").split(/[|\-\u2013\u2014]/)[0].trim();
  base = base.replace(/\{.*?\}/g, "").replace(/\s+/g, " ").trim();
  return base.split(" ").slice(0, 6).join(" ") || "esse produto";
}

function gerarLegenda(cat, p, curto) {
  const aberturas = {
    cozinha: "Corre que esse achadinho vai transformar sua cozinha! \ud83d\ude0d",
    fitness: "O look de treino que você procurava existe (e é baratinho)! \ud83d\udcaa",
    saude: "Se cuidar nunca foi tão fácil e acessível \u2728",
    beleza: "A dica de beleza que ninguém te contou \ud83e\udd2b",
    eletronico: "Você precisa disso e ainda nem sabe \ud83d\udc40",
    casa: "Transforme seu cantinho gastando pouco \ud83c\udfe1",
    pet: "Seu pet merece esse mimo \ud83d\udc3e",
    maternidade: "A vida de mãe ficou muito mais fácil \ud83d\udc95",
    geral: "Esse achadinho vale cada centavo! \ud83d\uded2",
  };
  const abertura = aberturas[cat.id] || aberturas.geral;
  const corpo = `${curto} por R$${p.preco} — ${cat.desejo}. Mais de ${p.vendas} pessoas já garantiram o seu! Link na sacolinha \ud83d\uded2`;
  const tags = cat.hashtags.join(" ");
  return `${abertura}\n\n${corpo}\n\n${tags}`;
}

function cortar900(txt) {
  if (txt.length <= 900) return txt;
  return txt.slice(0, 897).trimEnd() + "...";
}

function promptYouTubeCreate(cat, p, curto) {
  const t =
`Vídeo vertical de 8 segundos para divulgar "${curto}" (produto de ${cat.id}).
GANCHO VISUAL (0-2s): ${cat.cena[0].toUpperCase() + cat.cena.slice(1)}. Movimento de câmera aproximando no produto.
GANCHO DE FALA (0-2s): narração animada dizendo "${cat.fala}".
DESENVOLVIMENTO (2-6s): mostrar o produto em uso destacando ${cat.desejo}. Texto na tela: "R$${p.preco}" e "${p.vendas}+ vendidos".
FECHAMENTO (6-8s): produto em close com selo de oferta. Texto na tela: "Link na sacolinha". Narração: "Corre que tá em promoção!".
ESTILO: iluminação clara, cores vivas, ritmo dinâmico, trilha animada. Falas em português, tom leve e family friendly.`;
  return cortar900(t);
}

function promptGoogleFlow(cat, p, curto) {
  const t =
`Vídeo cinematográfico vertical 9:16, duração 8 segundos, para anúncio de "${curto}".
Cena: ${cat.cena}. Câmera inicia em plano fechado e faz um movimento suave de revelação do produto nos primeiros 2 segundos (gancho visual).
Ação: nos segundos 2 a 6, o produto é usado de forma natural, transmitindo ${cat.desejo}. Expressão de satisfação genuína.
Áudio: voz feminina jovem e simpática em português dizendo "${cat.fala}" no início, tom family friendly, sem gírias.
Segundos 6 a 8: close final no produto com boa iluminação e clima convidativo.
Estilo visual: luz natural suave, cores quentes e vibrantes, foco nítido no produto, estética de review autêntico de rede social.`;
  return cortar900(t);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ erro: "Use POST" });
  const p = req.body?.produto;
  if (!p || !p.produto) return res.status(400).json({ erro: "Envie os dados do produto." });

  const cat = categorizar(p.produto);
  const curto = nomeCurto(p.produto);

  const legenda = gerarLegenda(cat, p, curto);
  const promptYT = promptYouTubeCreate(cat, p, curto);
  const promptFlow = promptGoogleFlow(cat, p, curto);

  res.status(200).json({
    categoria: cat.id,
    legenda,
    prompt_youtube: promptYT,
    prompt_youtube_chars: promptYT.length,
    prompt_flow: promptFlow,
    prompt_flow_chars: promptFlow.length,
    link_afiliado: p.link_afiliado,
    link_produto: p.link_produto,
  });
}
