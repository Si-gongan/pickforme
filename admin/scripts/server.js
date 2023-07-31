const { createServer: https } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const httpsLocalhost = require("https-localhost")()

const port = 3001;
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

(async () => {
  const certs = await httpsLocalhost.getCerts();
  await app.prepare();
  const server = await https(certs, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> HTTPS: Ready on https://localhost:${port}`);
  });
})();
