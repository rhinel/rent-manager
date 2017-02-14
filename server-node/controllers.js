'use strict'

let service = require('./services')
let code = require('./codes')

//res.json([req.params,req.query,req.body])
//res.json([req.params==url,req.query==get,req.body==post])
//data是一个设计的返回对象，包含编码和内容，使用codes进行封装

//outer类，失败则跳过
const outer = (req, res, next)=>{
	//登陆类
	if (req.params.class === 'log') {
		//登录接口
		if (req.params.function === 'login') {
			service.login(req, res, (data)=>{
				res.json(code(1001, data))
			})
		//首页背景图
		} else if (req.params.function === 'logout') {
			service.logout(req, res, (data)=>{
				res.json(code(1002, data))
			})
		} else if (req.params.function === 'bingBg') {
			service.bingBg(req, res, (data)=>{
				res.json(code(1003, data))
			})
		} else {
			next()
		}
	} else {
		next()
	}
}

//auth类，成功则跳过
const auth = (req, res, next)=>{
	//接口校验
	let _token = req.body.token || req.query.token || ''
	if (!_token) {
		res.json(code(2001))
	} else {
		service.auth(req, res, (data)=>{
			if (!data.type) {
				res.json(code(2001, data))
			} else {
				next()
			}
		})
	}
}

//inner类，失败则跳过
const inner = (req, res, next)=>{
	if (req.params.class == 'auth') {
		res.json(code(0, {type:true}))
	} else if (req.params.class === 'house') {
		//添加房屋接口
		if (req.params.function === 'add') {
			service.houseAdd(req, res, (data)=>{
				res.json(code(3011, data))
			})
		} else if (req.params.function === 'list') {
			service.houseList(req, res, (data)=>{
				res.json(code(3012, data))
			})
		} else if (req.params.function === 'del') {
			service.houseDel(req, res, (data)=>{
				res.json(code(3013, data))
			})
		} else if (req.params.function === 'find') {
			service.houseFind(req, res, (data)=>{
				res.json(code(3014, data))
			})
		} else {
			next()
		}
	} else if (req.params.class === 'water') {
		//添加水表数接口
		if (req.params.function === 'add') {
			service.waterAdd(req, res, (data)=>{
				res.json(code(3021, data))
			})
		} else if (req.params.function === 'mainList') {
			service.waterMainList(req, res, (data)=>{
				res.json(code(3022, data))
			})
		} else if (req.params.function === 'cal') {
			service.watercalWater(req, res, (data)=>{
				res.json(code(3023, data))
			})
		} else if (req.params.function === 'list') {
			service.waterList(req, res, (data)=>{
				res.json(code(3024, data))
			})
		} else if (req.params.function === 'calList') {
			service.waterCalList(req, res, (data)=>{
				res.json(code(3025, data))
			})
		} else if (req.params.function === 'del') {
			service.waterDel(req, res, (data)=>{
				res.json(code(3026, data))
			})
		} else if (req.params.function === 'delCal') {
			service.waterCalDel(req, res, (data)=>{
				res.json(code(3027, data))
			})
		} else {
			next()
		}
	} else if (req.params.class === 'lease') {
		//租住管理接口
		if (req.params.function === 'mainList') {
			service.leaseMainList(req, res, (data)=>{
				res.json(code(3031, data))
			})
		} else if (req.params.function === 'in') {
			service.leaseIn(req, res, (data)=>{
				res.json(code(3032, data))
			})
		} else {
			next()
		}











	} else if (req.params.class === 'getData') {
		service.getData(req, res, (data)=>{
			res.json(code(3001, data))
		})
	} else if (req.params.class === 'saveData') {
		service.saveData(req, res, (data)=>{
			res.json(code(3002, data))
		})
	} else if (req.params.class === 'removeData') {
		service.removeData(req, res, (data)=>{
			res.json(code(3003, data))
		})
	} else if (req.params.class === 'redisSet') {
		service.redisSet(req, res, (data)=>{
			res.json(code(3004, data))
		})
	} else if (req.params.class === 'redisGet') {
		service.redisGet(req, res, (data)=>{
			res.json(code(3005, data))
		})
	} else {
		next()
	}
}

//default类，最后返回
const def = (req, res, next)=>{
	res.json(code(9999))
}

module.exports = {
	outer:outer,
	auth:auth,
	inner:inner,
	def:def
}