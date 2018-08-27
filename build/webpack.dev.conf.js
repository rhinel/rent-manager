'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const packageConfig = require('../package.json')
const checkGit = require('./check-git')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
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
      files: ['src/**/*.vue', 'src/**/*.scss'],
      syntax: 'scss'
    }),
    new FriendlyErrorsPlugin({
      clearConsole: false
    })
  ]
})
