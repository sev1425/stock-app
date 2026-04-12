const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * When PROXY_API_TARGET is set (e.g. http://127.0.0.1:3001), forwards /api/* to a local
 * `vercel dev` server so Create React App can use serverless routes during development.
 */
module.exports = function setupProxy(app) {
  const target = process.env.PROXY_API_TARGET;
  if (!target) return;

  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
