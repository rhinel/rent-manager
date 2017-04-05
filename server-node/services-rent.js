'use strict'

let db = require('./models')
let superagent = require('superagent')
let md5 = require('md5')

module.exports = {
    listByNewestMonth (req, res, callback) {
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
    detByHao (req, res, callback) {
        // 通过ID查询所有的house的连带信息
        // 返回det对象
        db.dbModel('lease')
        db.dbModel('water')
        db.dbModel('watercal')
        db.dbModel('electric')
        db.dbModel('electriccal')
        db.dbModel('rent')
        db
        //数据库查询
        .dbModel('house')
        .findOne({_id: req.body.haoId})
        // 租住信息
        .populate({
            path: 'leaseId',
            model: 'lease',
            match: {status: 1}
        })
        // 抄水表信息
        .populate({
            path: 'waterId',
            model: 'water',
            match: {status: 1}
        })
        // 水表计费信息
        .populate({
            path: 'calWaterId',
            model: 'watercal',
            match: {status: 1}
        })
        // 抄电表信息
        .populate({
            path: 'electricId',
            model: 'electric',
            match: {status: 1}
        })
        // 电表计费信息
        .populate({
            path: 'calElectricId',
            model: 'electriccal',
            match: {status: 1}
        })
        // 最新计费信息
        .populate({
            path: 'rentId',
            model: 'rent',
            match: {status: 1}
        })
        .where('userId').equals(db.db.Types.ObjectId(req.userId))
        .where('status').equals(1)
        .lean()
        .exec()
        .then((data)=>{
            //字段提供
            !data.fanghao && (data.fanghao = data.fang + data.hao)
            //字段初始化
            !data.waterId && (data.waterId = {})
            !data.electricId && (data.electricId = {})
            !data.calWaterId && (data.calWaterId = {})
            !data.calElectricId && (data.calElectricId = {})
            !data.leaseId && (data.leaseId = {})
            !data.rentId && (data.rentId = {})
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