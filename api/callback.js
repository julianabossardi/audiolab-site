// Segundo passo do login do Decap: troca o código do GitHub por um token e
// devolve pro painel /admin via postMessage, no formato que o Decap espera.
// Precisa de OAUTH_CLIENT_ID e OAUTH_CLIENT_SECRET configurados no projeto
// da Vercel (o Client Secret vem do app OAuth criado em
// https://github.com/settings/developers).
module.exports = async (req, res) => {
  const { code, state } = req.query || {};
  const cookies = req.cookies || parseCookies(req.headers.cookie || "");

  if (!code || !state || state !== cookies.decap_oauth_state) {
    res.statusCode = 400;
    res.end("Estado inválido ou ausente. Feche esta janela e tente fazer login de novo.");
    return;
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.statusCode = 500;
    res.end("Faltam OAUTH_CLIENT_ID e/ou OAUTH_CLIENT_SECRET no projeto da Vercel.");
    return;
  }

  let data;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    data = await tokenRes.json();
  } catch (err) {
    res.statusCode = 502;
    res.end("Falha ao falar com o GitHub: " + err.message);
    return;
  }

  if (!data.access_token) {
    res.statusCode = 400;
    res.end("Não foi possível obter o token do GitHub: " + (data.error_description || data.error || "erro desconhecido"));
    return;
  }

  const payload = JSON.stringify({ token: data.access_token, provider: "github" }).replace(/</g, "\\u003c");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Set-Cookie", "decap_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  // O handshake abaixo é o protocolo que o Decap espera (lib netlify-auth):
  // 1) este popup avisa "authorizing:github" pro opener; 2) o opener responde
  // com a mesma mensagem, confirmando a origem; 3) só então mandamos o token.
  // Se algo falhar no caminho, mostramos o motivo na tela em vez de ficar
  // em branco, pra dar pra diagnosticar sem abrir o DevTools.
  res.end(`<!doctype html>
<html><body style="font:14px monospace;padding:24px;color:#222;">
<div id="msg">Autenticando…</div>
<script>
(function () {
  function show(msg) { document.getElementById("msg").textContent = msg; }
  if (!window.opener) {
    show("window.opener está vazio: o navegador perdeu a referência da janela que abriu este popup (comum depois de passar pelo login do GitHub). Feche esta janela; se acontecer de novo, me avise.");
    return;
  }
  var done = false;
  function receiveMessage(e) {
    done = true;
    try {
      window.opener.postMessage("authorization:github:success:${payload}", e.origin);
      show("Login concluído, pode fechar esta janela.");
    } catch (err) {
      show("Erro ao enviar o token de volta: " + err.message);
    }
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  try {
    window.opener.postMessage("authorizing:github", "*");
  } catch (err) {
    show("Erro ao avisar a janela principal: " + err.message);
    return;
  }
  setTimeout(function () {
    if (!done) show("Não recebi resposta da janela principal (/admin) depois de alguns segundos. Confira se ela ainda está aberta na mesma aba e tente de novo.");
  }, 4000);
})();
</script>
</body></html>`);
};

function parseCookies(header) {
  return Object.fromEntries(
    header
      .split(";")
      .filter(Boolean)
      .map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
  );
}
