const FoundError = require('./config-error')
const db = require('./models')

module.exports = {

  rentListByMonth: async req => {
    // 通过房屋查询所有最新挂载信息：电费计费，水费计费，租约信息
    // 0初始化字段后
    // 1再根据monthId查询月度信息
    // 1根据房屋Id插入monthId信息
    // 2返回list对象

    if (!req.body.monthId) {
      return Promise.reject(new FoundError('缺少monthId'))
    }

    // 初始化该库
    db.dbModel('watercal')
    db.dbModel('electriccal')
    db.dbModel('lease')

    // 1数据库查询
    const houseInfo = () => db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        calWaterId: 1,
        calElectricId: 1,
        leaseId: 1,
      })
      .populate({
        path: 'calWaterId',
        model: 'watercal',
        match: { status: 1 },
      })
      .populate({
        path: 'calElectricId',
        model: 'electriccal',
        match: { status: 1 },
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('fang hao')
      .lean()
      .exec()

    const rentInfo = () => db
      .dbModel('rent')
      .find({ monthId: db.db.Types.ObjectId(req.body.monthId) })
      .where('status')
      .equals(1)
      .sort('-addTime')
      .lean()
      .exec()

    const dbInfo = await Promise.all([houseInfo, rentInfo])

    dbInfo.houseInfo.forEach(house => {
      // 字段提供
      if (!house.fanghao) {
        house.fanghao = house.fang + house.hao
      }
      // 字段初始化
      if (!house.calWaterId) house.calWaterId = {}
      if (!house.calElectricId) house.calElectricId = {}
      if (!house.leaseId) house.leaseId = {}
      // loading字段提供
      if (!house.gettingdelRent) house.gettingdelRent = false
      // del提示字段提供
      if (!house.dRentPopFlag) house.dRentPopFlag = false

      // 处理租住信息
      house.rents = dbInfo.rentInfo
        .filter(rent => rent.haoId.toString() === house._id.toString())
    })

    // 2返回list
    return dbInfo.houseInfo
  },

  one: async req => {
    // 1通过ID查询
    // 2返回det对象

    if (!req.body.rentId) {
      return Promise.reject(new FoundError('缺少rentId'))
    }

    // 初始化该库
    db.dbModel('house')
    db.dbModel('month')

    // 1通过ID查询
    const rentInfo = await db
      .dbModel('rent')
      .findOne({ _id: db.db.Types.ObjectId(req.body.rentId) })
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime detail',
        match: { status: 1 },
      })
      .populate({
        path: 'monthId',
        model: 'month',
        select: 'month',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-addTime')
      .lean()
      .exec()

    if (!rentInfo) {
      return Promise.reject(new FoundError('无收租单信息'))
    }

    if (rentInfo.haoId && !rentInfo.fanghao) {
      rentInfo.fanghao = rentInfo.haoId.fang + rentInfo.haoId.hao
    }

    // 2返回
    return rentInfo
  },

  listByNewestMonth: async req => {
    // 通过房屋查询所有最新挂载信息：租约信息
    // 1初始化字段后
    // 2再根据monthId查询月度信息
    // 3根据房屋Id插入monthId信息
    // 4返回list对象

    // 初始化该库
    db.dbModel('lease')

    // 数据库查询
    const houseInfo = () => db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        leaseId: 1,
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('fang hao')
      .lean()
      .exec()

    const monthInfo = () => db
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

    const houseAndMonth = await Promise.all([houseInfo, monthInfo])

    // 2再根据monthId查询月度信息
    const rentInfo = await db
      .dbModel('rent')
      .find({ monthId: db.db.Types.ObjectId(houseAndMonth.monthInfo._id) })
      .where('status')
      .equals(1)
      .sort('-addTime')
      .lean()
      .exec()

    // 3根据房屋Id插入monthId信息
    houseAndMonth.houseInfo.forEach(house => {
      // 字段提供
      if (!house.fanghao) house.fanghao = house.fang + house.hao
      if (!house.leaseId) house.leaseId = {}

      // 处理租住信息
      house.rents = rentInfo
        .filter(rent => rent.haoId.toString() === house._id.toString())
    })

    // 4返回list
    return houseAndMonth.houseInfo
  },

  listByHaoAndMonth: async req => {
    // 1查询数据
    // 2返回list对象

    if (!req.body.monthId) {
      return Promise.reject(new FoundError('缺少rentId'))
    }

    // 初始化该库
    db.dbModel('house')
    db.dbModel('month')

    // 1查询数据
    const dbInfo = await db
      .dbModel('rent')
      .find({
        haoId: db.db.Types.ObjectId(req.body.haoId),
        monthId: db.db.Types.ObjectId(req.body.monthId),
      })
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime detail',
        match: { status: 1 },
      })
      .populate({
        path: 'monthId',
        model: 'month',
        select: 'month',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-addTime')
      .lean()
      .exec()

    dbInfo.forEach(rent => {
      // 房屋
      if (rent.haoId && !rent.fanghao) {
        rent.fanghao = rent.haoId.fang + rent.haoId.hao
      }
    })

    // 2返回数据
    return dbInfo
  },
}
