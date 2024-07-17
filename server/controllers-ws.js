const serviceAuth = require('./services-auth')
const serviceRemoteRead = require('./services-electric-remote-read')
const code = require('./config-codes')
const { WsSend } = require('./config-wscallback')

// res.json([req.params, req.query, req.body])
// res.json([req.params==url, req.query==get, req.body==post])
// websocket 由于需要保持连接
// 不需要统一处理返回，由各个接口单独处理
// 仅统一处理最高级别错误并关闭连接

// outer类，失败则跳过
const outer = (ws, req, next) => {
  next()
}

// auth类，成功则跳过
const auth = (ws, req, next) => {
  // 接口校验
  const token = req.body.token || req.query.token || ''
  if (!token) {
    WsSend(ws, code(req, 2001))
  } else {
    serviceAuth
      .auth(req, ws)
      .then(next)
      .catch(err => WsSend(ws, code(req, 2001, err)))
  }
}

// inner类，失败则跳过
const inner = (ws, req, next) => {
  // 登录类
  if (req.params.class === 'electric') {
    // 登录接口
    if (req.params.function === 'remoteRead') {
      serviceRemoteRead
        .remoteRead(req, ws)
        .catch(err => WsSend(ws, code(req, 3049, err)))
    } else {
      next()
    }
  } else {
    next()
  }
}

// default类，最后返回
const def = (ws, req) => WsSend(ws, code(req, 9999))

module.exports = {
  outer,
  auth,
  inner,
  def,
}
