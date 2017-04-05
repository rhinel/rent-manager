'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {
    newest (req, res, callback) {
        //查询最新月度信息
        //返回det对象
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
}