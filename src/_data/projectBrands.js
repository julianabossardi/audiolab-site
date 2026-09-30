// Cores-código dos projetos (audiolab-tokens.css e docs/decisoes.md).
// Estrutura fixa, cor variável: toda página e card de projeto lê daqui a
// chave de data-project, a sigla e o logo padrão.
//
// Os três projetos com identidade própria (BadaUERJ, Ateliê do Podcast,
// Escola de Narradores) usam as cores deles. Os demais variam dentro da
// família petróleo, com acento limão, sem verde para não confundir com a
// Escola. O AudioLab é o laboratório, não um projeto: fica como fallback.
//
// logoBg: fundo da placa do logo. Os logos do BadaUERJ e do AudioLab são
// só brancos e pedem fundo escuro; os do Ateliê e da Escola têm partes
// pretas e pedem placa branca.
const BRANDS = [
  { key: "bada", slug: "badauerj", sigla: "BU", tipo: "Projeto de extensão", logo: "/assets/img/logo-bada-crop.png", logoBg: "var(--bada-hero)" },
  { key: "atelie", slug: "atelie-do-podcast", sigla: "AP", tipo: "Projeto de extensão", logo: "/assets/img/logo-atelie-crop.png", logoBg: "var(--white)" },
  { key: "escola", slug: "escola-de-narradores", sigla: "EN", tipo: "Projeto de extensão", logo: "/assets/img/logo-escola-crop.png", logoBg: "var(--white)" },
  { key: "petrol-600", slug: "a-gente-da-ciencia", sigla: "GC", tipo: "Projeto" },
  { key: "petrol-800", slug: "radioatividade", sigla: "RA", tipo: "Projeto" },
  { key: "petrol-700", slug: "mergulhando", sigla: "MG", tipo: "Projeto" },
  { key: "petrol-600", slug: "uerj-no-ar", sigla: "UA", tipo: "Projeto" },
  { key: "petrol-800", slug: "audiolabgeo", sigla: "GE", tipo: "Projeto" },
  { key: "petrol-700", slug: "politica-nas-rampas", sigla: "PR", tipo: "Projeto" },
];

// Os três principais, na ordem em que aparecem no herói da home.
const PRINCIPAIS = ["badauerj", "atelie-do-podcast", "escola-de-narradores"];

function slugify(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Projeto novo, ainda sem decisão registrada: petróleo 700 e sigla com as
// iniciais das duas primeiras palavras significativas.
function fallback(nome) {
  const words = String(nome || "")
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w));
  const sigla = words.length ? (words[0][0] + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase() : "AL";
  return { key: "petrol-700", slug: slugify(nome), sigla, tipo: "Projeto" };
}

function brandFor(nome) {
  const slug = slugify(nome);
  const found = BRANDS.find((b) => b.slug === slug) || fallback(nome);
  return { logo: "", logoBg: "var(--project-hero)", principal: PRINCIPAIS.includes(found.slug), ...found };
}

module.exports = { BRANDS, PRINCIPAIS, brandFor, slugify };
