'use strict'
require('./check-versions')()
require('./check-hooks')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const opn = require('opn')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')

// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

// serve pure static assets
const staticPath = path.posix.join(
  config.dev.assetsPublicPath,
  config.dev.assetsSubDirectory
)

// default port where dev server listens for incoming traffic
const port = config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser

// app server
const app = express()

// for done require
let _resolve
const readyPromise = new Promise(resolve => {
  _resolve = resolve
})

// http server
let server

function processOptions(inputConfig) {
  // processOptions { Promise }
  if (typeof inputConfig.then === 'function') {
    console.log('> loading webpack config...')
    inputConfig.then(processOptions).catch((err) => {
      console.error(err.stack || err)
      process.exit(1)
    })

    return
  }

  startDevServer(inputConfig)
}

function startDevServer(inputConfig) {
  const compiler = webpack(inputConfig)

  const hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: false,
    heartbeat: 2000
  })

  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: inputConfig.output.publicPath,
    logLevel: 'silent'
  })

  // enable hot-reload and state-preserving
  // compilation error display
  app.use(hotMiddleware)

  // proxy api requests
  Object.keys(proxyTable).forEach(function(context) {
    let options = proxyTable[context]
    if (typeof options === 'string') {
      options = {
        target: options
      }
    }
    app.use(proxyMiddleware(options.filter || context, options))
  })

  // handle fallback for HTML5 history API
  app.use(require('connect-history-api-fallback')())

  // serve webpack bundle output
  app.use(devMiddleware)

  // serve static
  app.use(staticPath, express.static('./static'))

  devMiddleware.waitUntilValid(() => {
    const uri = 'http://localhost:' + (process.env.PORT || port)
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    server = app.listen(process.env.PORT || port)
    _resolve()
  })
}

console.log('> Starting dev server...')
processOptions(webpackConfig)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
