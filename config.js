// config.js
const externalUrl = 'https://sigurnost-web2lab2.onrender.com';
const port = externalUrl && 5432 ? parseInt(5432) : 4080;

module.exports = {
  externalUrl,
  port,
  baseURL: externalUrl || `https://localhost:${port}`,
};
