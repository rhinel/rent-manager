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
	logout: (req, res, callback)=>{
		if (!req.body.token) {
			callback({
				type: true
			})
		} else {
			//db类操作，异步同步化
			db
			//查询
			.redisGetKeys('*$' + req.body.token)
			//清除
			.then((reKeysData)=>{
				if (reKeysData.length) {
					return db.redisDelKeys(reKeysData)
				} else {
					return true
				}
			})
			.then(()=>{
				return Promise.reject({
					type: true
				})
			})
			.catch((err)=>{
				callback({
					type: err.type || false,
					data: err.message || ''
				})
			})
		}
	},
	bingBg: (req, res, callback)=>{
		let bingBg = superagent.get('http://global.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=' + Date.now() + '&pid=hp&video=1&fav=1&setmkt=en-us&setlang=en-us').end((err, res)=>{
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
		.redisGetKeys('*$' + (req.body.token || req.query.token))
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
			req.userId = reKeysData.split('$')[0]
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

	/***inner类***房屋管理-增删改查***************************************************************************************************/

	houseAdd: (req, res, callback)=>{
		if (!req.body.fang) {
			callback({
				type: false,
				data: '请填写坊号'
			})
		} else if (!req.body.hao) {
			callback({
				type: false,
				data: '请填写房间号'
			})
		} else if (req.body._id) {
			db
			//根据ID修改内容
			.dbModel('house', {
				fang: String, //坊号，全拼
				hao: String, //房间号，全拼
				detail: String, //说明
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {'$set': {
				fang: req.body.fang,
				hao: req.body.hao,
				detail: req.body.detail,
				updateTime: Date.now()
			}})
			.exec()
			.then((data)=>{
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
		} else {
			db
			//数据库查询是否已存在
			.dbModel('house')
			.find({
				userId: req.userId,
				fang: req.body.fang,
				hao: req.body.hao,
				status: 1
			})
			.exec()
			.then((data)=>{
				if (data.length) {
					return Promise.reject({
						type: false,
						data: '房间已存在'
					})
				} else {
					return Promise.resolve()
				}
			})
			//插入数据
			.then(()=>{
				return db
				.dbModel('house', {
					userId: String, //用户ID
					fang: String, //坊号，全拼
					hao: String, //房间号，全拼
					detail: String, //说明
					status: Number, //状态
					createTime: Number //创建时间
				})
				.create({
					userId: req.userId,
					fang: req.body.fang,
					hao: req.body.hao,
					detail: req.body.detail,
					status: 1,
					createTime: Date.now()
				})
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true
						})
					} else {			
						return Promise.reject({
							type: false
						})
					}
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
	houseGetList: (req, res, callback)=> {
		db
		//数据库查询
		.dbModel('house')
		.find({}, {
			fang: 1,
			hao: 1,
			detail: 1,
			createTime: 1,
			updateTime: 1
		})
		.where('userId').equals(req.userId)
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelHouse && (i.gettingdelHouse = false)
			})
			return Promise.reject({
				type: true,
				data: data
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	houseDel: (req, res, callback)=>{
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			db
			//根据ID修改状态
			.dbModel('house', {
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {'$set': {
				status: 0,
				updateTime: Date.now()
			}})
			.exec()
			.then((data)=>{
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
		}
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