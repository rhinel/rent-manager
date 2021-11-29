const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

module.exports = {

  electricAdd: async req => {
    // 校验数据，错误退出
    // 1插入数据，错误退出
    // 2更新房屋挂载ID，错误退出
    // 3返回add对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('请选择房屋'))
    }

    if (!req.body.electric && typeof req.body.electric !== 'number') {
      return Promise.reject(new FoundError('请填写电表数'))
    }

    if (!req.body.addTime) {
      return Promise.reject(new FoundError('请填写抄表时间'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1插入电表抄表记录
    const addData = await db
      .dbModel('electric', {//* //标记，初始电表数数据类，新增类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        haoId: db.db.Schema.Types.ObjectId, // 房屋ID
        electric: Number, // 电表数，全拼
        remark: String, // 备注，全拼
        addTime: String, // 抄表时间
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        haoId: req.body.haoId,
        electric: req.body.electric,
        remark: req.body.remark || '',
        addTime: req.body.addTime,
        status: 1,
        createTime: Date.now(),
      })

    if (!addData) {
      return Promise.reject(new FoundError('抄表失败'))
    }

    // 2更新房屋最新电表数信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新抄表数引用类型
        electricId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        electricId: addData._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法更新抄电表ID'))
    }

    // 3返回数据
    return { _id: addData._id }
  },

  electricMainList: async req => {
    // 查询房屋数据，抄表记录，计费记录，租户信息
    // 1电费小计计费
    // 2返回list对象

    // 初始化该库
    db.dbModel('electric')
    db.dbModel('electriccal')
    db.dbModel('lease')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        electricId: 1,
        calElectricId: 1,
        leaseId: 1,
      })
      .populate({
        path: 'electricId',
        model: 'electric',
        select: 'electric remark addTime',
        match: { status: 1 },
      })
      .populate({
        path: 'calElectricId',
        model: 'electriccal',
        select: 'tnew addTime',
        match: { status: 1 },
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        select: 'calElePrice',
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
      // 上次电费ID初始化
      if (!item.calElectricId) item.calElectricId = {}
      if (item.calElectricId.tnew) {
        item.calElectricId.tnew.addTime = item.calElectricId.addTime
        item.calElectricId = item.calElectricId.tnew
      }
      // 抄电ID初始化
      if (!item.electricId) item.electricId = {}
      // 收费方式初始化
      if (!item.leaseId) item.leaseId = {}
      if (item.leaseId.calElePrice) {
        item.leaseId = item.leaseId.calElePrice
      }
      // 差距计算
      if (!item.gap) {
        item.gap = (item.electricId.electric || 0) - (item.calElectricId.electric || 0)
      }
      if (item.gap <= 0) {
        item.gap = 0
      }

      // 小计计算
      // 电表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
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
            (calGap > (prevPrices.step || 0) && calGap <= stepPrice.step)
            || (i === (stepPrices.length - 1) && calGap >= stepPrice.step)
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

  electricList: async req => {
    // 1查询抄表记录，房屋数据
    // 2返回list对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('缺少房屋ID'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 初始化该库
    db.dbModel('house')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('electric')
      .find({ haoId: db.db.Types.ObjectId(req.body.haoId) })
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-createTime -_id')
      .lean()
      .exec()

    dbInfo.forEach(electric => {
      // loading字段提供
      if (!electric.gettingdelElectric) electric.gettingdelElectric = false
      // del提示字段提供
      if (!electric.dElectricPopFlag) electric.dElectricPopFlag = false
      // 房屋
      if (electric.haoId && !electric.fanghao) {
        electric.fanghao = electric.haoId.fang + electric.haoId.hao
      }
    })

    // 2返回数据
    return dbInfo
  },

  electricCalList: async req => {
    // 查询计费记录，房屋数据
    // 返回list对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('缺少房屋ID'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1初始化该库
    db.dbModel('house')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('electriccal')
      .find({ haoId: db.db.Types.ObjectId(req.body.haoId) })
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime',
        match: { status: 1 },
      })
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-createTime -_id')
      .lean()
      .exec()

    dbInfo.forEach(electricCal => {
      // loading字段提供
      if (!electricCal.gettingdelCalElectric) electricCal.gettingdelCalElectric = false
      // del提示字段提供
      if (!electricCal.dCalElectricPopFlag) electricCal.dCalElectricPopFlag = false
      // 房屋
      if (electricCal.haoId && !electricCal.fanghao) {
        electricCal.fanghao = electricCal.haoId.fang + electricCal.haoId.hao
      }
      // 小计
      if (!electricCal.gap) {
        electricCal.gap = (electricCal.tnew.electric || 0) - (electricCal.old.electric || 0)
      }
      if (electricCal.gap <= 0) electricCal.gap = 0
    })

    // 2返回数据
    return dbInfo
  },

  electriccalElectric: async req => {
    // 不做数据校验
    // 1插入数据（存储新抄表记录，旧抄表记录，计费信息），错误退出
    // 2更新房屋挂载ID，错误提出
    // 3返回add对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('请选择房屋'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1插入数据
    const addInfo = await db
      .dbModel('electriccal', {//* //标记，初始电表计费数数据类，新增类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        haoId: db.db.Schema.Types.ObjectId, // 房屋ID，全拼
        tnew: {
          electric: Number, // 抄表数
          remark: String, // 抄表备注
          addTime: String, // 抄表时间
        },
        old: {
          electric: Number, // 底表数
          remark: String, // 底表备注
          addTime: String, // 底表时间
        },
        calElectric: {
          minPrice: Number, // 本次计费低消
          calType: String, // 计费类型
          singlePrice: Number, // single单价
          stepPrice: [{ // 阶梯价格
            step: Number, // 阶梯
            price: Number, // 单价
          }],
        },
        remark: String, // 计费备注
        addTime: String, // 计费时间
        fix: Boolean, // 结果是否修正
        calElectricResult: Number, // 计算结果
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        haoId: req.body.haoId,
        tnew: req.body.tnew,
        old: req.body.old,
        calElectric: req.body.calElectric,
        remark: req.body.remark,
        addTime: req.body.addTime,
        fix: req.body.fix,
        calElectricResult: req.body.calElectricResult,
        status: 1,
        createTime: Date.now(),
      })

    if (!addInfo) {
      return Promise.reject(new FoundError('插入失败'))
    }

    // 2更新房屋最新电表计费数信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新计费数据引用类型
        calElectricId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        calElectricId: addInfo._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法电费计费更新ID'))
    }

    // 3返回数据
    return { _id: addInfo._id }
  },

  electricDel: async req => {
    // 校验数据，错误退出
    // 1修改状态，错误退出
    // 2查询上一条数据
    // 3更新房屋挂载ID，错误退出
    // 4返回del对象

    if (!req.body._id) {
      return Promise.reject(new FoundError('ID不存在'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1根据ID修改状态
    const electricDel = await db
      .dbModel('electric', {//* //标记，初始电表类型数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!electricDel || !electricDel.status) {
      return Promise.reject(new FoundError('删除失败'))
    }

    // 查询上一条电表数据
    const electricPrev = await db
      .dbModel('electric')
      .findOne({})
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('haoId')
      .equals(db.db.Types.ObjectId(req.body.haoId))
      .where('status')
      .equals(1)
      .sort('-createTime -_id')
      .exec()

    const electricPrevId = electricPrev ? electricPrev.id : null

    // 3更新房屋最新电表数信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新抄电表数引用类型
        electricId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        electricId: electricPrevId,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法删除电度数'))
    }

    // 4返回ID
    return { _id: req.body._id }
  },

  electricCalDel: async req => {
    // 校验数据，错误退出
    // 1修改状态，错误退出
    // 2查询上一条数据
    // 3更新房屋挂载ID，错误退出
    // 4返回del对象

    if (!req.body._id) {
      return Promise.reject(new FoundError('ID不存在'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1根据ID修改状态
    const electricCalDel = await db
      .dbModel('electriccal', {//* //标记，初始电费计费数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!electricCalDel || !electricCalDel.status) {
      return Promise.reject(new FoundError('删除失败'))
    }

    // 2查询上一条数据
    const electricCalDelPrev = await db
      .dbModel('electriccal')
      .findOne({})
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('haoId')
      .equals(db.db.Types.ObjectId(req.body.haoId))
      .where('status')
      .equals(1)
      .sort('-createTime -_id')
      .exec()

    const electricCalDelPrevId = electricCalDelPrev ? electricCalDelPrev.id : null

    // 3更新房屋最新电表计费信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新电表计费引用类型
        calElectricId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        calElectricId: electricCalDelPrevId,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法删除电费计费'))
    }

    // 4返回ID
    return { _id: req.body._id }
  },

  electricFindByDate: async req => {
    // 1获取时间
    // 2查询电表

    // 1获取时间
    const today = new Date().toLocaleDateString()
    const date = req.body.electricDate || today

    const time = new Date(date).getTime()
    const firstLeft = ' new Date(this.addTime).getTime() >= '
    const secondLfet = ' new Date(this.addTime).getTime() < '
    const all = `return${firstLeft}${time} &&${secondLfet}${time + 86400000}`

    db.dbModel('house')

    // 2查询电表
    const electricByDate = await db
      .dbModel('electric')
      .find({})
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime',
        match: { status: 1 },
      })
      // eslint-disable-next-line no-new-func
      .$where(new Function(all))
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('status')
      .equals(1)
      .sort('-addTime -createTime')
      .lean()
      .exec()

    electricByDate.forEach(electric => {
      // 房屋
      if (electric.haoId && !electric.fanghao) {
        electric.fanghao = electric.haoId.fang + electric.haoId.hao
      }
    })

    // 3返回数据
    return electricByDate
  },

  electricNewestList: async req => {
    // 查询房屋数据，抄表记录
    // 2返回list对象

    // 初始化该库
    db.dbModel('electric')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        glyhbh: 1,
        dbjb: 1,
        electricId: 1,
      })
      .populate({
        path: 'electricId',
        model: 'electric',
        select: 'electric remark addTime',
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
      // 抄电ID初始化
      if (!item.electricId) item.electricId = {}
      // 电力读数初始化
      if (!item.addElectric) item.addElectric = {}
    })

    // 3返回数据
    return dbInfo
  },

}
