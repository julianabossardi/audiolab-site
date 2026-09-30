const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const { brandFor, slugify } = require("./src/_data/projectBrands.js");

// Caminho público → arquivo no disco, para conferir se a imagem existe.
const PUBLIC_DIRS = { "/uploads/": "uploads/", "/assets/": "src/assets/" };

function existingImage(src) {
  if (!src) return "";
  if (/^https?:\/\//.test(src)) return src;
  const prefix = Object.keys(PUBLIC_DIRS).find((p) => src.startsWith(p));
  if (!prefix) return "";
  const file = path.join(__dirname, PUBLIC_DIRS[prefix], decodeURIComponent(src.slice(prefix.length)));
  return fs.existsSync(file) ? src : "";
}

// Markdown do corpo das notícias. Imagem ausente vira espaço marcado.
const md = markdownIt({ html: false, linkify: true, breaks: true });
md.renderer.rules.image = (tokens, idx) => {
  const t = tokens[idx];
  const src = existingImage(t.attrGet("src"));
  const alt = md.utils.escapeHtml(t.content || "");
  if (!src) return '<span class="dsm-placeholder ratio-16-9" role="img" aria-label="Imagem a definir">[imagem 16:9]</span>';
  return '<img src="' + md.utils.escapeHtml(src) + '" alt="' + alt + '" loading="lazy" />';
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Devolve o caminho da imagem só se o arquivo existir. Vazio faz o
  // modelo mostrar o espaço marcado: nunca um ícone de imagem quebrada.
  eleventyConfig.addFilter("img", existingImage);
  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));

  eleventyConfig.addFilter("slugify", slugify);

  // Notícias que citam um projeto em "projeto_relacionado".
  eleventyConfig.addFilter("relatedNoticias", (list, slug) => (list || []).filter((n) => n.projeto_relacionado === slug));

  eleventyConfig.addFilter("formatDate", (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  });

  // Cor-código, sigla e logo padrão do projeto (src/_data/projectBrands.js).
  eleventyConfig.addFilter("brand", (nome) => brandFor(nome));

  // Primeiros N itens de uma lista. O "slice" nativo do Nunjucks divide a
  // lista em N grupos, não corta os N primeiros.
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
