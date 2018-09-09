const serviceAuth = require('./services-auth')
const serviceRemoteRead = require('./services-electric-remote-read')
const code = require('./config-codes')
const wsCallback = require('./config-wscallback')

// res.json([req.params, req.query, req.body])
// res.json([req.params==url, req.query==get, req.body==post])

// outer类，失败则跳过
const outer = (ws, req, next) => {
  next()
}

// auth类，成功则跳过
const auth = (ws, req, next) => {
  // 接口校验
  const token = req.body.token || req.query.token || ''
  if (!token) {
    wsCallback(ws, code(req, 2001))
  } else {
    serviceAuth
      .auth(req, ws)
      .then(next)
      .catch(err => wsCallback(ws, code(req, 2001, err)))
  }
}

// inner类，失败则跳过
const inner = (ws, req, next) => {
  // 登陆类
  if (req.params.class === 'electric') {
    // 登录接口
    if (req.params.function === 'remoteRead') {
      serviceRemoteRead
        .remoteRead(req, ws)
        .then(data => wsCallback(ws, 'close', code(req, 0, data)))
        .catch(err => wsCallback(ws, code(req, 3049, err)))
    } else {
      next()
    }
  } else {
    next()
  }
}

// default类，最后返回
const def = (ws, req) => wsCallback(ws, code(req, 9999))

module.exports = {
  outer,
  auth,
  inner,
  def,
}
