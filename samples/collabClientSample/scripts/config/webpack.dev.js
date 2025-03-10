const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const { SERVER_HOST, SERVER_PORT } = require('../constants')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  stats: 'errors-only',
  target: 'web',
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE,FETCH',
      'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,token,source',
      'Access-Control-Expose-Headers': 'content-range, content-type, accept-ranges',
      'Service-Worker-Allowed': '/',
    },    
    static: ['dist'],
    port: SERVER_PORT,
    compress: true,
    hot: true,
    historyApiFallback: true,
    allowedHosts: 'all',
    proxy: {
      '/collab-server': {
        target: 'http://localhost:8080',
        secure: false,
        pathRewrite: { '^/collab-server': '/' },
      },
    },
    client: {
      overlay: {
        errors: false,
        warnings: false,
      },
    },
  }
})
