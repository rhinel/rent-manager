'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {
	count: (req, res, callback)=>{
		//查询房屋数
		let count = {}
		db
		.dbModel('house')
		.find({
			userId: db.db.Types.ObjectId(req.userId),
			status: 1
		})
		.exec()
		.then((data)=>{
			count.houseCount = data.length
			return Promise.reject({
				type: true,
				data: count
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	addNote: (req, res, callback)=>{
		//不做数据校验
		//判断ID
		//不需要查重
		//返回被添加对象
		if (req.body._id) {
			db
			.dbModel('note', {//*//标记，初始记事数据类，修改类型
				haoId: db.db.Schema.Types.ObjectId,
				content: String, //内容
				addTime: String, //记事时间
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				haoId: db.db.Types.ObjectId(req.body.haoId),
				content: req.body.content,
				addTime: req.body.addTime, //记事时间
				status: req.body.status,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: data
					})
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			.catch((err)=>{
				callback({
					type: err.type || false,
					data: err.data || err.message
				})
			})
		} else {
			db
			.dbModel('note', {//*//标记，初始记事数据类
				haoId: db.db.Schema.Types.ObjectId,
				userId: db.db.Schema.Types.ObjectId,
				content: String, //内容
				status: Number, //状态
				addTime: String, //记事时间
				createTime: Number //创建时间
			})
			.create({
				haoId: db.db.Types.ObjectId(req.body.haoId),
				userId: db.db.Types.ObjectId(req.userId),
				content: req.body.content,
				status: 1, //状态
				addTime: req.body.addTime, //记事时间
				createTime: Date.now() //创建时间
			})
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: data
					})
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			.catch((err)=>{
				callback({
					type: err.type || false,
					data: err.data || err.message
				})
			})
		}
	},
	notes: (req, res, callback)=>{
		//查询记事
		//返回list对象
		db.dbModel('house')
		db
		.dbModel('note')
		.find({
			userId: db.db.Types.ObjectId(req.userId),
			status: {
				'$lte': 2,
				'$gte': 1
			}
		})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.sort('status -addTime')
		.exec()
		.then((data)=>{
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
	waitingList: (req, res, callback)=>{
		//判断类型
		//查询列表
		//
		let seach
		if (req.body.type == 1) {
			seach = {
				$or: [
					{
						type: null
					},
					{
						'type.type': { '$ne': 1 }
					}
				]
			}
		} else {
			seach = {
				'type.type': { '$nin': [null, req.body.type] }
			}
		}
		db.dbModel('month')
		db
		.dbModel('rent')
		.find(seach)
		.populate({
			path: 'monthId',
			model: 'month',
			select: 'month',
			match: {status: 1}
		})
		.where('status').equals(1)
		.lean()
		.exec()
		.then((data)=>{
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
	}
}