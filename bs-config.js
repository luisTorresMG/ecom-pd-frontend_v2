var fallback = require("connect-history-api-fallback");

module.exports = {
  server: {
    baseDir: "dist",
    middleware: {
      1: fallback({ index: "/index.html" }),
    },
  },
};
