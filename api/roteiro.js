// Gera LEGENDA (5 frases + 5 hashtags) e 4 PROMPTS de vídeo de 8s (<=900 chars):
//  - Com fala de IA (YouTube Create e Google Flow)
//  - Só visual, sem fala, com texto na tela (YouTube Create e Google Flow)
// IMPORTANTE: os prompts NÃO citam marca nem preço.

const CATEGORIAS = [
  { id:"natal", kws:["natal","enfeite natal","pisca","árvore natal","arvore natal","presente natal","guirlanda","papai noel","enfeite","natalino"],
    desejo:"deixar o Natal mágico e aconchegante", cena:"um ambiente decorado para o Natal com luzes quentes brilhando e clima festivo",
    fala:"O Natal chegou mais cedo!", tela:"CLIMA DE NATAL", hashtags:["#natal","#decoracaodenatal","#natal2025","#christmas","#festas"] },
  { id:"cozinha", kws:["cozedor","ovos","cozinha","panela","fatiador","descasca","utensi","tábua","ralador","tapioc","boleira","forma","assadeira","air fryer","liquidificador","marmita"],
    desejo:"a praticidade que transforma a rotina", cena:"o produto em ação preparando algo apetitoso numa bancada limpa e iluminada",
    fala:"Isso mudou a minha cozinha!", tela:"VOCÊ PRECISA DISSO", hashtags:["#achadinhosdacozinha","#cozinhapratica","#dicasdecozinha","#organização","#receitafacil"] },
  { id:"fitness", kws:["academia","fitness","top fitness","legging","suplex","conjunto fitness","short 2 em 1","compressão","modeladora","cinta"],
    desejo:"a confiança de um caimento perfeito", cena:"uma pessoa vestindo a roupa e se movimentando com segurança em frente ao espelho",
    fala:"Caimento perfeito e nada transparente!", tela:"O LOOK QUE FALTAVA", hashtags:["#modafitness","#lookdetreino","#fitnessbrasil","#treino","#academia"] },
  { id:"moda_feminina", kws:["vestido","blusa feminina","saia","conjunto feminino","cropped","macacão","bolsa feminina"],
    desejo:"aquele look que rende elogios", cena:"uma pessoa provando a peça e girando, com boa luz e fundo clean",
    fala:"Amei esse look!", tela:"LOOK DO DIA", hashtags:["#modafeminina","#lookdodia","#tendência","#ootd","#estilo"] },
  { id:"saude", kws:["melatonina","colágeno","vitamina","suplemento","cápsula","whey","creatina","ômega","chá","proteína","protein","pote 900"],
    desejo:"mais energia e bem-estar no dia a dia", cena:"uma pessoa acordando disposta e sorrindo com luz suave da manhã",
    fala:"Minha disposição mudou!", tela:"SUA ROTINA VAI MUDAR", hashtags:["#bemestar","#autocuidado","#vidasaudavel","#saude","#disposição"] },
  { id:"beleza", kws:["sérum","serum","skincare","clareador","hidratante","protetor","shampoo","máscara","batom","base","axila","virilha","perfume","creme"],
    desejo:"um resultado visível e autoestima renovada", cena:"close na pele mostrando textura suave e luminosa com aplicação delicada",
    fala:"O resultado me surpreendeu!", tela:"NINGUÉM TE CONTOU ISSO", hashtags:["#skincare","#belezanatural","#cuidadoscomapele","#autoestima","#pele"] },
  { id:"eletronico", kws:["fone","bluetooth","carregador","cabo","led","usb","suporte","luminária","câmera","smart","fonte tipo c","lâmpada","ventilador"],
    desejo:"resolver de vez um probleminha chato", cena:"o produto funcionando em close com detalhes tecnológicos e ambiente moderno",
    fala:"Como eu vivia sem isso?", tela:"ISSO É GENIAL", hashtags:["#gadgets","#tecnologia","#achadinhostech","#novidades","#tech"] },
  { id:"casa", kws:["manta","cobertor","lençol","lixeira","organizador","cabide","toalha","tapete","cortina","luminária","decoração","arandela","espelho","almofada"],
    desejo:"deixar a casa mais bonita e aconchegante", cena:"um cantinho da casa antes simples e depois transformado e aconchegante",
    fala:"Meu cantinho ficou perfeito!", tela:"TRANSFORME SEU CANTINHO", hashtags:["#decoração","#organização","#casa","#homedecor","#aconchego"] },
  { id:"pet", kws:["pet","cachorro","gato","ração","coleira","comedouro"],
    desejo:"cuidar do pet com muito carinho", cena:"um pet feliz e fofo interagindo com o produto e uma pessoa sorrindo ao lado",
    fala:"Meu pet aprovou na hora!", tela:"SEU PET VAI AMAR", hashtags:["#petlovers","#cachorros","#gatos","#vidadepet","#pet"] },
  { id:"bebe", kws:["bebê","maternidade","gestante","fralda","mamadeira","infantil","criança","enxoval"],
    desejo:"facilitar a vida de quem cuida de um bebê", cena:"um ambiente delicado de quarto de bebê com o produto usado com carinho",
    fala:"Facilitou demais a rotina!", tela:"MÃES VÃO AMAR", hashtags:["#maternidade","#enxovaldebebe","#maedemenina","#maedemenino","#bebe"] },
];

const GENERICA = { id:"geral", desejo:"resolver um problema do dia a dia", cena:"o produto sendo usado de forma prática e satisfatória, bem iluminado e em foco",
  fala:"Não acredito que existia isso!", tela:"VOCÊ PRECISA VER ISSO", hashtags:["#achadinhos","#novidades","#dicas","#tendência","#compras"] };

function categorizar(nome){ const n=(nome||"").toLowerCase(); for(const c of CATEGORIAS){ if(c.kws.some(k=>n.includes(k))) return c; } return GENERICA; }
function nomeGenerico(cat){
  const map={cozinha:"esse utensílio de cozinha",fitness:"essa roupa de treino",moda_feminina:"essa peça",saude:"esse suplemento",
    beleza:"esse produto de beleza",eletronico:"esse gadget",casa:"esse item de decoração",pet:"esse item para pet",bebe:"esse item para bebê",
    natal:"essa decoração de Natal",geral:"esse produto"};
  return map[cat.id]||"esse produto";
}
function cortar900(t){ return t.length<=900 ? t : t.slice(0,897).trimEnd()+"..."; }

// ---- LEGENDA: exatamente 5 frases + 5 hashtags ----
function gerarLegenda(cat, p){
  const g = nomeGenerico(cat);
  const f1 = cat.fala;
  const f2 = `Descobri ${g} e não largo mais.`;
  const f3 = `${cat.desejo[0].toUpperCase()+cat.desejo.slice(1)} de verdade.`;
  const f4 = `Já são mais de ${p.vendas} pessoas que aprovaram.`;
  const f5 = `Corre pra garantir o seu pelo link na sacolinha! 🛒`;
  const frases = [f1,f2,f3,f4,f5].join(" ");
  const tags = cat.hashtags.slice(0,5).join(" ");
  return `${frases}\n\n${tags}`;
}

// ---- PROMPT COM FALA (IA) — sem marca e sem preço ----
function promptFalaYouTube(cat){
  const g = nomeGenerico(cat);
  return cortar900(
`Vídeo vertical 9:16 de 8 segundos, estilo review autêntico para redes sociais, com narração por voz de IA em português (family friendly, sem gírias).
GANCHO VISUAL (0-2s): ${cat.cena}. Câmera aproxima no produto.
GANCHO DE FALA (0-2s): voz animada dizendo "${cat.fala}".
DESENVOLVIMENTO (2-6s): mostrar ${g} em uso, transmitindo ${cat.desejo}. TEXTO NA TELA: "${cat.tela}".
FECHAMENTO (6-8s): close final no produto. TEXTO NA TELA: "Link na sacolinha". Narração: "Você precisa conhecer".
IMPORTANTE: não citar marca nem preço. Iluminação clara, cores vivas, ritmo dinâmico, trilha alegre.`);
}
function promptFalaFlow(cat){
  const g = nomeGenerico(cat);
  return cortar900(
`Cinematic vertical video 9:16, 8 seconds, authentic social-media review style. Voz de IA em português, tom simpático e family friendly.
Cena (0-2s): ${cat.cena}. Movimento suave de câmera revelando o produto (gancho visual).
Fala (0-2s): voz feminina jovem dizendo "${cat.fala}".
Ação (2-6s): ${g} sendo usado de forma natural, transmitindo ${cat.desejo}, expressão de satisfação. Texto sobreposto: "${cat.tela}".
Final (6-8s): close no produto com boa luz e clima convidativo, texto "Link na sacolinha".
IMPORTANTE: não mencionar marca nem preço. Luz natural suave, cores quentes e vibrantes, foco nítido.`);
}

// ---- PROMPT SÓ VISUAL (sem fala) — texto na tela gerando desejo ----
function promptVisualYouTube(cat){
  const g = nomeGenerico(cat);
  return cortar900(
`Vídeo vertical 9:16 de 8 segundos, SEM narração e SEM fala, apenas música alegre e TEXTO NA TELA. Estilo satisfatório para redes sociais.
0-2s: ${cat.cena}. Texto grande na tela: "${cat.tela}".
2-5s: sequência de closes mostrando ${g} em uso, ângulos dinâmicos, transmitindo ${cat.desejo}. Texto: "OLHA QUE INCRÍVEL".
5-8s: close final satisfatório do produto. Texto: "CORRE PRO LINK 🛒".
IMPORTANTE: nenhuma voz, nenhuma marca, nenhum preço. Cortes rápidos no ritmo da música, cores vivas, imagem nítida e chamativa.`);
}
function promptVisualFlow(cat){
  const g = nomeGenerico(cat);
  return cortar900(
`Cinematic vertical video 9:16, 8 seconds, NO voice and NO speech — only upbeat music and ON-SCREEN TEXT. Satisfying social-media aesthetic.
0-2s: ${cat.cena}. Bold on-screen text: "${cat.tela}".
2-5s: dynamic close-up sequence of ${g} in use, satisfying angles, conveying ${cat.desejo}. On-screen text: "OLHA QUE INCRÍVEL".
5-8s: final satisfying close-up of the product. On-screen text: "CORRE PRO LINK".
IMPORTANT: no voice, no brand, no price. Fast cuts synced to music, vibrant warm colors, crisp appealing footage.`);
}

export default async function handler(req, res){
  if(req.method!=="POST") return res.status(405).json({erro:"Use POST"});
  const p = req.body?.produto;
  if(!p || !p.produto) return res.status(400).json({erro:"Envie os dados do produto."});
  const cat = categorizar(p.produto);

  const out = {
    categoria: cat.id,
    legenda: gerarLegenda(cat, p),
    com_fala: {
      youtube_create: promptFalaYouTube(cat),
      google_flow: promptFalaFlow(cat),
    },
    so_visual: {
      youtube_create: promptVisualYouTube(cat),
      google_flow: promptVisualFlow(cat),
    },
    link_afiliado: p.link_afiliado,
    link_produto: p.link_produto,
  };
  // adiciona contagem de caracteres de cada prompt
  out.chars = {
    fala_yt: out.com_fala.youtube_create.length,
    fala_flow: out.com_fala.google_flow.length,
    visual_yt: out.so_visual.youtube_create.length,
    visual_flow: out.so_visual.google_flow.length,
  };
  res.status(200).json(out);
}
