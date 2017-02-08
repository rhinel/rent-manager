'use strict'

let mongoose = require('mongoose')
let redis = require('redis')
let auth = require('./auth')
let db
let rds

//链接缓存
const redisct = (callback)=>{
	rds = redis.createClient(auth.redisPo, auth.redisIp, {auth_pass: auth.redisPa})
	rds.on('error', console.error.bind(console, 'redis connection error:'))
	rds.on('ready',()=>{
		callback && callback()
		console.log('redis ready!')
	})
}

//set
const redisSet = (key, val, expire)=>{
	return new Promise((resolve, reject)=>{
		rds.set(key, val, (err, reply)=>{
			err && reject(err)
			!err && expire && rds.expire(key, expire)
			!err && resolve(reply)
		})
	})
}
//set time
const redisSetTime = (key, expire)=>{
	return new Promise((resolve, reject)=>{
		rds.expire(key, expire, (err, reply)=>{
			err && reject(err)
			!err && resolve(reply)
		})
	})
}

//get
const redisGet = (key)=>{
	return new Promise((resolve, reject)=>{
		rds.get(key, (err, reply)=>{
			err && reject(err)
			!err && resolve(reply)
		})
	})
}

//get keys
const redisGetKeys = (keys)=>{
	return new Promise((resolve, reject)=>{
		rds.keys(keys, (err, reply)=>{
			err && reject(err)
			!err && resolve(reply)
		})
	})
}

//del keys
const redisDelKeys = (keys)=>{
	return new Promise((resolve, reject)=>{
		rds.del(keys, (err, reply)=>{
			err && reject(err)
			!err && resolve(reply)
		})
	})
}

//链接数据库
const connect = (callback)=>{
	mongoose.Promise = global.Promise
	mongoose.connect(auth.mongodbPs, {auto_reconnect: true})
	db = mongoose.connection
	db.on('error', console.error.bind(console, 'mongoose connection error:'))
	db.once('open', ()=>{
		callback && callback()
		console.log('mongoose opened!')
	})
}

//model
const dbModel = (dbName, dataType)=>{
	if (!dbName || typeof dbName !== 'string') {
		return 'without dbName'
	}
	if (typeof dataType === 'undefined') {
		dataType = {}
	}
	//数据库模型骨架
	let dataSchema = new mongoose.Schema(dataType)

	//数据集合创建
	let dataModel = db.model(dbName, dataSchema, dbName)

	//model查询
	return dataModel
}

//Entity
const dbEntity = (dbName, dataType, data)=>{
	if (!dbName || typeof dbName !== 'string') {
		return 'without dbName'
	}
	if (typeof dataType === 'undefined') {
		dataType = {}
	}
	if (typeof data === 'undefined') {
		data = {}
	}
	//数据库模型骨架
	let dataSchema = new mongoose.Schema(dataType)

	//数据集合创建
	let dataModel = db.model(dbName, dataSchema, dbName)

	//数据实例
	let dataEntity = new dataModel(data)

	//model查询
	return dataEntity
}

module.exports = {
	redisct: redisct,
	redisSet: redisSet,
	redisSetTime: redisSetTime,
	redisGet: redisGet,
	redisGetKeys: redisGetKeys,
	redisDelKeys: redisDelKeys,
	connect: connect,
	dbModel: dbModel,
	dbEntity: dbEntity,
	db: mongoose
}