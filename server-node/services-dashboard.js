'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {
	count: (req, res, callback)=>{
		//查询房屋数
		let count = {}
		db.dbModel('lease')
		db
		.dbModel('house')
		.find({
			userId: db.db.Types.ObjectId(req.userId),
			status: 1
		})
		.populate({
			path: 'leaseId',
			model: 'lease',
			match: {status: 1}
		})
		.lean()
		.exec()
		.then((data)=>{
			count.leaseEmpty = 0
			count.houseCount = data.length
			data.forEach((i)=>{
				!i.leaseId && (count.leaseEmpty ++)
			})
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
	leaseEmptyList: (req, res, callback)=>{
		//查询房屋数
		let count = {}
		db.dbModel('lease')
		db
		.dbModel('house')
		.find({
			userId: db.db.Types.ObjectId(req.userId),
			status: 1
		})
		.populate({
			path: 'leaseId',
			model: 'lease'
		})
		.lean()
		.exec()
		.then((data)=>{
			let count = []
			data.forEach((i)=>{
				if (!i.leaseId) {
					i.leaseId = {}
					count.push(i)
				} else if (i.leaseId.status != 1) {
					count.push(i)
				}
			})
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
		let today = new Date().getDate()
		let month = new Date().getMonth()
		let year = new Date().getFullYear()
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
				'type.type': { '$ne': req.body.type, '$in': [1] }
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
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.lean()
		.exec()
		.then((data)=>{
			let isToday = []
			let isTodayCount = 0
			data.forEach((i)=>{
				if (i.lease.payDay <= today && new Date(i.monthId.month).getMonth() >= month && new Date(i.monthId.month).getFullYear() >= year
				 || new Date(i.monthId.month).getMonth() < month
				 || new Date(i.monthId.month).getFullYear() < year) {
					isTodayCount += i.calRentResult
					isToday.push(i)
				}
			})
			return Promise.reject({
				type: true,
				data: {
					data: data,
					isToday: isToday,
					isTodayCountMoney: isTodayCount
				}
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	waitingListCount: (req, res, callback)=>{
		//判断类型
		//查询列表
		//
		let seach
		let today = new Date().getDate()
		let month = new Date().getMonth()
		let year = new Date().getFullYear()
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
				'type.type': { '$ne': req.body.type, '$in': [1] }
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
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.lean()
		.exec()
		.then((data)=>{
			let isToday = 0
			let count = 0
			data.forEach((i)=>{
				if (i.lease.payDay <= today && new Date(i.monthId.month).getMonth() >= month && new Date(i.monthId.month).getFullYear() >= year
				 || new Date(i.monthId.month).getMonth() < month
				 || new Date(i.monthId.month).getFullYear() < year) {
					count += i.calRentResult
					isToday += 1
				}
			})
			return Promise.reject({
				type: true,
				data: {
					count: data.length,
					isTodayCountMoney: count,
					isTodayCount: isToday
				}
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	okList: (req, res, callback)=>{
		//判断类型
		//查询列表
		let today = new Date().getDate()
		let month = new Date().getMonth()
		let year = new Date().getFullYear()
		let theMonth = {}

		return (async ()=>{
			//查询最新月度ID
			await (()=>{
				return new Promise((resolved, rejectd)=>{
					db
					.dbModel('month')
					.findOne({}, {
			            month: 1,
			            remark: 1,
			            createTime: 1,
			            updateTime: 1
			        })
			        .where('userId').equals(db.db.Types.ObjectId(req.userId))
			        .where('status').equals(1)
			        .sort('-month')
			        .lean()
			        .exec()
			        .then((data)=>{
			        	theMonth = data
			        	resolved()
			        })
				})
			})()
			let seach = {
				'type.type': { '$in': [req.body.type] },
				monthId: db.db.Types.ObjectId(theMonth._id)
			}
			let count = 0
			let countMoney = 0
			let isToday = []
			//查询统计
			await (()=>{
				return new Promise((resolved, rejectd)=>{
					db
					.dbModel('rent')
					.find(seach)
					.populate({
						path: 'monthId',
						model: 'month',
						select: 'month',
						match: {status: 1}
					})
					.where('userId').equals(db.db.Types.ObjectId(req.userId))
					.where('status').equals(1)
					.lean()
					.exec()
					.then((data)=>{
						count = data
						data.forEach((i)=>{
							if (i.lease.payDay <= today || new Date(i.monthId.month).getMonth() < month || new Date(i.monthId.month).getFullYear() < year) {
								countMoney += i.calRentResult
								isToday.push(i)
							}
						})
						resolved()
					})
				})
			})()
			return Promise.reject({
				type: true,
				data: {
					data: count,
					isTodayCountMoney: countMoney,
					isToday: isToday,
					month: theMonth.month
				}
			})
		})()
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	okListCount: (req, res, callback)=>{
		//判断类型
		//查询列表
		let today = new Date().getDate()
		let month = new Date().getMonth()
		let year = new Date().getFullYear()
		let theMonth = {}

		return (async ()=>{
			//查询最新月度ID
			await (()=>{
				return new Promise((resolved, rejectd)=>{
					db
					.dbModel('month')
					.findOne({}, {
			            month: 1,
			            remark: 1,
			            createTime: 1,
			            updateTime: 1
			        })
			        .where('userId').equals(db.db.Types.ObjectId(req.userId))
			        .where('status').equals(1)
			        .sort('-month')
			        .lean()
			        .exec()
			        .then((data)=>{
			        	theMonth = data
			        	resolved()
			        })
				})
			})()
			let seach = {
				'type.type': { '$in': req.body.type },
				monthId: db.db.Types.ObjectId(theMonth._id)
			}
			let count = 0
			let countMoney = 0
			let isToday = 0
			//查询统计
			await (()=>{
				return new Promise((resolved, rejectd)=>{
					db
					.dbModel('rent')
					.find(seach)
					.populate({
						path: 'monthId',
						model: 'month',
						select: 'month',
						match: {status: 1}
					})
					.where('userId').equals(db.db.Types.ObjectId(req.userId))
					.where('status').equals(1)
					.lean()
					.exec()
					.then((data)=>{
						count = data.length
						data.forEach((i)=>{
							countMoney += i.calRentResult
							if (i.lease.payDay <= today || new Date(i.monthId.month).getMonth() < month || new Date(i.monthId.month).getFullYear() < year) {
								isToday += 1
							}
						})
						resolved()
					})
				})
			})()
			return Promise.reject({
				type: true,
				data: {
					count: count,
					countMoney: countMoney,
					isTodayCount: isToday,
					month: theMonth.month
				}
			})
		})()
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	}
}