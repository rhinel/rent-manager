const log4js = require('log4js')
const mongoose = require('mongoose')
const redis = require('redis')

const auth = require('./auth')

let rds
let db
const sysLog = log4js.getLogger('sys')

// 链接缓存
const redisct = callback => {
  rds = redis.createClient(auth.redisPo, auth.redisIp, {
    auth_pass: auth.redisPa,
    retry_strategy: () => 5000,
  })
  rds.on('connect', sysLog.info.bind(sysLog, 'redis connecting...'))
  rds.on('ready', () => {
    if (callback) callback()
    sysLog.info(`redis://${auth.redisPa}@${auth.redisIp}:${auth.redisPo} redis ready !`)
  })
  rds.on('error', sysLog.error.bind(sysLog, 'redis connection error: '))
  rds.on('reconnecting', sysLog.info.bind(sysLog, 'redis reconnecting...'))
}

// set
const redisSet = (key, val, expire) => new Promise((resolve, reject) => {
  rds.set(key, val, (err, reply) => {
    if (err) {
      reject(err)
    } else if (expire) {
      rds.expire(key, expire)
    }
    resolve(reply)
  })
})

// set time
const redisSetTime = (key, expire) => new Promise((resolve, reject) => {
  rds.expire(key, expire, (err, reply) => {
    if (err) {
      reject(err)
    } else {
      resolve(reply)
    }
  })
})

// get
const redisGet = key => new Promise((resolve, reject) => {
  rds.get(key, (err, reply) => {
    if (err) {
      reject(err)
    } else {
      resolve(reply)
    }
  })
})

// get keys
const redisGetKeys = keys => new Promise((resolve, reject) => {
  rds.keys(keys, (err, reply) => {
    if (err) {
      reject(err)
    } else {
      resolve(reply)
    }
  })
})

// del keys
const redisDelKeys = keys => new Promise((resolve, reject) => {
  rds.del(keys, (err, reply) => {
    if (err) {
      reject(err)
    } else {
      resolve(reply)
    }
  })
})

// incr keys
const redisIncr = key => new Promise((resolve, reject) => {
  rds.incr(key, (err, reply) => {
    if (err) {
      reject(err)
    } else {
      resolve(reply)
    }
  })
})

// 链接数据库
const connect = callback => {
  mongoose.Promise = global.Promise
  mongoose
    .connect(auth.mongodbPs, {
      useMongoClient: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 5000,
      autoReconnect: true,
    })
    .catch(err => sysLog.error(err))
  db = mongoose.connection
  db.once('open', () => {
    if (callback) callback()
    sysLog.info(`${auth.mongodbPs} mongoose opened !`)
  })
  db.on('error', sysLog.error.bind(sysLog, 'mongoose connection error: '))
  db.on('reconnect', sysLog.info.bind(sysLog, 'mongoose reconnecting...'))
}

// model
const dbModel = (dbName, dataType = {}) => {
  if (!dbName || typeof dbName !== 'string') {
    return Promise.reject(new Error('without dbName'))
  }
  // 数据库模型骨架
  const dataSchema = new mongoose.Schema(dataType)

  // 数据集合创建
  const dataModel = db.model(dbName, dataSchema, dbName)

  // model查询
  return dataModel
}

// Entity
const dbEntity = (dbName, dataType = {}, data = {}) => {
  if (!dbName || typeof dbName !== 'string') {
    return Promise.reject(new Error('without dbName'))
  }
  // 数据库模型骨架
  const dataSchema = new mongoose.Schema(dataType)

  // 数据集合创建
  const DataModel = db.model(dbName, dataSchema, dbName)

  // 数据实例
  const dataEntity = new DataModel(data)

  // model查询
  return dataEntity
}

module.exports = {
  redisct,
  redisSet,
  redisSetTime,
  redisGet,
  redisGetKeys,
  redisDelKeys,
  redisIncr,
  connect,
  dbModel,
  dbEntity,
  db: mongoose,
}
