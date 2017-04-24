'use strict'

//启动服务
let http = require('http')
let https = require('https')
let fs = require('fs')

let express = require('express')
let bodyParser = require('body-parser')
let db = require('./models')

//启动缓存链接
db.redisct()
//启动数据库链接
db.connect()

//启动路由及端口处理
let app = express()
let reapp = express()
//http转发
let httpServer = http.createServer(reapp)
reapp.all('*', function(req, res) {
  return res.redirect("https://" + req.headers["host"] + req.url)
})
//https-ssl
let httpsServer = https.createServer({
	key: fs.readFileSync('../../../ssl-key/ssl-rhinel.xyz/ssl-key.key', 'utf8'),
	cert: fs.readFileSync('../../../ssl-key/ssl-rhinel.xyz/ssl-key.crt', 'utf8')
}, app)
httpsServer.addContext('www.rhinel.xyz', {
	key: fs.readFileSync('../../../ssl-key/ssl-www.rhinel.xyz/ssl-key.key', 'utf8'),
	cert: fs.readFileSync('../../../ssl-key/ssl-www.rhinel.xyz/ssl-key.crt', 'utf8')
})
httpsServer.addContext('wechat.rhinel.xyz', {
	key: fs.readFileSync('../../../ssl-key/ssl-wechat.rhinel.xyz/ssl-key.key', 'utf8'),
	cert: fs.readFileSync('../../../ssl-key/ssl-wechat.rhinel.xyz/ssl-key.crt', 'utf8')
})
const httpPORT = process.env.HTTPPORT || 80
const httpsPORT = process.env.HTTPSPORT || 443
app.use(express.static(__dirname + '/'))
//使用post&json
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//处理路由
require('./routes')(app, express)

//启动监听
console.log('--------------------------------------')
console.log(new Date())
httpServer.listen(httpPORT, ()=>{
	console.log('TechNode http is on port ' + httpPORT + '!') 
})
httpsServer.listen(httpsPORT, ()=>{
	console.log('TechNode https is on port ' + httpsPORT + '!') 
})