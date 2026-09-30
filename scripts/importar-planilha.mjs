// Importa a planilha de conteúdo do AudioLab para os JSON em content/.
//
// Uso:  npm run importar            (gera os arquivos)
//       npm run importar -- --limpar (também apaga JSON de projeto/pessoa
//                                     que não existem mais na planilha)
//
// Pode rodar de novo sempre que a planilha mudar. A planilha é a fonte:
// o que foi editado no /admin nesses arquivos é sobrescrito. Notícias,
// cabeçalho e rodapé não são tocados.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANILHA = path.join(ROOT, "conteudo/audiolab-planilha-conteudo-v2.xlsx");
const CONTENT = path.join(ROOT, "content");
const LIMPAR = process.argv.includes("--limpar");

const IGNORAR_ABAS = new Set(["LeiaMe", "Listas", "Guia"]);
const PARAMS_RASTREIO = [/^si$/, /^e$/, /^utm_/, /^fbclid$/, /^igsh$/];

// ── utilitários ──────────────────────────────────────────────

export function slugify(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function limparUrl(valor) {
  if (!/^https?:\/\//i.test(valor)) return valor;
  let url;
  try {
    url = new URL(valor);
  } catch {
    return valor;
  }
  for (const key of [...url.searchParams.keys()]) {
    if (PARAMS_RASTREIO.some((re) => re.test(key))) url.searchParams.delete(key);
  }
  return url.toString();
}

function texto(valor) {
  if (valor === null || valor === undefined) return "";
  return limparUrl(String(valor).trim());
}

function imagem(arquivo) {
  const nome = texto(arquivo);
  return nome ? `/uploads/${nome}` : "";
}

// "+7.400 | conteúdos publicados" → { numero, rotulo }
function parNumero(valor) {
  const [numero, ...resto] = String(valor).split("|");
  return { numero: numero.trim(), rotulo: resto.join("|").trim() };
}

// Lê uma aba como lista de objetos. Primeira linha é o cabeçalho, a
// coluna obs nunca vai para o site (fica em _obs, só para uso do script)
// e linhas vazias são ignoradas. Tudo é texto: números e anos saem como
// a planilha mostra, sem conversão.
function lerAba(wb, nome) {
  const ws = wb.Sheets[nome];
  if (!ws) throw new Error(`Aba "${nome}" não encontrada na planilha.`);
  const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false, blankrows: false });
  const [cabecalho, ...corpo] = linhas;
  const cols = cabecalho.map((c) => texto(c));
  return corpo
    .filter((linha) => linha.some((c) => texto(c) !== ""))
    .map((linha) => {
      const obj = {};
      cols.forEach((col, i) => {
        if (!col) return;
        if (col === "obs") obj._obs = texto(linha[i]);
        else obj[col] = texto(linha[i]);
      });
      return obj;
    });
}

// Abas no formato campo | valor | obs.
function lerCampos(wb, nome) {
  const campos = {};
  for (const linha of lerAba(wb, nome)) {
    if (linha.campo) campos[linha.campo] = { valor: linha.valor, obs: linha._obs || "" };
  }
  return campos;
}

function escreverJson(arquivo, dados) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2) + "\n");
}

function slugUnico(base, usados) {
  let slug = base || "item";
  let n = 2;
  while (usados.has(slug)) slug = `${base}-${n++}`;
  usados.add(slug);
  return slug;
}

// ── abas ─────────────────────────────────────────────────────

function importarProjetos(wb, avisos) {
  const projetos = lerAba(wb, "Projetos");
  const series = lerAba(wb, "Series");
  const conteudos = lerAba(wb, "Conteudos");
  const nomes = new Set(projetos.map((p) => p.nome));

  for (const s of series) if (!nomes.has(s.projeto)) avisos.push(`Series: projeto desconhecido "${s.projeto}" (${s.nome})`);
  for (const c of conteudos) if (!nomes.has(c.projeto)) avisos.push(`Conteudos: projeto desconhecido "${c.projeto}" (${c.titulo})`);

  const usados = new Set();
  return projetos
    .filter((p) => p.nome)
    .map((p, i) => {
      const estatisticas = [1, 2, 3]
        .map((n) => ({ numero: p[`estat${n}_numero`] || "", rotulo: p[`estat${n}_rotulo`] || "" }))
        .filter((s) => s.numero || s.rotulo);

      const redes = {};
      for (const rede of ["instagram", "spotify", "amazon_music", "youtube", "tiktok"]) {
        if (p[rede]) redes[rede] = p[rede];
      }

      const dados = {
        nome: p.nome,
        ordem: i + 1,
        tagline: p.frase_resumo,
        tag: p.categoria,
        o_que_e: p.o_que_e,
        historia_contexto: p.historia_contexto,
        fale_com_o_projeto: p.fale_com_o_projeto,
        coordenacao: p.coordenacao,
        ano_inicio: p.ano_inicio,
        email: p.email,
        redes,
        video: p.video_destaque,
        estatisticas,
        logo: imagem(p.logo_arquivo),
        capa: imagem(p.capa_arquivo),
        quadros: series
          .filter((s) => s.projeto === p.nome && s.nome)
          .map((s) => ({ nome: s.nome, descricao: s.descricao, link: s.link, imagem: imagem(s.imagem_arquivo) })),
        conteudos: conteudos
          .filter((c) => c.projeto === p.nome && c.titulo)
          .map((c) => ({ titulo: c.titulo, link: c.link, data: c.data || "" })),
      };
      return { slug: slugUnico(slugify(p.nome), usados), dados };
    });
}

function importarPessoas(wb) {
  const usados = new Set();
  return lerAba(wb, "Pessoas")
    .filter((p) => p.nome)
    .map((p, i) => ({
      slug: slugUnico(slugify(p.nome), usados),
      dados: {
        nome: p.nome,
        ordem: i + 1,
        funcao: p.funcao,
        foto: imagem(p.foto_arquivo),
        linkedin: p.linkedin,
        projetos: [p.projeto_1, p.projeto_2, p.projeto_3, p.projeto_4].filter(Boolean),
        periodo: p.periodo,
      },
    }));
}

function importarLaboratorio(wb) {
  const campos = lerCampos(wb, "Laboratorio");
  const lab = {};
  const estatisticas = [];
  const premios = [];

  for (const [campo, { valor, obs }] of Object.entries(campos)) {
    if (campo === "apoiadores") continue; // depende de autorização, nunca vai para o site
    if (/^lab_estat\d+$/.test(campo)) {
      if (/USAR NO SITE/i.test(obs) && valor) estatisticas.push(parNumero(valor));
      continue;
    }
    if (/^premio_\d+$/.test(campo)) {
      if (valor) premios.push(valor);
      continue;
    }
    if (campo === "revista_estat") {
      lab.revista_estatisticas = valor ? valor.split(";").map(parNumero).filter((s) => s.numero) : [];
      continue;
    }
    lab[campo] = valor;
  }
  lab.estatisticas = estatisticas;
  lab.premios = premios;
  return lab;
}

function importarPesquisa(wb) {
  const campos = lerCampos(wb, "Pesquisa");
  const pesquisa = {};
  for (const [campo, { valor }] of Object.entries(campos)) pesquisa[campo] = valor;
  if ("jonami_logo_arquivo" in pesquisa) {
    pesquisa.jonami_logo = imagem(pesquisa.jonami_logo_arquivo);
    delete pesquisa.jonami_logo_arquivo;
  }

  pesquisa.conceitos = lerAba(wb, "JONAMI_Conceitos")
    .filter((c) => c.conceito)
    .map((c) => ({ conceito: c.conceito, autores: c.autores, definicao: c.definicao }));

  pesquisa.temas = lerAba(wb, "JONAMI_Temas")
    .filter((t) => t.tema)
    .map((t) => ({ eixo: t.eixo, pessoa: t.pessoa, nivel: t.nivel, tema: t.tema, descricao: t.descricao }));

  pesquisa.formacao = lerAba(wb, "Formacao")
    .filter((f) => f.titulo)
    .map((f) => ({ tipo: f.tipo, titulo: f.titulo, descricao: f.descricao, foto: imagem(f.foto_arquivo), ano: f.ano, link: f.link }));

  pesquisa.eventos = lerAba(wb, "EmBreve")
    .filter((e) => e.nome_evento)
    .map((e) => ({ nome: e.nome_evento, data: e.data, horario: e.horario, local: e.local, link: e.link }));

  return pesquisa;
}

// ── relatório de texto provisório ────────────────────────────

function camposProvisorios(dados, prefixo, saida) {
  if (typeof dados === "string") {
    if (/\[[^\]]+\]/.test(dados)) saida.push(`${prefixo}: ${dados}`);
  } else if (Array.isArray(dados)) {
    dados.forEach((v, i) => camposProvisorios(v, `${prefixo}[${i}]`, saida));
  } else if (dados && typeof dados === "object") {
    for (const [k, v] of Object.entries(dados)) camposProvisorios(v, prefixo ? `${prefixo}.${k}` : k, saida);
  }
  return saida;
}

// ── principal ────────────────────────────────────────────────

function main() {
  const wb = XLSX.readFile(PLANILHA, { dateNF: "dd/mm/yyyy" });
  const desconhecidas = wb.SheetNames.filter(
    (n) => !IGNORAR_ABAS.has(n) && !["Laboratorio", "Projetos", "Series", "Conteudos", "Pessoas", "Pesquisa", "JONAMI_Conceitos", "JONAMI_Temas", "Formacao", "EmBreve"].includes(n)
  );
  const avisos = desconhecidas.map((n) => `Aba sem destino, ignorada: ${n}`);
  const gerados = [];

  const colecoes = [
    ["projetos", importarProjetos(wb, avisos)],
    ["pessoas", importarPessoas(wb)],
  ];
  for (const [pasta, itens] of colecoes) {
    const dir = path.join(CONTENT, pasta);
    const novos = new Set(itens.map((i) => `${i.slug}.json`));
    for (const { slug, dados } of itens) {
      const arquivo = path.join(dir, `${slug}.json`);
      escreverJson(arquivo, dados);
      gerados.push([path.relative(ROOT, arquivo), dados]);
    }
    const sobras = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !novos.has(f)) : [];
    for (const f of sobras) {
      if (LIMPAR) {
        fs.unlinkSync(path.join(dir, f));
        avisos.push(`Apagado (não está mais na planilha): content/${pasta}/${f}`);
      } else {
        avisos.push(`Fora da planilha, mantido: content/${pasta}/${f} (rode com --limpar para apagar)`);
      }
    }
  }

  for (const [nome, dados] of [
    ["laboratorio.json", importarLaboratorio(wb)],
    ["pesquisa.json", importarPesquisa(wb)],
  ]) {
    const arquivo = path.join(CONTENT, nome);
    escreverJson(arquivo, dados);
    gerados.push([path.relative(ROOT, arquivo), dados]);
  }

  console.log(`Gerados ${gerados.length} arquivos em content/.`);
  if (avisos.length) {
    console.log("\nAvisos:");
    avisos.forEach((a) => console.log(`  ${a}`));
  }

  const provisorios = gerados.flatMap(([arquivo, dados]) => camposProvisorios(dados, "", []).map((l) => `${arquivo} · ${l}`));
  console.log(`\nCampos com texto provisório entre colchetes (${provisorios.length}):`);
  provisorios.forEach((l) => console.log(`  ${l}`));
}

main();
