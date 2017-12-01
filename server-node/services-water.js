const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

module.exports = {

  waterAdd: async req => {
    // 校验数据，错误退出
    // 1插入数据，错误退出
    // 2更新房屋挂载ID，错误退出
    // 3返回add对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('请选择房屋'))
    } else if (!req.body.water) {
      return Promise.reject(new FoundError('请填写水表数'))
    } else if (!req.body.addTime) {
      return Promise.reject(new FoundError('请填写抄表时间'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind({
        body: { _id: req.body.haoId },
      })

    // 1插入水表抄表记录
    const addData = await db
      .dbModel('water', {//* //标记，初始水表数数据类，新增类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        haoId: db.db.Schema.Types.ObjectId, // 房屋ID
        water: Number, // 水表数，全拼
        remark: String, // 备注，全拼
        addTime: String, // 抄表时间
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        haoId: req.body.haoId,
        water: req.body.water,
        remark: req.body.remark,
        addTime: req.body.addTime,
        status: 1,
        createTime: Date.now(),
      })

    if (!addData) {
      return Promise.reject(new FoundError('抄表失败'))
    }

    // 2更新房屋最新水表数信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新抄表数引用类型
        waterId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        waterId: addData._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在'))
    }

    // 3返回数据
    return { _id: addData._id }
  },
}
