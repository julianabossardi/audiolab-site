const fs = require("fs");
const path = require("path");
const { slugify } = require("./projectBrands.js");

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
      const slug = slugify(data.url_slug || "") || arquivo;
      return { ...data, slug, slug_antigo: slug !== arquivo ? arquivo : "" };
    })
    .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
};
