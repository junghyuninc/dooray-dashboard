const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.DOORAY_TOKEN || '';

app.use(cors());

app.use('/proxy', (req, res, next) => {
  if (TOKEN) req.headers['authorization'] = `dooray-api ${TOKEN}`;
  next();
}, createProxyMiddleware({
  target: 'https://api.dooray.com',
  changeOrigin: true,
  pathRewrite: { '^/proxy': '' },
  on: {
    error: (err, req, res) => {
      res.status(500).json({ error: err.message });
    }
  }
}));

app.listen(PORT, () => {
  console.log(`✅ 두레이 프록시 서버 시작`);
  console.log(`👉 http://localhost:${PORT}`);
});
