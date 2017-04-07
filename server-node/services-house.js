'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {
	listWithCal: (req, res, callback)=>{
		//查询数据
		//返回list对象
		db
		//数据库查询
		.dbModel('house')
		.find({}, {
			fang: 1,
			hao: 1,
			createTime: 1,
			updateTime: 1
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			return (async ()=>{
				for (var i = 0; i < data.length; i++) {
					data[i].fang && !data[i].fanghao && (data[i].fanghao = data[i].fang + data[i].hao)
					await (()=>{
						return new Promise((resolved, rejectd)=>{
							db
							.dbModel('watercal')
							.find({haoId: db.db.Types.ObjectId(data[i]._id)})
							.where('userId').equals(db.db.Types.ObjectId(req.userId))
							.where('status').equals(1)
							.limit(3)
							.sort('-addTime')
							.lean()
							.exec()
							.then((calWaters)=>{
								calWaters.forEach((j)=>{
									//小计
									j.tnew.addTime = new Date(j.tnew.addTime).toLocaleDateString()
									!j.gap && (j.gap = (j.tnew.water ? j.tnew.water : 0) - (j.old.water ? j.old.water : 0))
									j.gap <= 0 && (j.gap = 0)
								})
								data[i].calWaters = calWaters
								resolved()
							})
						})
					})()
					await (()=>{
						return new Promise((resolved, rejectd)=>{
							db
							.dbModel('electriccal')
							.find({haoId: db.db.Types.ObjectId(data[i]._id)})
							.where('userId').equals(db.db.Types.ObjectId(req.userId))
							.where('status').equals(1)
							.limit(3)
							.sort('-addTime')
							.lean()
							.exec()
							.then((calElectrics)=>{
								calElectrics.forEach((k)=>{
									//小计
									k.tnew.addTime = new Date(k.tnew.addTime).toLocaleDateString()
									!k.gap && (k.gap = (k.tnew.electric ? k.tnew.electric : 0) - (k.old.electric ? k.old.electric : 0))
									k.gap <= 0 && (k.gap = 0)
								})
								data[i].calElectrics = calElectrics
								resolved()
							})
						})
					})()
				}
				return Promise.reject({
					type: true,
					data: data
				})
			})()
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	}
}