'use strict'

let express = require('express')
let bodyParser = require('body-parser')
let db = require('./models')

//启动缓存链接
db.redisct()
//启动数据库链接
db.connect()

//启动路由
let app = express()
const port = process.env.PORT || 80
app.use(express.static(__dirname + '/'))
//使用post&json
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
//处理路由
require('./routes')(app)

//启动监听
app.listen(port, ()=>{
	console.log('TechNode is on port ' + port + '!') 
})