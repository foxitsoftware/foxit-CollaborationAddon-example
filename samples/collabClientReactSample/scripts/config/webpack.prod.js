const webpack = require('webpack')
const path = require('path');
const { merge } = require('webpack-merge')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const LicensePlugin = require('webpack-license-plugin')
const pkg = require('../../package.json');
const common = require('./webpack.common.js')
let pkgDependencies=Object.keys(pkg.dependencies).map((dependencie)=>{
  return path.join(__dirname,`../../node_modules/${dependencie}`)
})
module.exports = merge(common, {
  mode: 'production',
  performance: {
    hints: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin({
      raw: true,
      banner: '/** @preserve Powered by react-ts-quick-starter (https://github.com/vortesnail/react-ts-quick-starter) */',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css',
      ignoreOrder: false,
    }),
    new LicensePlugin({
      outputFilename:'./legal.json',
      includePackages:()=>pkgDependencies,
      excludedPackageTest: (packageName) => {
        return packageName.startsWith('@foxitsoftware/')||packageName.startsWith('foxit-pdf-sdk-for-web')
      }
    })
  ].filter(Boolean),
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        exclude:['foxitwebsdk','docs', 'lib'],
        terserOptions: {
          compress: { pure_funcs: ['console.log'] },
        }
      }),
      new CssMinimizerPlugin()
    ].filter(Boolean),
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
})
