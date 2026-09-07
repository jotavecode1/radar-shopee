# Como publicar o Radar Shopee na Vercel

Você vai ter um site online, com endereço próprio, que faz tudo:
busca os produtos, mostra o ranking e gera o roteiro de vídeo ao clicar.

Não precisa saber programar. São ~10 minutos.

---

## O que você vai precisar

- Uma conta no GitHub (grátis) — https://github.com
- Uma conta na Vercel (grátis) — https://vercel.com (pode entrar com o GitHub)
- Seu App ID e Secret da Shopee Afiliados (os que já funcionaram no teste)

---

## Passo 1 — Suba os arquivos no GitHub

1. Entre em https://github.com e clique em **New repository** (botão verde).
2. Dê um nome, ex: `radar-shopee`. Deixe como **Private** se quiser.
3. Clique em **Create repository**.
4. Na página seguinte, clique em **uploading an existing file**.
5. Arraste TODOS os arquivos e pastas desta pasta (a pasta `shopee-site` inteira:
   as pastas `api` e `public`, mais os arquivos `vercel.json` e `package.json`).
   > Importante: suba a pasta `api` e a pasta `public` com os arquivos dentro.
6. Clique em **Commit changes**.

## Passo 2 — Conecte na Vercel

1. Entre em https://vercel.com e faça login com o GitHub.
2. Clique em **Add New... > Project**.
3. Encontre o repositório `radar-shopee` e clique em **Import**.
4. NÃO clique em Deploy ainda! Antes, abra a seção **Environment Variables**.

## Passo 3 — Coloque suas credenciais (parte mais importante)

Na seção **Environment Variables**, adicione DUAS variáveis:

| Name              | Value                          |
|-------------------|--------------------------------|
| `SHOPEE_APP_ID`   | seu app id (só números)        |
| `SHOPEE_SECRET`   | sua secret key                 |

- Digite o nome no campo "Name" e o valor no campo "Value", clique em **Add**.
- Faça isso para as duas.
- Assim suas credenciais ficam guardadas em segredo no servidor,
  nunca aparecem no site nem no código.

## Passo 4 — Publique

1. Clique em **Deploy**.
2. Espere ~1 minuto.
3. Quando aparecer o "Congratulations", clique em **Continue to Dashboard**
   ou no preview para abrir seu site.

Pronto! Seu site está no ar, com um endereço tipo
`https://radar-shopee.vercel.app`

---

## Como usar

1. Abra o site.
2. Clique em **Buscar produtos** (leva ~30 segundos).
3. Veja o ranking de produtos.
4. Clique em qualquer produto → abre o painel com gancho, ângulo,
   CTA e o script pronto (abaixo de 901 caracteres).
5. Use o botão **copiar** no script e o **link afiliado (seu)** para divulgar.

---

## Se algo der errado

- **"Credenciais não configuradas"**: você esqueceu de adicionar as
  Environment Variables (Passo 3). Vá em Settings > Environment Variables
  no painel da Vercel, adicione, e em Deployments clique em Redeploy.

- **"Shopee 10020: Invalid Signature"**: App ID e Secret não são o par certo,
  ou tem espaço sobrando. Confira os valores nas Environment Variables.

- **Erro de tempo / timeout**: reduza o número de páginas no site (de 4 para 2).

- **Quer mudar algo no site**: edite o arquivo no GitHub e a Vercel
  republica sozinha em segundos.

---

## Sobre o gerador de roteiro

O script é montado automaticamente a partir dos dados de cada produto
(categoria, preço, comissão, dor que resolve). Ele identifica se é cozinha,
fitness, beleza, eletrônico, casa, pet, saúde etc. e adapta gancho, ângulo
e CTA para aquele nicho. Todos os scripts saem abaixo de 901 caracteres,
prontos para o YouTube Create.

Se um dia você quiser scripts feitos por IA (mais criativos e variados),
dá pra ligar a API da Anthropic depois — é só me pedir que eu adiciono.
