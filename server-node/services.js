'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {

	/***登陆类******************************************************************************************************************/

	login: (req, res, callback)=>{
		if (!req.body.name) {
			callback({
				type: false,
				data: '请输入用户名'
			})
		} else if (!req.body.pwd) {
			callback({
				type: false,
				data: '请输入密码'
			})
		} else {
			//生成新token
			let _tokenTime = new Date().getTime()
			let _token = md5(req.ip + req.body.name + req.body.pwd + _tokenTime)
			let _userId
			//db类操作，异步同步化
			db
			//数据库查询用户名和密码校验
			.dbModel('admin')
			.findOne({name: req.body.name, pwd: req.body.pwd})
			.exec()
			.then((dbData)=>{
				if (!dbData) {
					return Promise.reject({
						type: false,
						data: '用户名/密码错误'
					})
				} else {
					_userId = dbData.id
					return dbData 
				}
			})
			//查出已有的登陆态
			.then((dbData)=>{
				return db.redisGetKeys(dbData._id.toString() + '$*')
			})
			//旧token失效？
			.then((reKeysData)=>{
				if (reKeysData.length) {
					return db.redisDelKeys(reKeysData)
				} else {
					return true
				}
			})
			//更新缓存，存缓存token:userid，1800秒
			.then(()=>{
				return db.redisSet(_userId.toString() + '$' + _token, _userId.toString(), 1800)
			})
			//返回token
			.then(()=>{
				return Promise.reject({
					type: true,
					data: _token
				})
			})
			.catch((err)=>{
				callback({
					type: err.type || false,
					data: err.data || err.message
				})
			})
		}
	},
	bingBg: (req, res, callback)=>{
		let bingBg = superagent.get('http://global.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=' + new Date().getTime() + '&pid=hp&video=1&fav=1&setmkt=en-us&setlang=en-us').end((err, res)=>{
			if (!err) {
				callback({
					type: true,
					data: res.body
				})
			} else {
				callback({
					type: false,
					data: err
				})
			}
		})
	},

	/***权限类******************************************************************************************************************/

	auth: (req, res, callback)=>{
		//db类操作，异步同步化
		db
		//查询缓存token
		.redisGetKeys('*$' + req.body.token)
		.then((reKeysData)=>{
			if (reKeysData[0]) {
				return reKeysData[0]
			} else {
				return Promise.reject({
					type: false
				})
			}
		})
		//刷新缓存时间
		.then((reKeysData)=>{
			return db.redisSetTime(reKeysData, 1800)
		})
		.then(()=>{
			return Promise.reject({
				type: true
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},

	/***inner类******************************************************************************************************************/

	getData: (req, res, callback)=>{


		db
			.dbModel('admin')
			.find({name:req.body.name})
			.exec((err, db)=>{
				if (err) {
					callback({
						type: false,
						data: err
					})
				} else {
					callback({
						type: true,
						data: db
					})
				}
			})
	},
	saveData: (req, res, callback)=>{


		db
			.dbModel('admin',{name:'string'})
			.create({name:req.body.name}, (err, db)=>{
				if (err) {
					callback({
						type: false,
						data: err
					})
				} else {
					callback({
						type: true,
						data: db
					})
				}
			})
	},
	removeData: (req, res, callback)=>{
		if (!req.body.name) {
			return callback({
				type: false,
				data: '未定义删除关键字'
			})
		}
		db
			.dbModel('admin')
			.remove({}, (err, db)=>{
				if (err) {
					callback({
						type: false,
						data: err
					})
				} else {
					callback({
						type: true,
						data: db
					})
				}
			})
	},
	redisSet: (req, res, callback)=>{


		db.redisSet(req.body.setname, req.body.setval, req.body.settime || 0, (err, reply)=>{
			if (err) {
				callback({
					type: false,
					data: err
				})
			} else {
				callback({
					type: true,
					data: reply
				})
			}
		})
	},
	redisGet: (req, res, callback)=>{


		db.redisGet(req.body.setname, (err, reply)=>{
			if (err) {
				callback({
					type: false,
					data: err
				})
			} else {
				callback({
					type: true,
					data: reply
				})
			}
		})
	}
}