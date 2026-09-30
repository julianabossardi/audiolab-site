# Decisões do site AudioLab

Registro das decisões de design e conteúdo que valem para o site todo. Os
valores de cor também estão comentados no fim de
`src/assets/css/audiolab-tokens.css`.

## Rodada da planilha v2, setembro de 2026

### Fundo do herói das páginas de projeto

Os três projetos com identidade própria ganharam um tom de herói mais
aberto que os `*-dark`, na luminosidade do petróleo da home.

| Projeto | Token | Valor | Branco sobre ele |
|---|---|---|---|
| BadaUERJ | `--bada-hero` | `#5e1d0d` | 12,7:1 |
| Ateliê do Podcast | `--atelie-hero` | `#1f0863` | 16,5:1 |
| Escola de Narradores | `--escola-hero` | `#04522b` | 9,4:1 |

### Projetos sem cor própria

Variam dentro da família petróleo, com acento limão. Sem verde, que
confundiria com a Escola de Narradores. O tom é o fundo do herói e a cor
do card. No HTML: `data-project="petrol-600"`, `"petrol-700"` ou
`"petrol-800"`. A lista fica em `src/_data/projectBrands.js`.

| Projeto | Sigla | Tom |
|---|---|---|
| A Gente da Ciência | GC | `petrol-600` |
| Radioatividade | RA | `petrol-800` |
| Mergulhando | MG | `petrol-700` |
| UERJ no Ar | UA | `petrol-600` |
| AudioLabGeo | GE | `petrol-800` |
| Política nas Rampas | PR | `petrol-700` |

Projeto novo sem decisão registrada cai em `petrol-700`, com sigla das
iniciais, até entrar nesta tabela.

### Logos

- Os logos do BadaUERJ e do AudioLab são só brancos: aparecem sobre placa
  escura (`--bada-hero` e petróleo).
- Os do Ateliê do Podcast e da Escola de Narradores têm partes pretas:
  aparecem sobre placa branca, inclusive no herói escuro.
- Versões recortadas sem margem vazia, para alinhar na mesma altura:
  `src/assets/img/logo-*-crop.png` e `logo-audiolab-wide.png`.

### Conteúdo que depende de autorização

`src/_data/publicacao.js` controla o que vai ao ar. No servidor local
(`npx @11ty/eleventy --serve`) tudo aparece para revisão. No build de
publicação só aparece o que estiver marcado como autorizado:

- `pessoas`: nomes e fotos da aba Pessoas (Sobre, equipe dos projetos e
  nomes nos temas do JONAMI).
- `conceitos`: definições dos conceitos do JONAMI, ainda em rascunho.

A lista de apoiadores não é importada da planilha e não aparece no site.
