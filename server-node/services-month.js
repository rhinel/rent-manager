const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

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
          month: String, // 月份
          remark: String, // 备注
          updateTime: Number, // 更新时间
        })
        .findOneAndUpdate({ _id: req.body._id }, {
          $set: {
            month: req.body.month,
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

    if (findMonth) {
      return Promise.reject(new FoundError('月份周期已存在'))
    }

    // 3插入数据
    const createMonth = await db
      .dbModel('month', {//* //标记，初始月度周期数据类，创建类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        month: String, // 月份
        remark: String, // 备注
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        month: req.body.month,
        remark: req.body.remark,
        status: 1,
        createTime: Date.now(),
      })

    if (!createMonth) {
      return Promise.reject(new FoundError('新增失败'))
    }

    // 4返回id
    return { _id: createMonth._id }
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
