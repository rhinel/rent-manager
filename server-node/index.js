'use strict'

//启动服务
let http = require('http')
let https = require('https')
let fs = require('fs')
let privateKey  = fs.readFileSync('../../ssl-key/ssl-key.key', 'utf8')
let certificate = fs.readFileSync('../../ssl-key/ssl-key.crt', 'utf8')
let credentials = {key: privateKey, cert: certificate}

let express = require('express')
let bodyParser = require('body-parser')
let db = require('./models')

//启动缓存链接
db.redisct()
//启动数据库链接
db.connect()

//启动路由及端口处理
let app = express()
let httpServer = http.createServer(app)
let httpsServer = https.createServer(credentials, app)
const httpPORT = process.env.HTTPPORT || 80
const httpsPORT = process.env.HTTPSPORT || 443
app.use(express.static(__dirname + '/'))
//使用post&json
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
//处理路由
require('./routes')(app, express)

//启动监听
console.log(new Date())
httpServer.listen(httpPORT, ()=>{
	console.log('TechNode http is on port ' + httpPORT + '!') 
})
httpsServer.listen(httpsPORT, ()=>{
	console.log('TechNode https is on port ' + httpsPORT + '!') 
})