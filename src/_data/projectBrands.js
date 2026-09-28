// Cores-código fixas do sistema AudioLab (docs/audiolab/DESIGN.md, Parte 1).
// Estrutura fixa, cor variável: todo projeto reconhecido aqui usa os tokens
// oficiais. Um projeto novo, sem cor-código decidida ainda, cai no acento
// do próprio AudioLab (petróleo + limão) até que o laboratório registre a
// decisão em guidelines/50-excecoes-e-decisoes.md.
const BRANDS = [
  {
    key: "audiolab",
    match: ["audiolab"],
    sigla: "AL",
    tipo: "Laboratório de Áudio",
    base: "var(--petrol-700)",
    on: "var(--lime-500)",
    soft: "var(--petrol-100)",
    text: "var(--petrol-700)",
    dark: "var(--petrol-800)",
  },
  {
    key: "atelie",
    match: ["ateliê do podcast", "atelie do podcast", "ateliê", "atelie"],
    sigla: "AP",
    tipo: "Projeto de extensão",
    base: "var(--atelie)",
    on: "var(--on-atelie)",
    soft: "var(--atelie-soft)",
    text: "var(--atelie)",
    dark: "var(--atelie-dark)",
  },
  {
    key: "bada",
    match: ["badauerj", "bada uerj", "bada"],
    sigla: "BU",
    tipo: "Projeto de extensão",
    base: "var(--bada)",
    on: "var(--on-bada)",
    soft: "var(--bada-soft)",
    text: "var(--bada-text)",
    dark: "var(--bada-dark)",
  },
  {
    key: "escola",
    match: ["escola de narradores", "escola"],
    sigla: "EN",
    tipo: "Projeto de extensão",
    base: "var(--escola)",
    on: "var(--on-escola)",
    soft: "var(--escola-soft)",
    text: "var(--escola-text)",
    dark: "var(--escola-dark)",
  },
];

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function brandFor(nome) {
  const n = normalize(nome);
  const found = BRANDS.find((b) => b.match.some((m) => n === m || n.includes(m)));
  if (found) return found;
  const words = (nome || "").split(/\s+/).filter(Boolean);
  const sigla = words.length ? (words[0][0] + (words[1] ? words[1][0] : "")).toUpperCase() : "AL";
  return { ...BRANDS[0], key: "audiolab", sigla };
}

module.exports = { BRANDS, brandFor };
