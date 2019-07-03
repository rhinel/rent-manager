const fs = require('fs')
const express = require('express')
const path = require('path')
const log4js = require('log4js')

const controllerRest = require('./controllers-rest')
const controllerWs = require('./controllers-ws')

const sysLog = log4js.getLogger('sys')

module.exports = app => {
  // socket，不做接口校验
  // 非权限接口
  app.ws('/wsapi/outer/:class/:function?', controllerWs.outer)
  // 用户权限校验处理
  app.ws('/wsapi/inner/*', controllerWs.auth)
  // 权限接口控制器
  app.ws('/wsapi/inner/:class/:function?', controllerWs.inner)
  // 默认返回
  app.ws('*', controllerWs.def)

  // 默认同步错误处理
  // 每个接口在控制器处处理了返回和错误
  // 因此一般情况不会采用该处理
  // 仅能处理同步代码中next()错误 / throw Error
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    sysLog.error('system route error: ', err)
    req.ws.send(JSON.stringify({
      code: 1000,
      msg: err.message || err,
    }))
    req.ws.close()
  })

  // 接口，不做接口校验
  // 非权限接口
  app.route('/api/outer/:class/:function?').post(controllerRest.outer)
  // 用户权限校验处理
  app.route('/api/inner/*').post(controllerRest.auth)
  // 权限接口控制器
  app.route('/api/inner/:class/:function?').post(controllerRest.inner)
  // 默认返回
  app.route('*').post(controllerRest.def)

  // 默认同步错误处理
  // 每个接口在控制器处处理了返回和错误
  // 因此一般情况不会采用该处理
  // 仅能处理同步代码中next()错误 / throw Error
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    sysLog.error('system route error: ', err)
    res.status(err.status || 500).send({
      code: 1000,
      msg: err.message || err,
    })
  })

  // 处理页面, 动态加载
  // 返回文件，该处不默认处理错误 / 或认为不会存在错误
  app.use('/service-worker.js', express.static(path.resolve(__dirname, '../dist/service-worker.js')))
  app.use('/static', express.static(path.resolve(__dirname, '../dist/static')))
  app.use('/404', express.static(path.resolve(__dirname, '../404')))
  app.get('*', (req, res) => {
    if (req.hostname && (
      req.hostname === 'wechat.rhinel.xyz'
      || req.hostname === 'wechat.rent-manager.online'
      || req.hostname === 'wechat.rent-manager.cn'
    )) {
      // wechat
      res.send(fs.readFileSync(path.resolve(__dirname, '../dist/mobileside/index.html'), 'utf-8'))
    } else if (req.hostname && (
      req.hostname === 'www.rhinel.xyz'
      || req.hostname === 'www.rent-manager.online'
      || req.hostname === 'www.rent-manager.cn'
      || req.hostname === 'rent-manager.online'
      || req.hostname === 'rent-manager.cn'
    )) {
      // SaaS
      res.send(fs.readFileSync(path.resolve(__dirname, '../dist/pcside/index.html'), 'utf-8'))
    } else {
      // 404
      res.send(fs.readFileSync(path.resolve(__dirname, '../404/404.html'), 'utf-8'))
    }
  })
}
