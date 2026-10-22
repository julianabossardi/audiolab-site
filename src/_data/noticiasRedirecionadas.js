// Só as notícias que mudaram de endereço: cada uma gera uma página de
// redirecionamento no endereço antigo. As demais não geram nada.
const noticias = require("./noticias.js");

module.exports = () => noticias().filter((n) => n.slug_antigo);
