const { brandFor } = require("./src/_data/projectBrands.js");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Looks up a project by its exact "nome" — usado pra achar o projeto de
  // uma notícia relacionada.
  eleventyConfig.addFilter("findByNome", (list, nome) => (list || []).find((p) => p.nome === nome) || null);

  // News items that reference a given project slug via "projeto_relacionado"
  // — feeds the linked-news carousel on that project's own page.
  eleventyConfig.addFilter("relatedNoticias", (list, slug) => (list || []).filter((n) => n.projeto_relacionado === slug));

  eleventyConfig.addFilter("formatDate", (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  });

  // Cor-código do projeto (AudioLab, Ateliê, BadaUERJ, Escola de Narradores
  // ou o acento padrão pra um projeto novo ainda sem decisão registrada).
  eleventyConfig.addFilter("brand", (nome) => brandFor(nome));

  // Primeiros N itens de uma lista — o "slice" nativo do Nunjucks divide a
  // lista em N grupos (partição), não corta os N primeiros.
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
