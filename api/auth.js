// Primeiro passo do login do Decap: manda a pessoa pro GitHub autorizar o
// app OAuth. Precisa de OAUTH_CLIENT_ID configurado no projeto da Vercel.
// Documentação do protocolo: https://decapcms.org/docs/external-oauth-clients/
module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    res.end("Falta configurar a variável de ambiente OAUTH_CLIENT_ID no projeto da Vercel.");
    return;
  }

  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  res.setHeader(
    "Set-Cookie",
    `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  const redirectUri = `https://${req.headers.host}/api/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
    state,
  });

  res.statusCode = 302;
  res.setHeader("Location", `https://github.com/login/oauth/authorize?${params.toString()}`);
  res.end();
};
