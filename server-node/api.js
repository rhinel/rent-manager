'use strict'

let db = require('./db')
let fs = require('fs')
let path = require('path')
//启动数据库链接
db.connect()

module.exports = (app)=>{
	//用户权限校验处理
	app.route('/api/*').post((req, res, next)=>{
		app.locals.user = req.body.secret || req.query.secret || ''
		if (!app.locals.user) {
			res.json({code:999,msg:'未登录'})
		} else {
			next()
		}
	})

	//接口控制器
	app.route('/api/:class/:function').post((req, res)=>{
		db.findData('admin', (err, db)=>{
			if (err) {
				res.json(err)
			} else {
				res.json({code:0,data:db})
			}
		})
		//res.json([req.params,req.query,req.body])
		//res.json([req.params==url,req.query==get,req.body==post])
	})

	//处理页面, 动态加载
	app.get('*', (req, res)=>{
		res.send(fs.readFileSync(path.resolve('../index.html'), 'utf-8'))
	})
}