'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const packageConfig = require('../package.json')
const vueLoaderConfig = require('./vue-loader.conf')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const PreloadPlugin = require('preload-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const cacheLoader = {
  loader: 'cache-loader',
  options: {
    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/vue-loader'),
    cacheIdentifier: packageConfig.name + ':{version} {process.env.NODE_ENV}'
  }
}

const vueLoader = {
  loader: 'vue-loader',
  options: {
    ...vueLoaderConfig,
    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/vue-loader'),
    cacheIdentifier: packageConfig.name + ':{version} {process.env.NODE_ENV}'
  }
}

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-runtime']
  }
}

module.exports = {
  entry: {
    'pcside': ['./src/pcside/js/main.js'],
    'mobileside': ['./src/mobileside/js/main.js']
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
    globalObject: '(typeof self !== \'undefined\' ? self : this)'
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'],
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
      '@': resolve('src'),
      'mobileside': path.resolve(__dirname, '../src/mobileside'),
      'pcside': path.resolve(__dirname, '../src/pcside'),
      'common': path.resolve(__dirname, '../src/common')
    }
  },
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      /* config.module.rule('eslint') */
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: /node_modules/,
        include: [resolve('src'), resolve('server')],
        options: {
          cache: true,
          cacheIdentifier: packageConfig.name + ':{version} {process.env.NODE_ENV}',
          formatter: require('eslint-friendly-formatter')
        }
      },
      /* config.module.rule('vue') */
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        use: process.env.NODE_ENV === 'production'
          ? [cacheLoader, vueLoader]
          : [vueLoader]
      },
      /* config.module.rule('js') */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: [resolve('src')],
        use: process.env.NODE_ENV === 'production'
          ? [cacheLoader, babelLoader]
          : [babelLoader]
      },
      /* config.module.rule('images') */
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:8].[ext]')
        }
      },
      /* config.module.rule('fonts') */
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:8].[ext]')
        }
      }
    ]
  },
  plugins: [
    /* config.plugin('vue-loader') */
    new VueLoaderPlugin(),
    /* config.plugin('case-sensitive-paths') */
    new CaseSensitivePathsPlugin(),
    /* config.plugin('preload') */
    new PreloadPlugin({
      rel: 'preload',
      include: ['pcside'],
      excludeHtmlNames: ['mobileside.html'],
      fileBlacklist: [
        /\.map$/,
        /hot-update\.js$/
      ]}
    ),
    new PreloadPlugin({
      rel: 'preload',
      include: ['mobileside'],
      excludeHtmlNames: ['pcside.html'],
      fileBlacklist: [
        /\.map$/,
        /hot-update\.js$/
      ]}
    ),
    /* config.plugin('prefetch') */
    new PreloadPlugin({
      rel: 'prefetch',
      include: 'asyncChunks'
    }),
  ]
}
