'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {

    one: (req, res, callback)=>{
        //通过ID查询
        //返回det对象
        if (!req.body.rentId) {
            callback({
                type: false
            })
            return false
        }
        db.dbModel('house')
        db.dbModel('month')
        db
        .dbModel('rent')
        .findOne({
            _id: db.db.Types.ObjectId(req.body.rentId)
        })
        .populate({
            path: 'haoId',
            model: 'house',
            select: 'fang hao haoId addTime detail',
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
        .lean()
        .exec()
        .then((data)=>{
            //字段初始化
            data && data.haoId && !data.fanghao && (data.fanghao = data.haoId.fang + data.haoId.hao)
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

    listByNewestMonth: (req, res, callback)=>{
        //通过房屋查询所有最新挂载信息：租约信息
        //初始化字段后
        //再根据monthId查询月度信息
        //根据房屋Id插入monthId信息
        //返回list对象
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
                !i.leaseId && (i.leaseId = {})
            })
            return Promise.resolve(data)
        })
        .then((house)=>{
            return db
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
            .then((month)=>{
                return Promise.resolve({
                    house: house,
                    month: month
                })
            })
        })
        .then((houseandmonth)=>{
            return db
            .dbModel('rent')
            .find({monthId: db.db.Types.ObjectId(houseandmonth.month._id)})
            .where('status').equals(1)
            .lean()
            .exec()
            .then((data)=>{
                houseandmonth.house.forEach((i)=>{
                    i.rents = []
                    data.forEach((j)=>{
                        if (j.haoId.toString() == i._id.toString()) {
                            i.rents.push(j)
                        }
                    })
                })
                return Promise.reject({
                    type: true,
                    data: houseandmonth.house
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

    listByHaoAndMonth: (req, res, callback)=>{
        //查询数据
        //返回list对象
        db.dbModel('house')
        db.dbModel('month')
        db
        .dbModel('rent')
        .find({
            haoId: db.db.Types.ObjectId(req.body.haoId),
            monthId: db.db.Types.ObjectId(req.body.monthId)
        })
        .populate({
            path: 'haoId',
            model: 'house',
            select: 'fang hao haoId addTime detail',
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
    }

}