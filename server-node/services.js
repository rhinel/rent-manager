'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {

	/***登陆类******************************************************************************************************************/

	login: (req, res, callback)=>{
		//校验字段，错误退出
		//根据MD5(IP，用户名，密码，时间)生成token
		//查询数据库用户名密码，错误退出
		//查出登陆缓存
		//失效旧缓存
		//写入缓存新token
		//返回token
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
			
			//1查询数据是否有超5次错误
			db
			.redisGet(req.ip)
			.then((data)=>{
				if (data && data >= 5) {
					return Promise.reject({
						type: false,
						data: '用户名/密码错误超过5次，请等待5分钟后再次登陆'
					})
				} else {
					return true
				}
			})
			//2数据库查询用户名和密码校验
			.then(()=>{
				return db
				.dbModel('admin')
				.findOne({name: req.body.name, pwd: req.body.pwd})
				.exec()
				.then((dbData)=>{
					if (!dbData) {
						//账号密码错误次数5分钟机制
						return db
						.redisIncrKeys(req.ip)
						.then((data)=>{
							return db
							.redisSetTime(req.ip, 300)
							.then(()=>{
								return data
							})
						})
						.then((data)=>{
							let errorTimes = 5 - data
							errorTimes = errorTimes < 0 ? 0 : errorTimes
							return Promise.reject({
								type: false,
								data: '用户名/密码错误，5分钟内您还有' + errorTimes + '次机会'
							})
						})
					} else {
						//成功清除错误记录
						return db
						.redisDelKeys(req.ip)
						.then(()=>{
							_userId = dbData.id
							return dbData
						})
					}
				})
			})			
			//3查出已有的登陆态，更新状态
			.then((dbData)=>{
				return db.redisGetKeys(dbData._id.toString() + '$*')
				//旧token失效？
				.then((reKeysData)=>{
					if (reKeysData.length) {
						// return db.redisDelKeys(reKeysData)
						return true
					} else {
						return true
					}
				})
				//更新缓存，存缓存token:userid，1800秒
				.then(()=>{
					return db.redisSet(_userId.toString() + '$' + _token, _userId.toString(), 1800)
				})
			})
			//4返回token
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
		//校验字段，错误true退出
		//清除缓存
		//返回空
		if (!req.body.token) {
			callback({
				type: true
			})
		} else {
			//db类操作，异步同步化
			db
			//查询
			.redisGetKeys('*$' + req.body.token)
			//清除缓存
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
		//查询api，错误退出
		//返回bg对象
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
		//不校验字段
		//查询缓存，错误退出
		//更新缓存
		//返回空
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
		//刷新缓存时间，获取USERID
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

	/*
		房屋对象挂载
		用户ID ok
		水费抄表ID ok
		水费计费ID ok
		电费抄表ID ok
		电费计费ID ok
		租户ID ok
		收租ID ok
	*/

	houseAdd: (req, res, callback)=>{
		//校验字段，错误退出
		//ID存在修改数据，错误退出
		//ID不存在查询数据是否存在，存在->错误退出
		//插入数据，错误退出
		//返回add对象
		if (!req.body.fang) {
			callback({
				type: false,
				data: '请选择坊号'
			})
		} else if (!req.body.hao) {
			callback({
				type: false,
				data: '请填写房间号'
			})
		} else if (req.body._id) {
			db
			//根据ID修改内容
			.dbModel('house', {//*//标记，初始房屋数据类，修改类型
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
				if (data) {
					return Promise.reject({
						type: true,
						data: data
					})
				} else {
					return Promise.reject({
						type: false,
						data: '修改失败，数据不存在'
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
			//数据库查询是否已存在
			.dbModel('house')
			.find({
				userId: db.db.Types.ObjectId(req.userId),
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
				.dbModel('house', {//*//标记，初始房屋数据类，创建类型
					userId: db.db.Schema.Types.ObjectId, //用户ID
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
							type: true,
							data: data
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
	houseFind: (req, res, callback)=>{
		//不校验字段
		//查询数据，错误退出
		//返回find对象
		db
		//数据库查询
		.dbModel('house')
		.findOne({_id: req.body._id})
		.where('status').equals(1)
		.exec()
		.then((data)=>{
			if (data) {
				return Promise.reject({
					type: true,
					data: data
				})
			} else {
				return Promise.reject({
					code: 30141,
					type: false,
					data: '数据不存在'
				})
			}	
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	houseList: (req, res, callback)=>{
		//查询数据
		//返回list对象
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
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelHouse && (i.gettingdelHouse = false)
				//del提示字段提供
				!i.dHousePopFlag && (i.dHousePopFlag = false)
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
		//校验字段，错误提出
		//修改状态
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			db
			//根据ID修改状态
			.dbModel('house', {//*//标记，初始房屋数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
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
	},

	/***inner类****水费管理********************************************************************************************************/

	/*
		水费抄表对象挂载
		用户ID ok
		房屋ID ok
		水费计费对象挂载
		用户ID ok
		房屋ID ok
	*/

	waterAdd: (req, res, callback)=>{
		//校验数据，错误退出
		//插入数据，错误退出
		//更新房屋挂载ID，错误退出
		//返回add对象
		if (!req.body.haoId) {
			callback({
				type: false,
				data: '请选择房屋'
			})
		} else if (!req.body.water) {
			callback({
				type: false,
				data: '请填写水表数'
			})
		} else if (!req.body.addTime) {
			callback({
				type: false,
				data: '请填写抄表时间'
			})
		} else {
			let addData
			db
			//插入水表抄表记录
			.dbModel('water', {//*//标记，初始水表数数据类，新增类型
				userId: db.db.Schema.Types.ObjectId, //用户ID
				haoId: db.db.Schema.Types.ObjectId, //房屋ID
				water: Number, //水表数，全拼
				remark: String, //备注，全拼
				addTime: String, //抄表时间
				status: Number, //状态
				createTime: Number //创建时间
			})
			.create({
				userId: req.userId,
				haoId: req.body.haoId,
				water: req.body.water,
				remark: req.body.remark,
				addTime: req.body.addTime,
				status: 1,
				createTime: Date.now()
			})
			.then((data)=>{
				if (data) {
					addData = data
					return Promise.resolve(data)
				} else {			
					return Promise.reject({
						type: false
					})
				}
			})
			//更新房屋最新水表数信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新抄表数引用类型
					waterId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					waterId: addData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: addData
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
	waterMainList: (req, res, callback)=>{
		//查询房屋数据，抄表记录，计费记录，租户信息
		//水费小计计费
		//返回list对象
		//初始化该库
		db.dbModel('water')
		db.dbModel('watercal')
		db.dbModel('lease')
		db
		//数据库查询
		.dbModel('house')
		.find({}, {
			fang: 1,
			hao: 1,
			waterId: 1,
			calWaterId: 1,
			leaseId: 1
		})
		.populate({
			path: 'waterId',
			model: 'water',
			select: 'water remark addTime',
			match: {status: 1}
		})
		.populate({
			path: 'calWaterId',
			model: 'watercal',
			select: 'tnew addTime',
			match: {status: 1}
		})
		.populate({
			path: 'leaseId',
			model: 'lease',
			select: 'calWaterPrice',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//字段提供
				!i.fanghao && (i.fanghao = i.fang + i.hao)
				//上次水费ID初始化
				!i.calWaterId && (i.calWaterId = {})
				i.calWaterId.tnew && (i.calWaterId.tnew.addTime = i.calWaterId.addTime)
				i.calWaterId.tnew && (i.calWaterId = i.calWaterId.tnew)
				//抄水ID初始化
				!i.waterId && (i.waterId = {})
				//收费方式初始化
				!i.leaseId && (i.leaseId = {})
				i.leaseId.calWaterPrice && (i.leaseId = i.leaseId.calWaterPrice)
				//差距计算
				!i.gap && (i.gap = (i.waterId.water ? i.waterId.water : 0) - (i.calWaterId.water ? i.calWaterId.water : 0))
				i.gap <= 0 && (i.gap = 0)
				//小计计算
				//水表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
				let result = 0
				let theGap = (i.waterId.water || 0) - (i.calWaterId.water || 0)
				let restGap = theGap
				theGap = theGap > 0 ? theGap : 0
				theGap = theGap > i.leaseId.minPrice ? theGap : i.leaseId.minPrice
				if (i.leaseId.calType == 'single') {
					result = theGap * i.leaseId.singlePrice
				} else {
					i.leaseId.stepPrice && i.leaseId.stepPrice.forEach((item, i, arr)=>{
						//假阶梯
						if (theGap > (arr[i-1] ? arr[i-1].step : 0) && theGap <= item.step && item.price != 0) {
							result = theGap * item.price
						} else if (i == (arr.length - 1) && theGap >= item.step && item.price != 0) {
							result = theGap * item.price
						}
					})
					result = Math.round(result * 100) / 100
				}
				!i.result && (i.result = result)
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
	waterList: (req, res, callback)=>{
		//不校验字段
		//查询抄表记录，房屋数据
		//返回list对象
		//初始化该库
		db.dbModel('house')
		db
		//数据库查询
		.dbModel('water')
		.find({haoId: db.db.Types.ObjectId(req.body.haoId)})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelWater && (i.gettingdelWater = false)
				//del提示字段提供
				!i.dWaterPopFlag && (i.dWaterPopFlag = false)
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
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
	waterCalList: (req, res, callback)=>{
		//不校验字段
		//查询计费记录，房屋数据
		//返回list对象
		//初始化该库
		db.dbModel('house')
		db
		//数据库查询
		.dbModel('watercal')
		.find({haoId: db.db.Types.ObjectId(req.body.haoId)})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelCalWater && (i.gettingdelCalWater = false)
				//del提示字段提供
				!i.dCalWaterPopFlag && (i.dCalWaterPopFlag = false)
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
				//小计
				!i.gap && (i.gap = (i.tnew.water ? i.tnew.water : 0) - (i.old.water ? i.old.water : 0))
				i.gap <= 0 && (i.gap = 0)
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
	watercalWater: (req, res, callback)=>{
		//不做数据校验
		//插入数据（存储新抄表记录，旧抄表记录，计费信息），错误退出
		//更新房屋挂载ID，错误提出
		//返回add对象
		let addData
		db
		.dbModel('watercal', {//*//标记，初始水表计费数数据类，新增类型
			userId: db.db.Schema.Types.ObjectId, //用户ID
			haoId: db.db.Schema.Types.ObjectId, //房屋ID，全拼
			tnew: {
				water: Number, //抄表数
				remark: String, //抄表备注
				addTime: String //抄表时间
			},
			old: {
				water: Number, //底表数
				remark: String, //底表备注
				addTime: String //底表时间
			},
			calWater: {
				minPrice: Number, //本次计费低消
				calType: String, //计费类型
				singlePrice: Number, //single单价
				stepPrice: [{ //阶梯价格
					step: Number, //阶梯
					price: Number //单价
				}]
			},
			remark: String, //计费备注
			addTime: String, //计费时间
			fix: Boolean, //结果是否修正
			calWaterResult: Number, //计算结果
			status: Number, //状态
			createTime: Number //创建时间
		})
		.create({
			userId: req.userId,
			haoId: req.body.haoId,
			tnew: req.body.tnew,
			old: req.body.old,
			calWater: req.body.calWater,
			remark: req.body.remark,
			addTime: req.body.addTime,
			fix: req.body.fix,
			calWaterResult: req.body.calWaterResult,
			status: 1,
			createTime: Date.now()
		})
		.then((data)=>{
			if (data) {
				addData = data
				return Promise.resolve(data)
			} else {			
				return Promise.reject({
					type: false
				})
			}
		})
		//更新房屋最新水表计费数信息
		.then((data)=>{
			return db
			.dbModel('house', {//*//标记，更新房屋数据类，扩增最新计费数据引用类型
				calWaterId: db.db.Schema.Types.ObjectId,
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body.haoId}, {
				calWaterId: addData._id,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: addData
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
	},
	waterDel: (req, res, callback)=>{
		//校验数据，错误退出
		//修改状态，错误退出
		//查询上一条数据
		//更新房屋挂载ID，错误退出
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			let delData
			let moveData
			db
			//根据ID修改状态
			.dbModel('water', {//*//标记，初始水表类型数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					delData = data
					return Promise.resolve(data)
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			//查询上一条水表数据
			.then((data)=>{
				return db
				.dbModel('water')
				.findOne({})
				.where('userId').equals(db.db.Types.ObjectId(req.userId))
				.where('haoId').equals(db.db.Types.ObjectId(req.body.haoId))
				.where('status').equals(1)
				.sort('-addTime')
				.exec()
				.then((data)=>{
					if (data) {
						moveData = data
					} else {
						moveData = {_id: null}
					}
					return Promise.resolve(data)
				})
			})
			//更新房屋最新水表数信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新抄水表数引用类型
					waterId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					waterId: moveData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: delData
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
	waterCalDel: (req, res, callback)=>{
		//校验数据，错误退出
		//修改状态，错误退出
		//查询上一条数据
		//更新房屋挂载ID，错误退出
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			let delData
			let moveData
			db
			//根据ID修改状态
			.dbModel('watercal', {//*//标记，初始水费计费数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					delData = data
					return Promise.resolve(data)
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			//查询上一条水表计费数据
			.then((data)=>{
				return db
				.dbModel('watercal')
				.findOne({})
				.where('userId').equals(db.db.Types.ObjectId(req.userId))
				.where('haoId').equals(db.db.Types.ObjectId(req.body.haoId))
				.where('status').equals(1)
				.sort('-addTime')
				.exec()
				.then((data)=>{
					if (data) {
						moveData = data
					} else {
						moveData = {_id: null}
					}
					return Promise.resolve(data)
				})
			})
			//更新房屋最新水表计费信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新水表计费引用类型
					calWaterId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					calWaterId: moveData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: delData
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
	waterFindByDate: (req, res, callback)=>{
		let today = new Date().toLocaleDateString()
		let date = req.body.waterDate || today
		db.dbModel('house')
		db
		.dbModel('water')
		.find({})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.$where(new Function('return new Date(this.addTime).getTime() >= ' + new Date(date).getTime() + ' && new Date(this.addTime).getTime() < ' + (new Date(date).getTime() + 86400000)))
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime -createTime')
		.lean()
		.exec()
		.then((data)=>{
			data.forEach((i)=>{
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
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

	/***inner类****电费管理********************************************************************************************************/

	/*
		电费抄表对象挂载
		用户ID ok
		房屋ID ok
		电费计费对象挂载
		用户ID ok
		房屋ID ok
	*/

	electricAdd: (req, res, callback)=>{
		//校验数据，错误退出
		//插入数据，错误退出
		//更新房屋挂载ID，错误退出
		//返回add对象
		if (!req.body.haoId) {
			callback({
				type: false,
				data: '请选择房屋'
			})
		} else if (!req.body.electric) {
			callback({
				type: false,
				data: '请填写电表数'
			})
		} else if (!req.body.addTime) {
			callback({
				type: false,
				data: '请填写抄表时间'
			})
		} else {
			let addData
			db
			//插入电表抄表记录
			.dbModel('electric', {//*//标记，初始电表数数据类，新增类型
				userId: db.db.Schema.Types.ObjectId, //用户ID
				haoId: db.db.Schema.Types.ObjectId, //房屋ID
				electric: Number, //电表数，全拼
				remark: String, //备注，全拼
				addTime: String, //抄表时间
				status: Number, //状态
				createTime: Number //创建时间
			})
			.create({
				userId: req.userId,
				haoId: req.body.haoId,
				electric: req.body.electric,
				remark: req.body.remark,
				addTime: req.body.addTime,
				status: 1,
				createTime: Date.now()
			})
			.then((data)=>{
				if (data) {
					addData = data
					return Promise.resolve(data)
				} else {			
					return Promise.reject({
						type: false
					})
				}
			})
			//更新房屋最新电表数信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新抄表数引用类型
					electricId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					electricId: addData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: addData
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
	electricMainList: (req, res, callback)=>{
		//查询房屋数据，抄表记录，计费记录，租户信息
		//电费小计计费
		//返回list对象
		//初始化该库
		db.dbModel('electric')
		db.dbModel('electriccal')
		db.dbModel('lease')
		db
		//数据库查询
		.dbModel('house')
		.find({}, {
			fang: 1,
			hao: 1,
			electricId: 1,
			calElectricId: 1,
			leaseId: 1
		})
		.populate({
			path: 'electricId',
			model: 'electric',
			select: 'electric remark addTime',
			match: {status: 1}
		})
		.populate({
			path: 'calElectricId',
			model: 'electriccal',
			select: 'tnew addTime',
			match: {status: 1}
		})
		.populate({
			path: 'leaseId',
			model: 'lease',
			select: 'calElePrice',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//字段提供
				!i.fanghao && (i.fanghao = i.fang + i.hao)
				//上次电费ID初始化
				!i.calElectricId && (i.calElectricId = {})
				i.calElectricId.tnew && (i.calElectricId.tnew.addTime = i.calElectricId.addTime)
				i.calElectricId.tnew && (i.calElectricId = i.calElectricId.tnew)
				//抄电ID初始化
				!i.electricId && (i.electricId = {})
				//收费方式初始化
				!i.leaseId && (i.leaseId = {})
				i.leaseId.calElePrice && (i.leaseId = i.leaseId.calElePrice)
				//差距计算
				!i.gap && (i.gap = (i.electricId.electric ? i.electricId.electric : 0) - (i.calElectricId.electric ? i.calElectricId.electric : 0))
				i.gap <= 0 && (i.gap = 0)
				//小计计算
				//电表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
				let result = 0
				let theGap = (i.electricId.electric || 0) - (i.calElectricId.electric || 0)
				let restGap = theGap
				theGap = theGap > 0 ? theGap : 0
				theGap = theGap > i.leaseId.minPrice ? theGap : i.leaseId.minPrice
				if (i.leaseId.calType == 'single') {
					result = theGap * i.leaseId.singlePrice
				} else {
					i.leaseId.stepPrice && i.leaseId.stepPrice.forEach((item, i, arr)=>{
						//假阶梯
						if (theGap > (arr[i-1] ? arr[i-1].step : 0) && theGap <= item.step && item.price != 0) {
							result = theGap * item.price
						} else if (i == (arr.length - 1) && theGap >= item.step && item.price != 0) {
							result = theGap * item.price
						}
					})
					result = Math.round(result * 100) / 100
				}
				!i.result && (i.result = result)
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
	electricList: (req, res, callback)=>{
		//不校验字段
		//查询抄表记录，房屋数据
		//返回list对象
		//初始化该库
		db.dbModel('house')
		db
		//数据库查询
		.dbModel('electric')
		.find({haoId: db.db.Types.ObjectId(req.body.haoId)})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelElectric && (i.gettingdelElectric = false)
				//del提示字段提供
				!i.dElectricPopFlag && (i.dElectricPopFlag = false)
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
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
	electricCalList: (req, res, callback)=>{
		//不校验字段
		//查询计费记录，房屋数据
		//返回list对象
		//初始化该库
		db.dbModel('house')
		db
		//数据库查询
		.dbModel('electriccal')
		.find({haoId: db.db.Types.ObjectId(req.body.haoId)})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelCalElectric && (i.gettingdelCalElectric = false)
				//del提示字段提供
				!i.dCalElectricPopFlag && (i.dCalElectricPopFlag = false)
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
				//小计
				!i.gap && (i.gap = (i.tnew.electric ? i.tnew.electric : 0) - (i.old.electric ? i.old.electric : 0))
				i.gap <= 0 && (i.gap = 0)
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
	electriccalElectric: (req, res, callback)=>{
		//不做数据校验
		//插入数据（存储新抄表记录，旧抄表记录，计费信息），错误退出
		//更新房屋挂载ID，错误提出
		//返回add对象
		let addData
		db
		.dbModel('electriccal', {//*//标记，初始电表计费数数据类，新增类型
			userId: db.db.Schema.Types.ObjectId, //用户ID
			haoId: db.db.Schema.Types.ObjectId, //房屋ID，全拼
			tnew: {
				electric: Number, //抄表数
				remark: String, //抄表备注
				addTime: String //抄表时间
			},
			old: {
				electric: Number, //底表数
				remark: String, //底表备注
				addTime: String //底表时间
			},
			calElectric: {
				minPrice: Number, //本次计费低消
				calType: String, //计费类型
				singlePrice: Number, //single单价
				stepPrice: [{ //阶梯价格
					step: Number, //阶梯
					price: Number //单价
				}]
			},
			remark: String, //计费备注
			addTime: String, //计费时间
			fix: Boolean, //结果是否修正
			calElectricResult: Number, //计算结果
			status: Number, //状态
			createTime: Number //创建时间
		})
		.create({
			userId: req.userId,
			haoId: req.body.haoId,
			tnew: req.body.tnew,
			old: req.body.old,
			calElectric: req.body.calElectric,
			remark: req.body.remark,
			addTime: req.body.addTime,
			fix: req.body.fix,
			calElectricResult: req.body.calElectricResult,
			status: 1,
			createTime: Date.now()
		})
		.then((data)=>{
			if (data) {
				addData = data
				return Promise.resolve(data)
			} else {			
				return Promise.reject({
					type: false
				})
			}
		})
		//更新房屋最新电表计费数信息
		.then((data)=>{
			return db
			.dbModel('house', {//*//标记，更新房屋数据类，扩增最新计费数据引用类型
				calElectricId: db.db.Schema.Types.ObjectId,
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body.haoId}, {
				calElectricId: addData._id,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: addData
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
	},
	electricDel: (req, res, callback)=>{
		//校验数据，错误退出
		//修改状态，错误退出
		//查询上一条数据
		//更新房屋挂载ID，错误退出
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			let delData
			let moveData
			db
			//根据ID修改状态
			.dbModel('electric', {//*//标记，初始电表类型数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					delData = data
					return Promise.resolve(data)
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			//查询上一条电表数据
			.then((data)=>{
				return db
				.dbModel('electric')
				.findOne({})
				.where('userId').equals(db.db.Types.ObjectId(req.userId))
				.where('haoId').equals(db.db.Types.ObjectId(req.body.haoId))
				.where('status').equals(1)
				.sort('-addTime')
				.exec()
				.then((data)=>{
					if (data) {
						moveData = data
					} else {
						moveData = {_id: null}
					}
					return Promise.resolve(data)
				})
			})
			//更新房屋最新电表数信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新抄电表数引用类型
					electricId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					electricId: moveData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: delData
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
	electricCalDel: (req, res, callback)=>{
		//校验数据，错误退出
		//修改状态，错误退出
		//查询上一条数据
		//更新房屋挂载ID，错误退出
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			let delData
			let moveData
			db
			//根据ID修改状态
			.dbModel('electriccal', {//*//标记，初始电费计费数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					delData = data
					return Promise.resolve(data)
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			//查询上一条电表计费数据
			.then((data)=>{
				return db
				.dbModel('electriccal')
				.findOne({})
				.where('userId').equals(db.db.Types.ObjectId(req.userId))
				.where('haoId').equals(db.db.Types.ObjectId(req.body.haoId))
				.where('status').equals(1)
				.sort('-addTime')
				.exec()
				.then((data)=>{
					if (data) {
						moveData = data
					} else {
						moveData = {_id: null}
					}
					return Promise.resolve(data)
				})
			})
			//更新房屋最新电表计费信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新电表计费引用类型
					calElectricId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					calElectricId: moveData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: delData
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
	electricFindByDate: (req, res, callback)=>{
		let today = new Date().toLocaleDateString()
		let date = req.body.electricDate || today
		db.dbModel('house')
		db
		.dbModel('electric')
		.find({})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.$where(new Function('return new Date(this.addTime).getTime() >= ' + new Date(date).getTime() + ' && new Date(this.addTime).getTime() < ' + (new Date(date).getTime() + 86400000)))
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime -createTime')
		.lean()
		.exec()
		.then((data)=>{
			data.forEach((i)=>{
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
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

	/***inner类****租住管理********************************************************************************************************/

	/*
		租户对象挂载
		用户ID ok
		房屋ID ok
	*/

	leaseMainList: (req, res, callback)=>{
		//查询房屋数据，租户信息
		//返回list对象
		//初始化该库
		db.dbModel('lease')
		db
		//数据库查询
		.dbModel('house')
		.find({}, {
			fang: 1,
			hao: 1,
			leaseId: 1
		})
		.populate({
			path: 'leaseId',
			model: 'lease',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//字段提供
				!i.fanghao && (i.fanghao = i.fang + i.hao)
				!i.leaseId && (i.leaseId = {})			})
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
	leaseIn: (req, res, callback)=>{
		//不做数据校验
		//ID存在更新数据，错误退出
		//ID不存查询数据是否存在，存在->错误退出
		//插入数据，错误退出
		//更新房屋挂载ID，错误退出
		//返回add对象
		let leaseModel = {//*//标记，租住数据类型
			name: String, //租户姓名
			call: String, //租户电话
			leaserange: Array, //租住周期
			payDay: Number, //付租时间
			payType: Number, //付租方式
			remark: String, //备注

			calWaterPrice: {
				minPrice: Number, //本次计费低消
				calType: String, //计费类型
				singlePrice: Number, //single单价
				stepPrice: [{ //阶梯价格
					step: Number, //阶梯
					price: Number //单价
				}]
			},
			calElePrice: {
				minPrice: Number, //本次计费低消
				calType: String, //计费类型
				singlePrice: Number, //single单价
				stepPrice: [{ //阶梯价格
					step: Number, //阶梯
					price: Number //单价
				}]
			},

			rent: Number, //租金
			deposit: Number, //押金
			addTime: String //入住时间
		}
		if (req.body._id) {
			let editLeaseModel = leaseModel
			editLeaseModel.updateTime = Number
			let editLease = req.body
			editLease.updateTime = Date.now()
			db
			//根据ID修改内容
			.dbModel('lease', editLeaseModel)//*//标记，更新数据类型
			.findOneAndUpdate({_id: req.body._id}, {'$set': editLease})
			.exec()
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: data
					})
				} else {
					return Promise.reject({
						type: false,
						data: '修改失败，数据不存在'
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
			let addData
			db
			//数据库查询是否已存在
			.dbModel('lease')
			.find({
				userId: db.db.Types.ObjectId(req.userId),
				haoId: req.body.haoId,
				status: 1
			})
			.exec()
			.then((data)=>{
				if (data.length) {
					return Promise.reject({
						type: false,
						data: '房间已有人租住'
					})
				} else {
					return Promise.resolve()
				}
			})
			.then(()=>{
				let createLeaseModel = leaseModel
				createLeaseModel.createTime = Number
				createLeaseModel.haoId = db.db.Schema.Types.ObjectId
				createLeaseModel.userId = db.db.Schema.Types.ObjectId
				createLeaseModel.fanghao = String
				createLeaseModel.status = Number
				let createLease = req.body
				createLease.createTime = Date.now()
				createLease.userId = req.userId
				createLease.status = 1
				return db
				.dbModel('lease', createLeaseModel)//*//标记，新增数据类型
				.create(createLease)
				.then((data)=>{
					if (data) {
						addData = data
						return Promise.resolve(data)
					} else {			
						return Promise.reject({
							type: false
						})
					}
				})
			})
			//更新房屋最新租户信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新租户信息引用类型
					leaseId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					leaseId: addData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: addData
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
	leaseOut: (req, res, callback)=>{
		//校验字段，错误退出
		//修改状态（无需更新房屋挂载ID）
		//返回out对象
		if (!req.body.haoId || !req.body._id || !req.body.outTime) {
			callback({
				type: false,
				data: '缺少参数'
			})
		} else {
			let delData
			db
			//根据ID修改状态
			//由于不需要读取上一条信息，因此houseId上并没有清除租住者ID
			.dbModel('lease', {//*//标记，初始租住类型数据类，删除类型
				outTime: String, //搬出时间
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				outTime: req.body.outTime,
				status: 2,//搬出为2，正常为1
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					delData = data
					return Promise.reject({
						type: true,
						data: delData
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
	leaseList: (req, res, callback)=>{
		//查询房屋数据，租户信息（状态2）
		//返回list对象
		//初始化该库
		db.dbModel('house')
		db
		//数据库查询
		.dbModel('lease')
		.find({haoId: db.db.Types.ObjectId(req.body.haoId)})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(2)
		.sort('-addTime')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelLease && (i.gettingdelLease = false)
				//del提示字段提供
				!i.dLeasePopFlag && (i.dLeasePopFlag = false)
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
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
	leaseDel: (req, res, callback)=>{
		//校验字段，错误退出
		//修改状态（无需更新房屋挂载ID）
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			db
			//根据ID修改状态
			//由于不需要读取上一条信息，因此houseId上并没有清除租住者ID
			.dbModel('lease', {//*//标记，租住数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
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
	},

	/***inner类****收租管理********************************************************************************************************/

	/*
		收租周期表对象挂载
		用户ID ok
		收租对象挂载
		用户ID ok
		收租周期表ID ok
		房屋ID ok
	*/

	monthAdd (req, res, callback) {
		//校验字段
		if (!req.body.month) {
			callback({
				type: false,
				data: '请填写月份'
			})
		} else if (req.body._id) {
			db
			//根据ID修改内容
			.dbModel('month', {//*//标记，初始月度周期数据类，修改类型
				month: String, //月份
				remark: String, //备注
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {'$set': {
				month: req.body.month,
				remark: req.body.remark,
				updateTime: Date.now()
			}})
			.exec()
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: data
					})
				} else {
					return Promise.reject({
						type: false,
						data: '修改失败，数据不存在'
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
			//数据库查询是否已存在
			.dbModel('month')
			.find({
				userId: db.db.Types.ObjectId(req.userId),
				month: req.body.month,
				status: 1
			})
			.exec()
			.then((data)=>{
				if (data.length) {
					return Promise.reject({
						type: false,
						data: '月份周期已存在'
					})
				} else {
					return Promise.resolve()
				}
			})
			//插入数据
			.then(()=>{
				return db
				.dbModel('month', {//*//标记，初始月度周期数据类，创建类型
					userId: db.db.Schema.Types.ObjectId, //用户ID
					month: String, //月份
					remark: String, //备注
					status: Number, //状态
					createTime: Number //创建时间
				})
				.create({
					userId: req.userId,
					month: req.body.month,
					remark: req.body.remark,
					status: 1,
					createTime: Date.now()
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
			})
			.catch((err)=>{
				callback({
					type: err.type || false,
					data: err.data || err.message
				})
			})
		}
	},
	monthList: (req, res, callback)=>{
		//查询数据
		//返回list对象
		db
		//数据库查询
		.dbModel('month')
		.find({}, {
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
			//字段初始化
			data.forEach((i)=>{
				//loading字段提供
				!i.gettingdelMonth && (i.gettingdelMonth = false)
				//del提示字段提供
				!i.dMonthPopFlag && (i.dMonthPopFlag = false)
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
	monthFind: (req, res, callback)=>{
		//不校验字段
		//查询数据，错误退出
		//返回find对象
		db
		//数据库查询
		.dbModel('month')
		.findOne({_id: req.body._id})
		.where('status').equals(1)
		.lean()
		.exec()
		.then((data)=>{
			if (data) {
				return Promise.resolve(data)
			} else {
				return Promise.reject({
					code: 30541,
					type: false,
					data: '数据不存在'
				})
			}	
		})
		.then((data)=>{
			return db
			.dbModel('month')
			.findOne({})
			.where('userId').equals(db.db.Types.ObjectId(req.userId))
			.where('status').equals(1)
			.sort('-month')
			.exec()
			.then((one)=>{
				if (one._id.toString() == data._id.toString()) {
					data.newest = true
				} else {
					data.newest = false
				}
				return Promise.reject({
					type: true,
					data: data
				})
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				code: err.code || '',
				data: err.data || err.message
			})
		})
	},
	monthDel: (req, res, callback)=>{
		//校验字段，错误提出
		//修改状态
		//返回del对象
		if (!req.body._id) {
			callback({
				type: false
			})
		} else {
			db
			//根据ID修改状态
			.dbModel('month', {//*//标记，初始房屋数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
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
	},
	rentListByMonth (req, res, callback) {
		//通过房屋查询所有最新挂载信息：电费计费，水费计费，租约信息
		//初始化字段后
		//再根据monthId查询月度信息
		//根据房屋Id插入monthId信息
		//返回list对象
		db.dbModel('watercal')
		db.dbModel('electriccal')
		db.dbModel('lease')
		db
		//数据库查询
		.dbModel('house')
		.find({}, {
			fang: 1,
			hao: 1,
			calWaterId: 1,
			calElectricId: 1,
			leaseId: 1
		})
		.populate({
			path: 'calWaterId',
			model: 'watercal',
			match: {status: 1}
		})
		.populate({
			path: 'calElectricId',
			model: 'electriccal',
			match: {status: 1}
		})
		.populate({
			path: 'leaseId',
			model: 'lease',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('fang hao')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//字段提供
				!i.fanghao && (i.fanghao = i.fang + i.hao)
				//字段初始化
				!i.calWaterId && (i.calWaterId = {})
				!i.calElectricId && (i.calElectricId = {})
				!i.leaseId && (i.leaseId = {})
				//loading字段提供
				!i.gettingdelRent && (i.gettingdelRent = false)
				//del提示字段提供
				!i.dRentPopFlag && (i.dRentPopFlag = false)
			})
			return Promise.resolve(data)
		})
		.then((house)=>{
			return db
			.dbModel('rent')
			.find({monthId: db.db.Types.ObjectId(req.body.monthId)})
			.where('status').equals(1)
			.lean()
			.exec()
			.then((data)=>{
				house.forEach((i)=>{
					i.rents = []
					data.forEach((j)=>{
						if (j.haoId.toString() == i._id.toString()) {
							i.rents.push(j)
						}
					})
				})
				return Promise.reject({
					type: true,
					data: house
				})
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	rentAdd (req, res, callback) {
		//不做数据校验
		//插入数据（存储新水费记录，电费记录，租住信息），错误退出
		//更新房屋挂载ID，错误提出
		//返回add对象
		let addData
		db
		.dbModel('rent', {//*//标记，初始计租数据数数据类，新增类型
			userId: db.db.Schema.Types.ObjectId, //用户ID
			haoId: db.db.Schema.Types.ObjectId, //房屋ID，全拼
			monthId: db.db.Schema.Types.ObjectId, //月度周期ID，全拼
			calWater: Object, //水费计费
			calElectric: Object, //电费计费
			lease: Object, //租住信息
			fanghao: String, //房屋
			remark: String, //计费备注
			addTime: String, //计费时间
			fix: Boolean, //结果是否修正
			calRentResult: Number, //计算结果
			status: Number, //状态
			createTime: Number //创建时间
		})
		.create({
			userId: req.userId,
			haoId: req.body.haoId,
			monthId: req.body.monthId,
			calWater: req.body.calWater,
			calElectric: req.body.calElectric,
			lease: req.body.lease,
			fanghao: req.body.fanghao,
			remark: req.body.remark,
			addTime: req.body.addTime,
			fix: req.body.fix,
			calRentResult: req.body.calRentResult,
			status: 1,
			createTime: Date.now()
		})
		.then((data)=>{
			if (data) {
				addData = data
				return Promise.resolve(data)
			} else {			
				return Promise.reject({
					type: false
				})
			}
		})
		//更新房屋最新计租数信息
		.then((data)=>{
			return db
			.dbModel('house', {//*//标记，更新房屋数据类，扩增最新计租数据引用类型
				rentId: db.db.Schema.Types.ObjectId,
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body.haoId}, {
				rentId: addData._id,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					return Promise.reject({
						type: true,
						data: addData
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
	},
	rentType: (req, res, callback)=>{
		//校验字段，错误退出
		//修改字段状态
		//返回del对象
		if (!req.body.rentId) {
			callback({
				type: false
			})
		} else {
			db
			//根据ID修改状态
			.dbModel('rent', {//*//标记，计租数据类，状态修改类型
				type: {
					checkAll: Boolean,
					isIndeterminate: Boolean,
					type: Array,
					typeTime: {
						'1': String,
						'2': String,
						'3': String
					}
				},
				lease: {
					payType: Number
				},
				remark: String,

				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body.rentId}, {
				type: {
					checkAll: req.body.checkAll,
					isIndeterminate: req.body.isIndeterminate,
					type: req.body.type,
					typeTime: req.body.typeTime
				},
				'lease.payType': req.body.payType,
				remark: req.body.remark,
				updateTime: Date.now()
			})
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
	},
	rentDel: (req, res, callback)=>{
		//校验数据，错误退出
		//修改状态，错误退出
		//查询上一条数据
		//更新房屋挂载ID，错误退出
		//返回del对象
		if (!req.body._id || !req.body.haoId) {
			callback({
				type: false
			})
		} else {
			let delData
			let moveData
			db
			//根据ID修改状态
			.dbModel('rent', {//*//标记，初始电费计费数据类，删除类型
				status: Number, //状态
				updateTime: Number //更新时间
			})
			.findOneAndUpdate({_id: req.body._id}, {
				status: 0,
				updateTime: Date.now()
			})
			.exec()
			.then((data)=>{
				if (data) {
					delData = data
					return Promise.resolve(data)
				} else {
					return Promise.reject({
						type: false
					})
				}
			})
			//查询上一条电表计费数据
			.then((data)=>{
				return db
				.dbModel('rent')
				.findOne({})
				.where('userId').equals(db.db.Types.ObjectId(req.userId))
				.where('haoId').equals(db.db.Types.ObjectId(req.body.haoId))
				.where('status').equals(1)
				.sort('-addTime')
				.exec()
				.then((data)=>{
					if (data) {
						moveData = data
					} else {
						moveData = {_id: null}
					}
					return Promise.resolve(data)
				})
			})
			//更新房屋最新电表计费信息
			.then((data)=>{
				return db
				.dbModel('house', {//*//标记，更新房屋数据类，扩增最新电表计费引用类型
					rentId: db.db.Schema.Types.ObjectId,
					updateTime: Number //更新时间
				})
				.findOneAndUpdate({_id: req.body.haoId}, {
					rentId: moveData._id,
					updateTime: Date.now()
				})
				.exec()
				.then((data)=>{
					if (data) {
						return Promise.reject({
							type: true,
							data: delData
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
	rentListByLandord: (req, res, callback)=>{
		//查询数据
		//返回list对象
		db.dbModel('month')
		db
		.dbModel('rent')
		.find({
			'type.type': 3,
			monthId: db.db.Types.ObjectId(req.body.monthId)
		})
		.populate({
			path: 'monthId',
			model: 'month',
			select: 'month',
			match: {status: 1}
		})
		.where('status').equals(1)
		.sort('-type.typeTime.3')
		.lean()
		.exec()
		.then((data)=>{
			let list = {}
			data.forEach((i)=>{
				let _date = new Date(new Date(i.type.typeTime[3]).toLocaleDateString()).getTime()
				if (!list[_date]) {
					list[_date] = {
						list: [],
						0: 0,
						1: 0,
						2: 0,
						3: 0,
						4: 0,
						5: 0,
						all: 0
					}
				}
				list[_date][i.lease.payType] += i.calRentResult
				list[_date].all += i.calRentResult
				list[_date].list.push(i)
			})

			return Promise.reject({
				type: true,
				data: list
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	rentListByLandordTemp: (req, res, callback)=>{
		//查询数据
		//返回list对象
		db.dbModel('month')
		db
		.dbModel('rent')
		.find({
			'type.type': {
				'$in': [1],
				'$ne': 3
			},
			monthId: db.db.Types.ObjectId(req.body.monthId)
		})
		.populate({
			path: 'monthId',
			model: 'month',
			select: 'month',
			match: {status: 1}
		})
		.where('status').equals(1)
		.sort('-type.typeTime.3')
		.lean()
		.exec()
		.then((data)=>{
			let list = {
				list: [],
				0: 0,
				1: 0,
				2: 0,
				3: 0,
				4: 0,
				5: 0,
				all: 0
			}
			data.forEach((i)=>{
				list[i.lease.payType] += i.calRentResult
				list.all += i.calRentResult
				list.list.push(i)
			})

			return Promise.reject({
				type: true,
				data: list
			})
		})
		.catch((err)=>{
			callback({
				type: err.type || false,
				data: err.data || err.message
			})
		})
	},
	rentListByHao: (req, res, callback)=>{
		//查询数据
		//返回list对象
		db.dbModel('house')
		db.dbModel('month')
		db
		.dbModel('rent')
		.find({haoId: db.db.Types.ObjectId(req.body.haoId)})
		.populate({
			path: 'haoId',
			model: 'house',
			select: 'fang hao haoId addTime',
			match: {status: 1}
		})
		.populate({
			path: 'monthId',
			model: 'month',
			select: 'month',
			match: {status: 1}
		})
		.where('userId').equals(db.db.Types.ObjectId(req.userId))
		.where('status').equals(1)
		.sort('-addTime')
		.lean()
		.exec()
		.then((data)=>{
			//字段初始化
			data.forEach((i)=>{
				//房屋
				i.haoId && !i.fanghao && (i.fanghao = i.haoId.fang + i.haoId.hao)
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

	//收租对象 ，存储整个水表计费信息，电表计费信息，租户信息
	//
	//
	//收租周期表add OK
	//根据收租周期表list，进列表 OK
	//根据房屋，带挂载收租信息list，进历史 OK
	//
	//
	//收租add，更新房屋挂载ID OK
	//收租type多选：交租、给单据、给房东 OK
	//收租del，需要回退房屋挂载ID OK
	//根据收租周期表收租列表list，可添加，可修改收租状态，最新一期可删除收租 OK
	//根据房屋收租历史list OK

	/***inner类****其他********************************************************************************************************/

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