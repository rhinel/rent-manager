const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

module.exports = {

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
