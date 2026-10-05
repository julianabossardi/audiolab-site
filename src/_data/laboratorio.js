const { readFile } = require("../../lib/content.js");

// "laboratorio" é a junção de Sobre (textos do laboratório) com Cabeçalho
// (e-mail e redes), que ficam em arquivos separados para o CMS.
module.exports = () => ({ ...readFile("sobre.json"), ...readFile("cabecalho.json") });
