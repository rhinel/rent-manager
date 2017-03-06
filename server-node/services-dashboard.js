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
	}
}