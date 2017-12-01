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
        remark: req.body.remark || '',
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

  waterMainList: async req => {
    // 1查询房屋数据，抄表记录，计费记录，租户信息
    // 2水费小计计费
    // 3返回list对象

    // 初始化该库
    db.dbModel('water')
    db.dbModel('watercal')
    db.dbModel('lease')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        waterId: 1,
        calWaterId: 1,
        leaseId: 1,
      })
      .populate({
        path: 'waterId',
        model: 'water',
        select: 'water remark addTime',
        match: { status: 1 },
      })
      .populate({
        path: 'calWaterId',
        model: 'watercal',
        select: 'tnew addTime',
        match: { status: 1 },
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        select: 'calWaterPrice',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('fang hao')
      .lean()
      .exec()

    // 2数据计算
    dbInfo.forEach((item) => {
      // 字段提供
      if (!item.fanghao) {
        item.fanghao = item.fang + item.hao
      }
      // 上次水费ID初始化
      if (!item.calWaterId) item.calWaterId = {}
      if (item.calWaterId.tnew) {
        item.calWaterId.tnew.addTime = item.calWaterId.addTime
        item.calWaterId = item.calWaterId.tnew
      }
      // 抄水ID初始化
      if (!item.waterId) item.waterId = {}
      // 收费方式初始化
      if (!item.leaseId) item.leaseId = {}
      if (item.leaseId.calWaterPrice) {
        item.leaseId = item.leaseId.calWaterPrice
      }
      // 差距计算
      if (!item.gap) {
        item.gap = (item.waterId.water || 0) - (item.calWaterId.water || 0)
      }
      if (item.gap <= 0) {
        item.gap = 0
      }

      // 小计计算
      // 水表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
      let calResult = 0
      let calGap = item.gap
      calGap = Math.max(calGap, item.leaseId.minPrice || 0)

      if (item.leaseId.calType === 'single') {
        calResult = calGap * (item.leaseId.singlePrice || 0)
      } else if (item.leaseId.calType === 'step' && item.leaseId.stepPrice) {
        item.leaseId.stepPrice.forEach((stepPrice, i, stepPrices) => {
          // 假阶梯，取范围内的计算，大于按照最大的
          if (!stepPrice.price) return
          const prevPrices = stepPrices[i - 1] || {}
          if (
            (calGap > (prevPrices.step || 0) && calGap <= stepPrice.step) ||
            (i === (stepPrices.length - 1) && calGap >= stepPrice.step)
          ) {
            calResult = calGap * stepPrice.price
          }
        })
      }
      calResult = Math.round(calResult * 100) / 100
      if (!item.result) {
        item.result = calResult
      }
    })

    // 3返回数据
    return dbInfo
  },
}
