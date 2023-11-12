// config.js
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

module.exports = {
  externalUrl,
  port,
  baseURL: externalUrl || `https://localhost:${port}`,
};
