'use strict'

let service = require('./services')
let serviceDashb = require('./services-dashboard')
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
	} else if (req.params.class === 'electric') {
		//添加电表数接口
		if (req.params.function === 'add') {
			service.electricAdd(req, res, (data)=>{
				res.json(code(3041, data))
			})
		} else if (req.params.function === 'mainList') {
			service.electricMainList(req, res, (data)=>{
				res.json(code(3042, data))
			})
		} else if (req.params.function === 'cal') {
			service.electriccalElectric(req, res, (data)=>{
				res.json(code(3043, data))
			})
		} else if (req.params.function === 'list') {
			service.electricList(req, res, (data)=>{
				res.json(code(3044, data))
			})
		} else if (req.params.function === 'calList') {
			service.electricCalList(req, res, (data)=>{
				res.json(code(3045, data))
			})
		} else if (req.params.function === 'del') {
			service.electricDel(req, res, (data)=>{
				res.json(code(3046, data))
			})
		} else if (req.params.function === 'delCal') {
			service.electricCalDel(req, res, (data)=>{
				res.json(code(3047, data))
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
		} else if (req.params.function === 'out') {
			service.leaseOut(req, res, (data)=>{
				res.json(code(3033, data))
			})
		} else if (req.params.function === 'list') {
			service.leaseList(req, res, (data)=>{
				res.json(code(3034, data))
			})
		} else if (req.params.function === 'del') {
			service.leaseDel(req, res, (data)=>{
				res.json(code(3035, data))
			})
		} else {
			next()
		}
	} else if (req.params.class === 'month') {
		//月度周期管理
		if (req.params.function === 'add') {
			service.monthAdd(req, res, (data)=>{
				res.json(code(3051, data))
			})
		} else if (req.params.function === 'list') {
			service.monthList(req, res, (data)=>{
				res.json(code(3052, data))
			})
		} else if (req.params.function === 'del') {
			service.monthDel(req, res, (data)=>{
				res.json(code(3053, data))
			})
		} else if (req.params.function === 'find') {
			service.monthFind(req, res, (data)=>{
				res.json(code(3054, data))
			})
		} else {
			next()
		}
	} else if (req.params.class === 'rent') {
		//计租管理
		if (req.params.function === 'add') {
			service.rentAdd(req, res, (data)=>{
				res.json(code(3062, data))
			})
		} else if (req.params.function === 'listByMonth') {
			service.rentListByMonth(req, res, (data)=>{
				res.json(code(3061, data))
			})
		} else if (req.params.function === 'type') {
			service.rentType(req, res, (data)=>{
				res.json(code(3063, data))
			})
		} else if (req.params.function === 'del') {
			service.rentDel(req, res, (data)=>{
				res.json(code(3064, data))
			})
		} else if (req.params.function === 'listByHao') {
			service.rentListByHao(req, res, (data)=>{
				res.json(code(3065, data))
			})
		} else {
			next()
		}
	} else if (req.params.class === 'dash') {
		//主控面板
		if (req.params.function === 'count') {
			serviceDashb.count(req, res, (data)=>{
				res.json(code(3071, data))
			})
		} else if (req.params.function === 'addNote') {
			serviceDashb.addNote(req, res, (data)=>{
				res.json(code(3072, data))
			})
		} else if (req.params.function === 'notes') {
			serviceDashb.notes(req, res, (data)=>{
				res.json(code(3073, data))
			})
		} else if (req.params.function === 'waitingList') {
			serviceDashb.waitingList(req, res, (data)=>{
				res.json(code(3074, data))
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