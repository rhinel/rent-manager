const FoundError = require('./config-error')
const db = require('./models')

module.exports = {

  houseAdd: async req => {
    // 此接口名称唯一
    // 校验字段，错误退出
    // 1ID存在修改数据，错误退出
    // 2ID不存在查询数据是否存在，存在->错误退出
    // 3插入数据，错误退出
    // 4返回add对象

    if (!req.body.fang) {
      return Promise.reject(new FoundError('请选择坊号'))
    } else if (!req.body.hao) {
      return Promise.reject(new FoundError('请填写房间号'))
    }

    // 1如果有ID，根据ID修改内容
    if (req.body._id) {
      const house = await db
        .dbModel('house', {//* //标记，初始房屋数据类，修改类型
          fang: String, // 坊号，全拼
          hao: String, // 房间号，全拼
          detail: String, // 说明
          updateTime: Number, // 更新时间
        })
        .findOneAndUpdate({ _id: req.body._id }, {
          $set: {
            fang: req.body.fang,
            hao: req.body.hao,
            detail: req.body.detail,
            updateTime: Date.now(),
          },
        })
        .exec()

      if (!house) {
        return Promise.reject(new FoundError('修改失败，数据不存在'))
      }

      return { _id: req.body._id }
    }

    // 2数据库查询是否已存在
    const houses = await db
      .dbModel('house')
      .find({
        userId: db.db.Types.ObjectId(req.userId),
        fang: req.body.fang,
        hao: req.body.hao,
        status: 1,
      })
      .exec()

    if (houses.length) {
      return Promise.reject(new FoundError('房间已存在'))
    }


    // 3插入数据
    const house = await db
      .dbModel('house', { //* //标记，初始房屋数据类，创建类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        fang: String, // 坊号，全拼
        hao: String, // 房间号，全拼
        detail: String, // 说明
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        fang: req.body.fang,
        hao: req.body.hao,
        detail: req.body.detail,
        status: 1,
        createTime: Date.now(),
      })

    // 4返回数据
    return { _id: house._id }
  },

  // code 1
  houseFind: async req => {
    // 1查询数据，错误退出
    // 2返回find对象

    if (!req.body._id) {
      return Promise.reject(new FoundError('缺少房屋ID'))
    }

    // 数据库查询
    const house = await db
      .dbModel('house')
      .findOne({ _id: req.body._id })
      .where('status')
      .equals(1)
      .exec()

    if (!house) {
      const err = new FoundError('数据不存在')
      err.code = 1
      return Promise.reject(err)
    }

    return house
  },

  houseList: async req => {
    // 1查询数据
    // 2返回list对象

    // 1数据库查询
    const houseList = await db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        detail: 1,
        createTime: 1,
        updateTime: 1,
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('fang hao')
      .lean()
      .exec()

    // 字段初始化
    houseList.forEach(house => {
      // loading字段提供
      if (!house.gettingdelHouse) house.gettingdelHouse = false
      // del提示字段提供
      if (!house.dHousePopFlag) house.dHousePopFlag = false
    })

    // 2返回数据
    return houseList
  },

  houseDel: async req => {
    // 1修改状态
    // 2返回del对象

    if (!req.body._id) {
      return Promise.reject(new FoundError('缺少ID'))
    }

    // 1根据ID修改状态
    const house = await db
      .dbModel('house', {//* //标记，初始房屋数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!house || !house.status) {
      return Promise.reject(new FoundError('无此房屋或房屋已删除'))
    }

    return { _id: req.body._id }
  },

  listWithCal: async req => {
    // 1查询数据
    // 2返回list对象

    // 1数据库查询
    const dbInfo = await db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        createTime: 1,
        updateTime: 1,
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('fang hao')
      .lean()
      .exec()

    const dbSearch = dbInfo.map(async house => {
      // 查询水费信息
      const calWaters = await db
        .dbModel('watercal')
        .find({ haoId: db.db.Types.ObjectId(house._id) }, {
          old: 1,
          tnew: 1,
          addTime: 1,
        })
        .where('userId')
        .equals(db.db.Types.ObjectId(req.userId))
        .where('status')
        .equals(1)
        .limit(3)
        .sort('-addTime')
        .lean()
        .exec()

      // 查询电费信息
      const calElectrics = await db
        .dbModel('electriccal')
        .find({ haoId: db.db.Types.ObjectId(house._id) }, {
          old: 1,
          tnew: 1,
          addTime: 1,
        })
        .where('userId')
        .equals(db.db.Types.ObjectId(req.userId))
        .where('status')
        .equals(1)
        .limit(3)
        .sort('-addTime')
        .lean()
        .exec()

      return { calWaters, calElectrics }
    })
    const dbSearchInfo = await Promise.all(dbSearch)

    // 2遍历查询
    for (let i = 0; i < dbInfo.length; i += 1) {
      // 字段补充
      if (dbInfo[i].fang && !dbInfo[i].fanghao) {
        dbInfo[i].fanghao = dbInfo[i].fang + dbInfo[i].hao
      }

      // 计算水费小计
      dbSearchInfo[i].calWaters.forEach(j => {
        if (!j.gap) {
          j.gap = (j.tnew.water || 0) - (j.old.water || 0)
        }
        if (j.gap <= 0) {
          j.gap = 0
        }
      })

      // 计算电费小计
      dbSearchInfo[i].calElectrics.forEach(k => {
        if (!k.gap) {
          k.gap = (k.tnew.electric || 0) - (k.old.electric || 0)
        }
        if (k.gap <= 0) {
          k.gap = 0
        }
      })

      // 获取数据
      dbInfo[i].calWaters = dbSearchInfo[i].calWaters
      dbInfo[i].calElectrics = dbSearchInfo[i].calElectrics
    }

    // 3返回数据
    return dbInfo
  },

  detByHao: async req => {
    // 1通过ID查询所有的house的连带信息
    // 2返回det对象

    db.dbModel('lease')
    db.dbModel('water')
    db.dbModel('watercal')
    db.dbModel('electric')
    db.dbModel('electriccal')
    db.dbModel('rent')

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('缺少房屋ID'))
    }

    // 1数据库查询
    const dbInfo = await db
      .dbModel('house')
      .findOne({ _id: req.body.haoId })
      // 租住信息
      .populate({
        path: 'leaseId',
        model: 'lease',
        match: { status: 1 },
      })
      // 抄水表信息
      .populate({
        path: 'waterId',
        model: 'water',
        match: { status: 1 },
      })
      // 水表计费信息
      .populate({
        path: 'calWaterId',
        model: 'watercal',
        match: { status: 1 },
      })
      // 抄电表信息
      .populate({
        path: 'electricId',
        model: 'electric',
        match: { status: 1 },
      })
      // 电表计费信息
      .populate({
        path: 'calElectricId',
        model: 'electriccal',
        match: { status: 1 },
      })
      // 最新计费信息
      .populate({
        path: 'rentId',
        model: 'rent',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .lean()
      .exec()

    // 2字段提供
    if (!dbInfo.fanghao) dbInfo.fanghao = dbInfo.fang + dbInfo.hao
    // 3字段初始化
    if (!dbInfo.waterId) dbInfo.waterId = {}
    if (!dbInfo.electricId) dbInfo.electricId = {}
    if (!dbInfo.calWaterId) dbInfo.calWaterId = {}
    if (!dbInfo.calElectricId) dbInfo.calElectricId = {}
    if (!dbInfo.leaseId) dbInfo.leaseId = {}
    if (!dbInfo.rentId) dbInfo.rentId = {}

    // 4返回数据
    return dbInfo
  },
}
