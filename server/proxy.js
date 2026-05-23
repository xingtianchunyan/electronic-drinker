import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const FIXED_COOKIE = '7b8M711h0qh4W7gFkWgTuQX0EwJsDJl1EOjUVRCd';
const FIXED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0';
const FIXED_CAPTCHA = 'eyJjZXJ0aWZ5SWQiOiJGUkd3M1RGZjJoIiwic2NlbmVJZCI6IjE0bnpjaDdiIiwiaXNTaWduIjp0cnVlLCJzZWN1cml0eVRva2VuIjoiNm9PbzdlNzJuQTYxdVZMaVpWS2lMWUxyQTU0WEwrcXdVV2hlZ0p1ejdNNGUza3BmQnR5QjlZZkpvS3gyM1crQWhuM3pwYzNRZEViWTlMNjFsc3o4dWFCUFVvWkl3bGh3elRERG0xenNRMTM1Nk5HWnh0WVZucEdQUVUrT1RtSXYifQ==';

app.use(express.json());

app.use('/api/dao', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = 'https://xjdao.net/api/v1' + req.url;

  const headers = {
    'Origin': 'https://xjdao.net',
    'Referer': 'https://xjdao.net/',
    'Cookie': `_c_WBKFRo=${FIXED_COOKIE}`,
    'User-Agent': FIXED_UA,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Priority': 'u=1, i',
    'Sec-Ch-Ua': '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Content-Type': 'application/json',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = String(req.headers.authorization);
  }

  let body = req.body;

  if (req.url === '/user/login' && body) {
    body = {
      ...body,
      loginType: 1,
      phoneRegion: '86',
      sceneId: '14nzch7b',
      captchaVerifyParam: FIXED_CAPTCHA
    };
  }

  if (req.url === '/user/login-user-detail' && body?.domainName) {
    headers['Referer'] = `https://xjdao.net/profile/${body.domainName}`;
  }

  if (req.url === '/score/reward' && body?.fromDomainName) {
    headers['Referer'] = `https://xjdao.net/profile/${body.fromDomainName}/post/3mjhgg4ht7c27`;
  }

  try {
    const fetchBody = body ? JSON.stringify(body) : undefined;
    if (fetchBody) {
      headers['Content-Length'] = String(Buffer.byteLength(fetchBody));
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: fetchBody,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.header(key, value);
    });

    const responseBody = await response.text();
    console.log(`[PROXY] ${req.method} ${req.url} -> ${response.status}`);
    res.send(responseBody);
  } catch (err) {
    console.error('[PROXY ERROR]', err.message);
    res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍺 电子酒友服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 DAO 代理: /api/dao/* -> https://xjdao.net/api/v1/*`);
});
