// Passada mecânica do DSM em src/ (briefing, seção 10). Lista cada
// ocorrência com arquivo e linha. Uso: node scripts/passada-dsm.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TOKENS = "src/assets/css/audiolab-tokens.css";

function arquivos(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((d) => {
    const rel = path.join(dir, d.name);
    if (d.isDirectory()) return arquivos(rel);
    return /\.(css|njk|js|html|md)$/.test(d.name) ? [rel] : [];
  });
}

const regras = [
  { nome: "cor hex fora dos tokens", re: /#[0-9a-fA-F]{3,8}\b(?![^<]*<\/path>)/, so: (f) => f !== TOKENS && !f.endsWith(".js"), ignora: /href="#|id="|url\(#|&#|#equipe|#sobre|#series|#video|#episodios|#noticias|#contato|#jonami|#formacao|aria-controls/ },
  { nome: "cor rgb/rgba solta", re: /rgba?\(/, so: (f) => f !== TOKENS },
  { nome: "font-size solto", re: /font-size:(?!\s*(var\(--fs-|inherit))/ },
  { nome: "border-radius fora do token", re: /border-radius:(?!\s*(var\(--radius|0\b))/ },
  { nome: "sombra", re: /(box|text)-shadow:(?!\s*(none|var\(--shadow-none))/ },
  { nome: "gradiente fora dos grafismos", re: /gradient\(/, so: (f) => f !== TOKENS, permitido: /repeating-linear-gradient\(to top, var\(--lime-500\) 0 5px|linear-gradient\(transparent 60%, var\(--lime-500\) 60%\)/ },
  { nome: "travessão ou meia-risca", re: /[—–]/ },
  { nome: "emoji", re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}]/u },
  { nome: "outline: none", re: /outline:\s*(none|0)(\s*;|\s*\}|\s*$)/ },
  { nome: "div ou span clicável", re: /<(div|span)[^>]*(onclick|role="button"|tabindex=)/ },
  { nome: "autoplay", re: /autoplay/i },
  { nome: "link #", re: /href="#"/ },
];

let total = 0;
for (const f of arquivos("src")) {
  const linhas = fs.readFileSync(path.join(ROOT, f), "utf8").split("\n");
  linhas.forEach((linha, i) => {
    for (const r of regras) {
      if (r.so && !r.so(f)) continue;
      if (!r.re.test(linha)) continue;
      if (r.ignora && r.ignora.test(linha) && !/#[0-9a-fA-F]{3,8}\b/.test(linha.replace(r.ignora, ""))) continue;
      if (r.permitido && r.permitido.test(linha)) continue;
      total++;
      console.log(`${f}:${i + 1}  [${r.nome}]  ${linha.trim().slice(0, 120)}`);
    }
  });
}
console.log(total ? `\n${total} ocorrência(s).` : "Nenhuma ocorrência.");
process.exitCode = total ? 1 : 0;
