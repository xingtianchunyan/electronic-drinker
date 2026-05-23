const FIXED_COOKIE = '7b8M711h0qh4W7gFkWgTuQX0EwJsDJl1EOjUVRCd';
const FIXED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0';
const FIXED_CAPTCHA = 'eyJjZXJ0aWZ5SWQiOiJGUkd3M1RGZjJoIiwic2NlbmVJZCI6IjE0bnpjaDdiIiwiaXNTaWduIjp0cnVlLCJzZWN1cml0eVRva2VuIjoiNm9PbzdlNzJuQTYxdVZMaVpWS2lMWUxyQTU0WEwrcXdVV2hlZ0p1ejdNNGUza3BmQnR5QjlZZkpvS3gyM1crQWhuM3pwYzNRZEViWTlMNjFsc3o4dWFCUFVvWkl3bGh3elRERG0xenNRMTM1Nk5HWnh0WVZucEdQUVUrT1RtSXYifQ==';

/**
 * 读取请求体（Vercel Node 函数不自动解析 body）
 */
async function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return null;
  
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return null;
  
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 读取 body
  const body = await readBody(req);

  // 提取目标路径
  const pathSegments = req.query.path || [];
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
  const targetUrl = `https://xjdao.net/api/v1/${path}`;

  // 完整 headers（与接口示例对齐）
  const forwardHeaders = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Cookie': `_c_WBKFRo=${FIXED_COOKIE}`,
    'Origin': 'https://xjdao.net',
    'Pragma': 'no-cache',
    'Priority': 'u=1, i',
    'Referer': 'https://xjdao.net/',
    'Sec-Ch-Ua': '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': FIXED_UA
  };

  if (req.headers.authorization) {
    forwardHeaders.Authorization = req.headers.authorization;
  }

  // 特殊处理各接口
  let finalBody = body;
  let finalReferer = 'https://xjdao.net/';

  if (path === 'user/login') {
    // 登录：补全所有字段
    finalBody = {
      phone: body?.phone || '',
      email: body?.email || '',
      password: body?.password || '',
      domainName: body?.domainName || '',
      loginType: 1,
      phoneRegion: '86',
      sceneId: '14nzch7b',
      captchaVerifyParam: FIXED_CAPTCHA
    };
  } else if (path === 'user/login-user-detail') {
    // 用户信息：body 为空
    finalBody = null;
    // Referer 带 profile 路径
    const domainName = body?.domainName || '';
    if (domainName) {
      finalReferer = `https://xjdao.net/profile/${domainName}`;
    }
  } else if (path === 'score/reward') {
    // 转稻米：保留原 body
    finalBody = body;
    const domainName = body?.fromDomainName || '';
    if (domainName) {
      finalReferer = `https://xjdao.net/profile/${domainName}/post/3mjhgg4ht7c27`;
    }
  }

  forwardHeaders.Referer = finalReferer;

  // 序列化 body
  const bodyString = finalBody !== null && finalBody !== undefined
    ? (typeof finalBody === 'string' ? finalBody : JSON.stringify(finalBody))
    : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: bodyString
    });

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.error('DAO proxy error:', err.message || err);
    res.status(500).json({ 
      error: err.message || 'Proxy request failed',
      path,
      targetUrl
    });
  }
};