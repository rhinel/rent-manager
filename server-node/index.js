// 启动服务
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const log4js = require('log4js')

const configLog = require('./config-log')
const db = require('./models')

// 启动缓存链接
db.redisct()
// 启动数据库链接
db.connect()

// 启动路由及端口处理
const app = express()

// http转发
const httpServer = http.createServer(app)
const httpPORT = process.env.npm_config_port || 80

// 初始化logs和http记录
log4js.configure(configLog)
app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }))

// 路由
app.use(express.static(`${__dirname}/`))

// 使用post&json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 处理路由
require('./routes')(app, express)

// 启动监听
const sysLog = log4js.getLogger('sys')
sysLog.info('--------------------------------------')
sysLog.info(new Date())
httpServer.listen(httpPORT, sysLog.info(`TechNode http is on port ${httpPORT} !`))
