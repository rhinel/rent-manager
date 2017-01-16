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
	}
}