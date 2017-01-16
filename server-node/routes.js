'use strict'

let fs = require('fs')
let path = require('path')
let controller = require('./controllers')

module.exports = (app)=>{
	//非权限接口
	app.route('/api/outer/:class/:function').post(controller.outer)
	//用户权限校验处理
	app.route('/api/inner/*').post(controller.auth)
	//权限接口控制器
	app.route('/api/inner/:class/:function').post(controller.inner)
	//默认返回
	app.route('/api/*').post(controller.def)

	//处理页面, 动态加载
	app.get('*', (req, res)=>{
		res.send(fs.readFileSync(path.resolve('../index.html'), 'utf-8'))
	})
}