// frontend/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // '/api'로 시작하는 요청을 잡습니다.
    createProxyMiddleware({
      target: 'http://localhost:8080', // Spring Boot 포트
      changeOrigin: true,
    })
  );
};