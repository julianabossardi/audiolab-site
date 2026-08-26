# Como testar localmente (sem precisar de conta no GitHub ainda)

Isso aqui é só pra você sentir o fluxo de edição na prática, antes de decidir
de vez. Nada disso está no ar — roda 100% no seu computador.

## Pré-requisito

Ter o Node.js instalado. Se não tiver, peça pro Claude Code checar e instalar.

## Passo a passo

Abra esta pasta no Claude Code (ou um terminal) e rode, na ordem:

1. `npm install`
   → instala o Eleventy, o "motor" que transforma o conteúdo em páginas.

2. `git init && git add . && git commit -m "início"`
   → o Decap precisa de um repositório git local pra funcionar, mesmo sem
   GitHub ainda.

3. Em um terminal, deixe rodando: `npx decap-server`
   → é a ponte entre o painel de admin e os arquivos locais.

4. Em outro terminal: `npx @11ty/eleventy --serve`
   → sobe o site local.

5. Abra `http://localhost:8080` → é o site (com o projeto de exemplo
   "UERJ no Ar" já aparecendo).

6. Abra `http://localhost:8080/admin/` → é o painel de edição. Crie um
   projeto novo, edite o de exemplo, ou apague — e veja o site atualizar
   sozinho.

## O que reparar enquanto testa

- O formulário em si: os campos fazem sentido? Falta algum campo que vocês
  usam sempre (ex.: mais de 3 estatísticas, mais de um vídeo)?
- A categoria (dropdown com as 4 tags) — é suficiente ou vai faltar
  subcategoria pra Cultura, como já foi levantado no mapa do site?
- Upload de imagem: arraste um arquivo no campo "Imagem de capa" e veja se
  aparece certinho na página do projeto.

## Quando estiver satisfeita com o teste

Aí a gente parte pra deixar isso no ar de verdade: criar o repositório no
GitHub, conectar a Netlify e apontar seu domínio. Essa parte eu te guio
passo a passo quando você quiser avançar — só não consigo criar essas
contas por você.
