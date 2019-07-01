'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const packageConfig = require('../package.json')
const checkGit = require('./check-git')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client']
    .concat(baseWebpackConfig.entry[name])
})

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  devServer: {
    hot: true
  },
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env': Object.assign(
        {}, config.dev.env,
        { BASE_URL: config.dev.assetsPublicPath }
      )
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'pcside.html',
      version: packageConfig.version,
      gitPath: checkGit,
      template: './src/pcside/html/index.html',
      chunks: ['pcside'],
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'mobileside.html',
      version: packageConfig.version,
      gitPath: checkGit,
      template: './src/mobileside/html/index.html',
      chunks: ['mobileside'],
      inject: true
    }),
    new StylelintPlugin({
      files: ['**/*.{vue,htm,html,css,sss,less,scss,sass}'],
      syntax: 'scss'
    })
  ],
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
  }
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port;

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        clearConsole: false,
        compilationSuccessInfo: {
          messages: [
            `Your application is running here: ` +
            `http://localhost:${port}`
          ],
        },
        onErrors: config.dev.notifyOnErrors ?
          utils.createNotifierCallback() : undefined,
      }))

      resolve(devWebpackConfig)
    }
  })
})
