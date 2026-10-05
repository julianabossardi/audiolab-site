const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const { brandFor, slugify, PRINCIPAIS } = require("./src/_data/projectBrands.js");

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
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Os JSON de conteúdo ficam fora de src/: sem isso, editar pelo /admin
  // ou rodar a importação não atualiza o servidor local.
  eleventyConfig.addWatchTarget("./content/");

  // Devolve o caminho da imagem só se o arquivo existir. Vazio faz o
  // modelo mostrar o espaço marcado: nunca um ícone de imagem quebrada.
  eleventyConfig.addFilter("img", existingImage);
  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));

  eleventyConfig.addFilter("slugify", slugify);

  // Resumo para meta description: tira markdown e links, junta espaços e
  // corta em ~155 caracteres sem quebrar palavra (o Google corta ali).
  eleventyConfig.addFilter("resumo", (text, max = 155) => {
    const t = String(text || "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[#*_>`~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (t.length <= max) return t;
    const corte = t.slice(0, max - 1);
    return corte.slice(0, corte.lastIndexOf(" ") > 80 ? corte.lastIndexOf(" ") : corte.length).replace(/[\s,.;:–-]+$/, "") + "…";
  });

  // JSON para <script type="application/ld+json"> (dados estruturados).
  eleventyConfig.addFilter("json", (obj) => JSON.stringify(obj).replace(/</g, "\\u003c"));

  // Notícias que citam um projeto em "projeto_relacionado".
  eleventyConfig.addFilter("relatedNoticias", (list, slug) => (list || []).filter((n) => n.projeto_relacionado === slug));

  eleventyConfig.addFilter("dataIso", (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toISOString().slice(0, 10); });

  eleventyConfig.addFilter("rssDate", (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toUTCString(); });

  eleventyConfig.addFilter("formatDate", (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  });

  // Os três projetos principais, na ordem do herói da home.
  eleventyConfig.addFilter("principais", (projetos) =>
    PRINCIPAIS.map((slug) => (projetos || []).find((p) => p.slug === slug)).filter(Boolean)
  );

  // Pessoas de um projeto: as ligadas a ele e as marcadas "Todos os projetos".
  eleventyConfig.addFilter("pessoasDoProjeto", (pessoas, nome) =>
    (pessoas || []).filter((p) => (p.projetos || []).some((x) => x === nome || x === "Todos os projetos"))
  );

  // "o BadaUERJ", "a Escola de Narradores", "A Gente da Ciência".
  eleventyConfig.addFilter("comArtigo", (nome) => {
    const artigo = brandFor(nome).artigo;
    return artigo ? artigo + " " + nome : nome;
  });

  // Link do YouTube → endereço de incorporação sem cookies, sem autoplay.
  eleventyConfig.addFilter("youtubeEmbed", (url) => {
    if (!url) return "";
    let u;
    try { u = new URL(url); } catch { return ""; }
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
      else if (/^\/(embed|shorts|live)\//.test(u.pathname)) id = u.pathname.split("/")[2];
      else if (u.pathname === "/playlist" && u.searchParams.get("list")) return "https://www.youtube-nocookie.com/embed/videoseries?list=" + encodeURIComponent(u.searchParams.get("list"));
    }
    return /^[\w-]{6,}$/.test(id) ? "https://www.youtube-nocookie.com/embed/" + id : "";
  });

  // Eventos com data válida (dd/mm/aaaa) de hoje em diante, em ordem.
  // Ganham "iso" para o navegador conferir de novo, já que o site é estático.
  eleventyConfig.addFilter("eventosFuturos", (eventos) => {
    const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    return (eventos || [])
      .map((e) => {
        const m = String(e.data || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!m) return null;
        const iso = m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
        return isNaN(new Date(iso)) ? null : { ...e, iso };
      })
      .filter((e) => e && e.iso >= hoje)
      .sort((a, b) => a.iso.localeCompare(b.iso));
  });

  // Episódios e conteúdos: com data (dd/mm/aaaa) primeiro, do mais recente
  // ao mais antigo; sem data, na ordem da planilha, depois dos datados.
  eleventyConfig.addFilter("ordenarConteudos", (itens) => {
    const iso = (d) => {
      const m = String(d || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      return m ? m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0") : "";
    };
    return (itens || [])
      .map((c, i) => ({ ...c, iso: iso(c.data), i }))
      .sort((a, b) => (a.iso && b.iso ? b.iso.localeCompare(a.iso) : a.iso ? -1 : b.iso ? 1 : a.i - b.i));
  });

  // Valores distintos de um campo, na ordem em que aparecem (vazios fora).
  eleventyConfig.addFilter("distinct", (list, key) => [...new Set((list || []).map((i) => i[key]).filter(Boolean))]);

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
