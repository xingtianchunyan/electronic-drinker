const { proxyRequest } = require('../../_lib/dao-proxy.cjs');

module.exports = async (req, res) => {
  await proxyRequest(req, res, 'user/login-user-detail');
};
