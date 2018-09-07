'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const safeParser = require('postcss-safe-parser')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const os = require('os')
const packageConfig = require('../package.json')
const checkGit = require('./check-git')

const env = config.build.env

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  performance: false,
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },

  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // replace officially maintained compression tools
    new UglifyJsPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 8,
        mangle: true,
        output: { comments: false },
        compress: { warnings: false }
      },
      sourceMap: true,
      cache: true,
      parallel: os.cpus().length * 2
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[hash].css'),
      allChunks: true
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        parser: safeParser,
        discardComments: {
          removeAll: true
        }
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'pcside/index.html',
      version: packageConfig.version,
      gitPath: checkGit,
      template: './src/pcside/html/index.html',
      chunks: ['chunk-vendors-pc', 'chunk-common-pc', 'pcside'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'mobileside/index.html',
      version: packageConfig.version,
      gitPath: checkGit,
      template: './src/mobileside/html/index.html',
      chunks: ['chunk-vendors-mb', 'chunk-common-mb', 'mobileside'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    // https://webpack.js.org/plugins/module-concatenation-plugin/
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  // code splitting
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendorsPC: {
          name: `chunk-vendors-pc`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks(chunk) {
            return chunk.name === 'pcside'
          }
        },
        commonPC: {
          name: `chunk-common-pc`,
          minChunks: 2,
          priority: -20,
          chunks(chunk) {
            return chunk.name === 'pcside'
          },
          reuseExistingChunk: true
        },
        vendorsMB: {
          name: `chunk-vendors-mb`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks(chunk) {
            return chunk.name === 'mobileside'
          }
        },
        commonMB: {
          name: `chunk-common-mb`,
          minChunks: 2,
          priority: -20,
          chunks(chunk) {
            return chunk.name === 'mobileside'
          },
          reuseExistingChunk: true
        }
      }
    }
  }
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
