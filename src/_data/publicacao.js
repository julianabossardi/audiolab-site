// Conteúdo que depende de autorização da equipe (briefing, seção 11).
// No servidor local (npx @11ty/eleventy --serve) tudo aparece, para a
// equipe revisar. No build de publicação (Vercel) só aparece o que está
// marcado como true aqui. Troque para true quando a autorização chegar.
const preview = process.env.ELEVENTY_RUN_MODE === "serve" || process.env.ELEVENTY_RUN_MODE === "watch";

const autorizado = {
  // Nomes e fotos da aba Pessoas: seção "Quem faz parte" no Sobre, equipe
  // nas páginas de projeto e nomes nos temas de pesquisa do JONAMI.
  pessoas: false,
  // Definições dos conceitos do JONAMI, ainda em rascunho.
  conceitos: false,
};

module.exports = () => ({
  preview,
  pessoas: preview || autorizado.pessoas,
  conceitos: preview || autorizado.conceitos,
});
