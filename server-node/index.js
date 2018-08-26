// 启动服务
const http = require('http')
const express = require('express')
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

// 初始化http记录
app.use(log4js.connectLogger(
  log4js.getLogger('http'),
  { level: 'auto' },
))

// 使用gzip
app.use(compress)

// 使用post&json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 处理路由
require('./routes')(app)

// 启动监听
httpServer.listen(
  httpPORT,
  sysLog.info.bind(sysLog, `TechNode http is on port ${httpPORT} !`),
)
