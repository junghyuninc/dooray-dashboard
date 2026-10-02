const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.DOORAY_TOKEN || '';

app.use(cors());

// 헬스체크
app.get('/health', (req, res) => res.json({ status: 'ok', hasToken: !!TOKEN }));

app.use('/proxy', createProxyMiddleware({
  target: 'https://api.dooray.com',
  changeOrigin: true,
  pathRewrite: { '^/proxy': '' },
  on: {
    proxyReq: (proxyReq, req) => {
      // 환경변수 토큰 우선, 없으면 요청 헤더 사용
      const token = TOKEN || (req.headers['authorization'] || '').replace('dooray-api ', '');
      if (token) {
        proxyReq.setHeader('Authorization', `dooray-api ${token}`);
      }
    },
    error: (err, req, res) => {
      res.status(500).json({ error: err.message });
    }
  }
}));

app.listen(PORT, () => {
  console.log(`✅ 두레이 프록시 서버 시작`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`🔑 토큰: ${TOKEN ? '설정됨' : '없음'}`);
});
