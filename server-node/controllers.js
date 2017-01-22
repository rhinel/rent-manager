'use strict'

let service = require('./services')
let code = require('./codes')

//res.json([req.params,req.query,req.body])
//res.json([req.params==url,req.query==get,req.body==post])

//outer类，失败则跳过
const outer = (req, res, next)=>{
	if (req.params.class==='log') {
		//登录接口
		if (req.params.function==='login') {
			service.login(req, res, (data)=>{
				res.json(code(1001, data))
			})
		} else if (req.params.function==='bingBg') {
			service.bingBg(req, res, (data)=>{
				res.json(code(1002, data))
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
	let _secret = req.body.secret || req.query.secret || ''
	if (!_secret) {
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
	if (req.params.class === 'getData') {
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