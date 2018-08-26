const fs = require('fs')
const path = require('path')
const log4js = require('log4js')

const controller = require('./controllers')

const sysLog = log4js.getLogger('sys')

module.exports = (app, express) => {
  // 接口，不做接口校验
  // 非权限接口
  app.route('/api/outer/:class/:function?').post(controller.outer)
  // 用户权限校验处理
  app.route('/api/inner/*').post(controller.auth)
  // 权限接口控制器
  app.route('/api/inner/:class/:function?').post(controller.inner)
  // 默认返回
  app.route('/api/*').post(controller.def)

  // 默认接口错误处理
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    sysLog.error('system route error: ', err)
    res.status(err.status || 500).send({
      code: 1000,
      msg: err.message,
    })
  })

  // 处理页面, 动态加载
  app.use('/static', express.static(path.resolve(__dirname, '../dist/static')))
  app.use('/404', express.static(path.resolve(__dirname, '../404')))
  app.get('*', (req, res) => {
    // wechat
    if (req.hostname && (
      req.hostname === 'wechat.rhinel.xyz'
      || req.hostname === 'wechat.rent-manager.online'
      || req.hostname === 'wechat.rent-manager.cn'
    )) {
      res.send(fs.readFileSync(path.resolve('../dist/mobileside/index.html'), 'utf-8'))
      // SaaS
    } else if (req.hostname && (
      req.hostname === 'www.rhinel.xyz'
      || req.hostname === 'www.rent-manager.online'
      || req.hostname === 'www.rent-manager.cn'
      || req.hostname === 'rent-manager.online'
      || req.hostname === 'rent-manager.cn'
    )) {
      res.send(fs.readFileSync(path.resolve('../dist/pcside/index.html'), 'utf-8'))
    } else {
      res.send(fs.readFileSync(path.resolve(__dirname, '../404/404.html'), 'utf-8'))
    }
  })
}
