'use strict'

let fs = require('fs')
let path = require('path')
let controller = require('./controllers')

module.exports = (app, express)=>{
	//log
	app.post('*', (req, res)=>{
		console.log('--------------------------------------')
		console.log(new Date())
		console.log('ip:' + req.ip)
		console.log('header:' + JSON.stringify(req.headers))
		console.log('hostName:' + req.hostname)
		console.log('url:' + req.originalUrl)
		req.next()
	})
	app.get('*', (req, res)=>{
		console.log('--------------------------------------')
		console.log(new Date())
		console.log('ip:' + req.ip)
		console.log('header:' + JSON.stringify(req.headers))
		console.log('hostName:' + req.hostname)
		console.log('url:' + req.originalUrl)
		req.next()
	})
	//非权限接口
	app.route('/api/outer/:class/:function').post(controller.outer)
	//用户权限校验处理
	app.route('/api/inner/*').post(controller.auth)
	//权限接口控制器
	app.route('/api/inner/:class/:function').post(controller.inner)
	//默认返回
	app.route('/api/*').post(controller.def)

	//处理页面, 动态加载
	app.use(express.static(path.resolve(__dirname, '../dist')))
	app.get('*', (req, res)=>{
		if (req.hostname && req.hostname == 'wechat.rhinel.xyz') {
			res.send(fs.readFileSync(path.resolve('../dist/mobileside/index.html'), 'utf-8'))
		} else if (req.hostname && req.hostname == 'www.rhinel.xyz') {
			res.send(fs.readFileSync(path.resolve('../dist/pcside/index.html'), 'utf-8'))
		} else {
			res.send('页面飘走了！')
		}
	})
}