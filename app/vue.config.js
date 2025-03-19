const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  devServer: {
    proxy: {
      '/geoserver': {
        target: 'http://0.0.0.0:8088',
        changeOrigin: true,
        pathRewrite: { '^/geoserver': '/geoserver' },
      },
    },
  },
});
