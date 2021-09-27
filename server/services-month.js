const FoundError = require('./config-error')
const db = require('./models')

module.exports = {

  monthAdd: async req => {
    // 此接口名称唯一
    // 校验字段
    // 1根据ID修改内容
    // 2查询月份是否已经存在
    // 3插入数据
    // 4返回id

    if (!req.body.month) {
      return Promise.reject(new FoundError('请选择月份'))
    }

    // 1根据ID修改内容
    if (req.body._id) {
      const editMonth = await db
        .dbModel('month', {//* //标记，初始月度周期数据类，修改类型
          remark: String, // 备注
          updateTime: Number, // 更新时间
        })
        .findOneAndUpdate({ _id: req.body._id }, {
          $set: {
            remark: req.body.remark,
            updateTime: Date.now(),
          },
        })
        .exec()

      if (!editMonth) {
        return Promise.reject(new FoundError('修改失败，数据不存在'))
      }

      return { _id: req.body._id }
    }

    // 2查询月份是否已经存在
    const findMonth = await db
      .dbModel('month')
      .find({
        userId: db.db.Types.ObjectId(req.userId),
        month: req.body.month,
        status: 1,
      })
      .exec()

    if (findMonth.length) {
      return Promise.reject(new FoundError('月份周期已存在'))
    }

    // 3插入数据
    const createMonth = await db
      .dbModel('month', {//* //标记，初始月度周期数据类，创建类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        month: { // 月份
          type: String,
          unique: true,
        },
        remark: String, // 备注
        status: Number, // 状态
        defaultCalWaterPrice: Object, // 本月度默认水费计费方式
        defaultCalElePrice: Object, // 本月度默认电费计费方式
        defaultCalGasPrice: Object, // 本月度默认燃气费计费方式
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        month: req.body.month,
        remark: req.body.remark,
        defaultCalWaterPrice: req.body.defaultCalWaterPrice,
        defaultCalElePrice: req.body.defaultCalElePrice,
        defaultCalGasPrice: req.body.defaultCalGasPrice,
        status: 1,
        createTime: Date.now(),
      })

    if (!createMonth) {
      return Promise.reject(new FoundError('新增失败'))
    }

    // 4返回id
    return { _id: createMonth._id }
  },

  monthList: async req => {
    // 1查询数据
    // 2返回list对象

    // 1数据库查询
    const dbInfo = await db
      .dbModel('month')
      .find({}, {
        month: 1,
        remark: 1,
        defaultCalWaterPrice: 1,
        defaultCalElePrice: 1,
        defaultCalGasPrice: 1,
        createTime: 1,
        updateTime: 1,
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-month')
      .lean()
      .exec()

    dbInfo.forEach(month => {
      // loading字段提供
      if (!month.gettingdelMonth) month.gettingdelMonth = false
      // del提示字段提供
      if (!month.dMonthPopFlag) month.dMonthPopFlag = false
    })

    // 2返回list对象
    return dbInfo
  },

  async monthFind(req) {
    // 1查询数据，错误退出
    // 2返回find对象

    if (!req.body._id) {
      return Promise.reject(new FoundError('缺少ID'))
    }

    // 1数据库查询
    const findMonth = await db
      .dbModel('month')
      .findOne({ _id: req.body._id })
      .where('status')
      .equals(1)
      .lean()
      .exec()

    if (!findMonth) {
      return Promise.reject(new FoundError('月度数据不存在'))
    }

    const newest = await this
      .newest(req)

    if (findMonth._id.toString() === newest._id.toString()) {
      findMonth.newest = true
    } else {
      findMonth.newest = false
    }

    return findMonth
  },

  monthDel: async req => {
    // 0校验字段，错误提出
    // 1修改状态
    // 2返回del对象
    if (!req.body._id) {
      return Promise.reject(new FoundError('缺少ID'))
    }

    // 1根据ID修改状态
    const delInfo = await db
      .dbModel('month', {//* //标记，初始房屋数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!delInfo || !delInfo.status) {
      return Promise.reject(new FoundError('月份删除失败'))
    }

    // 2返回id
    return { _id: req.body._id }
  },

  newest: async req => {
    // 1查询最新月度信息
    // 2返回det对象

    // 1查询最新月度信息
    const dbInfo = await db
      .dbModel('month')
      .findOne({}, {
        month: 1,
        remark: 1,
        createTime: 1,
        updateTime: 1,
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-month')
      .lean()
      .exec()

    // 2返回det对象
    return dbInfo || {}
  },

}
