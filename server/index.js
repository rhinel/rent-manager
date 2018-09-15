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
// 请求级别的日志
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
// 请求级别的日志
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

// 全局错误
// 架构没有统一处理全局错误
// uncaughtException用于处理优雅退出
// https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
// unhandledRejection也将处理为non-zero code exit
// (node:6856) DeprecationWarning: Unhandled promise rejections are deprecated.
// In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 因此全局错误应当作为程序退出，并且由外部守护进程处理
// 否则你根本不可能及时发现它

// 更好的异常处理方式：
// index - route - controller - model分别有各自的错误拦截
// service中也应该具有自己的错误传递方式，尤其是异步错误

// 启动监听
httpServer.listen(
  httpPORT,
  sysLog.info.bind(sysLog, `TechNode http is on port ${httpPORT} !`),
)
