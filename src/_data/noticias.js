const fs = require("fs");
const path = require("path");
const { slugify } = require("./projectBrands.js");

const MAX_SLUG = 60;

function encurtar(slug) {
  if (slug.length <= MAX_SLUG) return slug;
  const corte = slug.slice(0, MAX_SLUG);
  const ultimo = corte.lastIndexOf("-");
  return (ultimo > 20 ? corte.slice(0, ultimo) : corte).replace(/-+$/, "");
}

module.exports = () => {
  const dir = path.join(__dirname, "../../content/noticias");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      const arquivo = f.replace(/\.json$/, "");
      // "url_slug" (campo do CMS) troca o endereço da notícia. O endereço
      // antigo (nome do arquivo) continua funcionando, redirecionando.
      // Endereço curto: texto colado por engano no campo (ou no nome do
      // arquivo) vira link enorme, então cortamos em ~60 caracteres, sem
      // quebrar palavra. O endereço completo continua redirecionando.
      const completo = slugify(data.url_slug || "") || arquivo;
      const slug = encurtar(completo);
      const antigos = [...new Set([arquivo, completo])].filter((s) => s !== slug);
      return { ...data, slug, slug_antigo: antigos };
    })
    .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
};
