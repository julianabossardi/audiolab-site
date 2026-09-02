const fs = require("fs");
const path = require("path");

module.exports = () => {
  const dir = path.join(__dirname, "../../content/noticias");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      const slug = f.replace(/\.json$/, "");
      return { slug, ...data };
    })
    .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
};
