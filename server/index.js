// 启动服务
const http = require('http')
const express = require('express')
const expressWs = require('express-ws')
const compress = require('compression')
const bodyParser = require('body-parser')
const log4js = require('log4js')

const configLog = require('./config-log')
const db = require('./models')

// 初始化logs
log4js.configure(configLog)
const sysLog = log4js.getLogger('sys')
sysLog.info('--------------------------------------')
sysLog.info(new Date())

// 启动缓存链接
db.redisct()
// 启动数据库链接
db.connect()

// 启动路由及端口处理
const app = express()
const httpServer = http.createServer(app)
const httpPORT = process.env.npm_config_port || 80
expressWs(app, httpServer)

// 中间件，初始化ws记录
app.ws('*', (ws, req, next) => {
  log4js.getLogger('ws').info(
    req.headers['x-real-ip'],
    req.method,
    req.url,
    `HTTP/${req.httpVersion}`,
    req.headers.origin,
    `"${req.headers['user-agent']}"`,
  )
  return next()
})

// 中间件，初始化http记录
// log4js有内置http记录中间件
app.use(log4js.connectLogger(
  log4js.getLogger('http'),
  { level: 'auto' },
))

// 中间件，使用gzip
app.use(compress())

// 中间件，处理使用post&json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 处理路由
require('./routes')(app)

// 启动监听
httpServer.listen(
  httpPORT,
  sysLog.info.bind(sysLog, `TechNode http is on port ${httpPORT} !`),
)
