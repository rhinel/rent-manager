'use strict'

let fs = require('fs')
let path = require('path')
let controller = require('./controllers')

module.exports = (app, express)=>{
	//log
	app.all('*', (req, res)=>{
		console.log('--------------------------------------')
		console.log(new Date())
		console.log('ip:' + req.ip)
		console.log('header:' + JSON.stringify(req.headers))
		console.log('hostName:' + req.hostname)
		console.log('url:' + req.originalUrl)
		req.next()
	})
	
	//接口，不做接口校验
	//非权限接口
	app.route('/api/outer/:class/:function').post(controller.outer)
	//用户权限校验处理
	app.route('/api/inner/*').post(controller.auth)
	//权限接口控制器
	app.route('/api/inner/:class/:function').post(controller.inner)
	//默认返回
	app.route('/api/*').post(controller.def)

	//处理页面, 动态加载
	app.use('/static', express.static(path.resolve(__dirname, '../dist/static')))
	app.use('/assets', express.static(path.resolve(__dirname, '../../rhinel.xyz/assets')))
	app.get('*', (req, res)=>{
		//wechat
		if (req.hostname && (
			   req.hostname == 'wechat.rhinel.xyz'
			|| req.hostname == 'wechat.rent-manager.online'
			|| req.hostname == 'wechat.rent-manager.cn'
			)) {
			res.send(fs.readFileSync(path.resolve('../dist/mobileside/index.html'), 'utf-8'))
		//SaaS
		} else if (req.hostname && (
			   req.hostname == 'www.rhinel.xyz'
			|| req.hostname == 'www.rent-manager.online'
			|| req.hostname == 'www.rent-manager.cn'
			|| req.hostname == 'rent-manager.online'
			|| req.hostname == 'rent-manager.cn'
			)) {
			res.send(fs.readFileSync(path.resolve('../dist/pcside/index.html'), 'utf-8'))
		//mypage
		} else if (req.hostname && (
			   req.hostname == 'rhinel.xyz'
			)) {
			res.send(fs.readFileSync(path.resolve('../../rhinel.xyz/index.html'), 'utf-8'))
		} else {
			res.send('页面飘走了！')
		}
	})
}