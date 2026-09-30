// Leitura dos JSON de content/ para os arquivos de src/_data.
const fs = require("fs");
const path = require("path");

const CONTENT = path.join(__dirname, "../content");

function readFile(name) {
  const file = path.join(CONTENT, name);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Coleção de uma pasta: cada arquivo vira um item com slug = nome do
// arquivo. Ordena pelo campo "ordem" (vindo da planilha) e depois pelo nome.
function readFolder(folder) {
  const dir = path.join(CONTENT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ slug: f.replace(/\.json$/, ""), ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }))
    .sort((a, b) => (Number(a.ordem) || 999) - (Number(b.ordem) || 999) || String(a.nome).localeCompare(String(b.nome), "pt-BR"));
}

module.exports = { readFile, readFolder };
