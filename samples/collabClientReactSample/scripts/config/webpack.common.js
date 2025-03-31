const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack');
const WebpackBar = require('webpackbar')
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { isDev, PROJECT_PATH } = require('../constants');
const dotenv = require('dotenv')
const nodeResolve = require('resolve/sync')
dotenv.config()

const getCssLoaders = (importLoaders) => [
  isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      modules: false,
      sourceMap: isDev,
      importLoaders,
    },
  }
]

module.exports = {
  entry: {
    app: resolve(PROJECT_PATH, './src/index.tsx'),
  },
  output: {
    filename: `js/[name]${isDev ? '' : '.[contenthash:8]'}.js`,
    path: resolve(PROJECT_PATH, './dist'),
    publicPath:  isDev ? '/' : '/demo/'
  },
  externalsType: 'global',
  externals: ['UIExtension', 'PDFViewCtrl'],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json','.art'],
    alias: {
      'Src': resolve(PROJECT_PATH, './src'),
      'Components': resolve(PROJECT_PATH, './src/components'),
      'assets': resolve(PROJECT_PATH, './public/assets'),
      'Utils': resolve(PROJECT_PATH, './src/utils'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile:path.resolve(__dirname, '../../tsconfig.client.json')
        }
      },
      {
        test: /\.css$/,
        use: getCssLoaders(1),
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
        // ...other rules
      },
      {
        test: /\.art$/,
        use: [
            {
                loader: path.join(__dirname, './helper/fix-template-loader.js'),
            },
            {
                loader: 'art-template-loader',
                options: {
                    escape: false
                },
            }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // WEBPACKDEFINE_FOXITWEBSDK_PATH: JSON.stringify(foxitwebsdkPath),
      // WEBPACKDEFINE_FOXITWEBSDK_LICENSE_PLACEHOLDER: JSON.stringify(cautiousOptions.licensePlaceholder),
      // WEBPACKDEFINE_CLIENTID: JSON.stringify(cautiousOptions.clientId),
      APP: JSON.stringify(process.env['APP'] || 'dev'), // Used to determine the deployment environment, and configure urls according to different deployment environments
      VERSION: JSON.stringify(process.env['DEMO_VERSION'] || ''), // the version of demo
      // the version of collab client, only needed when using collab client src
      __COLLAB_CLIENT_VERSION__: JSON.stringify('src'),
      HTTP_BASE_URL: JSON.stringify(process.env['HTTP_BASE_URL'] || ""),
      WS_BASE_URL: JSON.stringify(process.env['WS_BASE_URL'] || ""),
    }),
    new HtmlWebpackPlugin({
      template: resolve(PROJECT_PATH, './public/index.html'),
      filename: 'index.html',
      publicPath:  isDev ? '/' : '/demo/',
      licensePath: process.env['LICENSE_PATH'] || 'http://10.103.130.134:9999/FoxitPDFSDKForWeb/release/s325/FoxitPDFSDKForWeb_10_0_0/examples/license-key.js',
      UIExtensionLib: isDev ? '/lib/UIExtension.full.js' : '/demo/lib/UIExtension.full.js',
      PDFViewCtrlLib: isDev ?  '/lib/PDFViewCtrl.full.js': '/demo/lib/PDFViewCtrl.full.js'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: process.env.USE_LOCAL_WEB_SDK
            ? path.resolve(__dirname, '../../public/foxitwebsdk/lib')
            : path.dirname(nodeResolve("@foxitsoftware/foxit-pdf-sdk-for-web-library")),
          to: 'lib',
        },
        {
          from: path.resolve(__dirname, '../../public/assets'),
          to: 'assets'
        }
      ]
    }),
    new WebpackBar({
      name: isDev ? 'Starting' : 'Packaging',
      color: '#fa8c16',
    })
  ].filter(Boolean)
}
