const serviceAuth = require('./services-auth')
const code = require('./config-codes')
const wsCallback = require('./config-wscallback')

// res.json([req.params, req.query, req.body])
// res.json([req.params==url, req.query==get, req.body==post])

// outer类，失败则跳过
const outer = (ws, req, next) => {
  // console.log(req.params)
  ws.send('欢迎访问非鉴权接口...没有匹配路由处理')
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
  // console.log(req.params)
  ws.send('欢迎访问鉴权接口...没有匹配路由处理')
  next()
}

// default类，最后返回
const def = (ws, req) => wsCallback(ws, code(req, 9999))

module.exports = {
  outer,
  auth,
  inner,
  def,
}
