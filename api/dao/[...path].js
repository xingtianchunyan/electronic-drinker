const FIXED_COOKIE = '7b8M711h0qh4W7gFkWgTuQX0EwJsDJl1EOjUVRCd';
const FIXED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0';
const FIXED_CAPTCHA = 'eyJjZXJ0aWZ5SWQiOiJGUkd3M1RGZjJoIiwic2NlbmVJZCI6IjE0bnpjaDdiIiwiaXNTaWduIjp0cnVlLCJzZWN1cml0eVRva2VuIjoiNm9PbzdlNzJuQTYxdVZMaVpWS2lMWUxyQTU0WEwrcXdVV2hlZ0p1ejdNNGUza3BmQnR5QjlZZkpvS3gyM1crQWhuM3pwYzNRZEViWTlMNjFsc3o4dWFCUFVvWkl3bGh3elRERG0xenNRMTM1Nk5HWnh0WVZucEdQUVUrT1RtSXYifQ==';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Build target path from catch-all segments
  const pathSegments = req.query.path || [];
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
  const targetUrl = `https://xjdao.net/api/v1/${path}`;

  // Headers to forward to xjdao.net
  const forwardHeaders = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Origin': 'https://xjdao.net',
    'Referer': 'https://xjdao.net/',
    'Cookie': `_c_WBKFRo=${FIXED_COOKIE}`,
    'User-Agent': FIXED_UA
  };

  if (req.headers.authorization) {
    forwardHeaders.Authorization = req.headers.authorization;
  }

  // Prepare body
  let body = req.body;

  // Auto-inject fixed login params
  if (path === 'user/login' && body && typeof body === 'object') {
    body = {
      ...body,
      loginType: 1,
      phoneRegion: '86',
      sceneId: '14nzch7b',
      captchaVerifyParam: FIXED_CAPTCHA
    };
  }

  const bodyString = req.method !== 'GET' && req.method !== 'HEAD'
    ? (typeof body === 'string' ? body : JSON.stringify(body))
    : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: bodyString
    });

    // Forward content-type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.error('DAO proxy error:', err);
    res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
};
