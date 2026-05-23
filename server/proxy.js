const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const FIXED_COOKIE = '7b8M711h0qh4W7gFkWgTuQX0EwJsDJl1EOjUVRCd';
const FIXED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0';
const FIXED_CAPTCHA = 'eyJjZXJ0aWZ5SWQiOiJGUkd3M1RGZjJoIiwic2NlbmVJZCI6IjE0bnpjaDdiIiwiaXNTaWduIjp0cnVlLCJzZWN1cml0eVRva2VuIjoiNm9PbzdlNzJuQTYxdVZMaVpWS2lMWUxyQTU0WEwrcXdVV2hlZ0p1ejdNNGUza3BmQnR5QjlZZkpvS3gyM1crQWhuM3pwYzNRZEViWTlMNjFsc3o4dWFCUFVvWkl3bGh3elRERG0xenNRMTM1Nk5HWnh0WVZucEdQUVUrT1RtSXYifQ==';

// 解析 JSON body
app.use(express.json());

// CORS 预检
app.use('/api/dao', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// DAO 代理
app.use('/api/dao', createProxyMiddleware({
  target: 'https://xjdao.net/api/v1',
  changeOrigin: true,
  pathRewrite: { '^/api/dao': '' },
  secure: true,
  onProxyReq: (proxyReq, req, res) => {
    // 注入固定请求头
    proxyReq.setHeader('Origin', 'https://xjdao.net');
    proxyReq.setHeader('Referer', 'https://xjdao.net/');
    proxyReq.setHeader('Cookie', `_c_WBKFRo=${FIXED_COOKIE}`);
    proxyReq.setHeader('User-Agent', FIXED_UA);
    proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
    proxyReq.setHeader('Accept-Language', 'en');
    proxyReq.setHeader('Cache-Control', 'no-cache');
    proxyReq.setHeader('Pragma', 'no-cache');
    proxyReq.setHeader('Priority', 'u=1, i');
    proxyReq.setHeader('Sec-Ch-Ua', '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"');
    proxyReq.setHeader('Sec-Ch-Ua-Mobile', '?0');
    proxyReq.setHeader('Sec-Ch-Ua-Platform', '"Windows"');
    proxyReq.setHeader('Sec-Fetch-Dest', 'empty');
    proxyReq.setHeader('Sec-Fetch-Mode', 'cors');
    proxyReq.setHeader('Sec-Fetch-Site', 'same-origin');

    // 透传 Authorization
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }

    // 补充 login 参数
    if (req.url === '/user/login' && req.body) {
      const body = {
        ...req.body,
        loginType: 1,
        phoneRegion: '86',
        sceneId: '14nzch7b',
        captchaVerifyParam: FIXED_CAPTCHA
      };
      const bodyString = JSON.stringify(body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
      proxyReq.write(bodyString);
    }

    // login-user-detail 调整 Referer
    if (req.url === '/user/login-user-detail' && req.body?.domainName) {
      proxyReq.setHeader('Referer', `https://xjdao.net/profile/${req.body.domainName}`);
    }

    // score/reward 调整 Referer
    if (req.url === '/score/reward' && req.body?.fromDomainName) {
      proxyReq.setHeader('Referer', `https://xjdao.net/profile/${req.body.fromDomainName}/post/3mjhgg4ht7c27`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY ERROR]', err.message);
    res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
}));

// 静态文件（前端构建产物）
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍺 电子酒友服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 DAO 代理: /api/dao/* -> https://xjdao.net/api/v1/*`);
});
