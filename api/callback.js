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
  res.end(`<!doctype html>
<html><body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(
      "authorization:github:success:${payload}",
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
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
