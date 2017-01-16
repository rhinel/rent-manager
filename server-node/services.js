'use strict'

let db = require('./models')

module.exports = {
	login: (req, res, callback)=>{
		if (req.body.username == 'ok') {
			callback({
				type: true,
				data: 'ok'
			})
		} else {
			callback({
				type: false,
				data: 'nok'
			})
		}
	},
	auth: (req, res, callback)=>{
		if (req.body.secret=='abc') {
			callback({
				type: true
			})
		} else {
			callback({
				type: false,
				data: '没有权限啊'
			})
		}
	},
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