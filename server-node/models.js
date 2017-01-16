'use strict'

let mongoose = require('mongoose')
let redis = require('redis')
let auth = require('./auth')
let db
let client

//链接缓存
const redisct = (callback)=>{
	client = redis.createClient(auth.redisPo, auth.redisIp, {auth_pass: auth.redisPa})
	client.on('ready',(err)=>{
		callback && callback()
		console.log('redis ready!')
	})
}

//get
const redisSet = (key, val, expire, callback)=>{
	client.set(key, val, (err, reply)=>{
		expire && client.expire(key, expire)
		callback && callback(err, reply)
	})

}

//set
const redisGet = (key, callback)=>{
	client.get(key, (err, reply)=>{
		callback && callback(err, reply)
	})
}

//链接数据库
const connect = (callback)=>{
	mongoose.connect(auth.mongodbPs, {auto_reconnect: true})
	db = mongoose.connection
	db.on('error', console.error.bind(console, 'connection error:'))
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
	redisGet: redisGet,
	connect: connect,
	dbModel: dbModel,
	dbEntity: dbEntity
}