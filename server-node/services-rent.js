const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

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
      .sort('-addTime fanghao')
      .lean()
      .exec()

    const dbInfo = await Promise.all([houseInfo(), rentInfo()])

    dbInfo[0].forEach(house => {
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
      house.rents = dbInfo[1]
        .filter(rent => rent.haoId.toString() === house._id.toString())
        // 时间倒序后要重新正序
        .reverse()
    })

    // 2返回list
    return dbInfo[0]
  },

  rentAdd: async req => {
    // 不做数据校验
    // 1插入数据（存储新水费记录，电费记录，租住信息），错误退出
    // 2更新房屋挂载ID，错误提出
    // 3返回add对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('请选择房屋'))
    } else if (!req.body.monthId) {
      return Promise.reject(new FoundError('请选择月份'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1插入数据
    const addInfo = await db
      .dbModel('rent', {//* //标记，初始计租数据数数据类，新增类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        haoId: db.db.Schema.Types.ObjectId, // 房屋ID，全拼
        monthId: db.db.Schema.Types.ObjectId, // 月度周期ID，全拼
        calWater: Object, // 水费计费
        calElectric: Object, // 电费计费
        lease: Object, // 租住信息
        fanghao: String, // 房屋
        remark: String, // 计费备注
        addTime: String, // 计费时间
        fix: Boolean, // 结果是否修正
        calRentResult: Number, // 计算结果
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        haoId: req.body.haoId,
        monthId: req.body.monthId,
        calWater: req.body.calWater,
        calElectric: req.body.calElectric,
        lease: req.body.lease,
        fanghao: req.body.fanghao,
        remark: req.body.remark,
        addTime: req.body.addTime,
        fix: req.body.fix,
        calRentResult: req.body.calRentResult,
        status: 1,
        createTime: Date.now(),
      })

    if (!addInfo) {
      return Promise.reject(new FoundError('插入失败'))
    }

    // 2更新房屋挂载ID
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新计租数据引用类型
        rentId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        rentId: addInfo._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法更新抄租单信息ID'))
    }

    // 3返回数据
    return { _id: addInfo._id }
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

  rentType: async req => {
    // 校验字段，错误退出
    // 1修改字段状态
    // 2返回edit对象

    if (!req.body.rentId) {
      return Promise.reject(new FoundError('请选择收租单'))
    }

    // 1根据ID修改状态
    const editInfo = await db
      .dbModel('rent', {//* //标记，计租数据类，状态修改类型
        type: {
          checkAll: Boolean,
          isIndeterminate: Boolean,
          type: Array,
          typeTime: {
            1: String,
            2: String,
            3: String,
          },
        },
        lease: { payType: Number },
        remark: String,

        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.rentId }, {
        type: {
          checkAll: req.body.checkAll,
          isIndeterminate: req.body.isIndeterminate,
          type: req.body.type,
          typeTime: req.body.typeTime,
        },
        'lease.payType': req.body.payType,
        remark: req.body.remark,
        updateTime: Date.now(),
      })
      .exec()

    if (!editInfo) {
      return Promise.reject(new FoundError('修改失败，数据不存在'))
    }

    // 2返回id
    return { _id: req.body.rentId }
  },

  rentCheckBill: async req => {
    // 校验字段，错误退出
    // 1修改字段状态
    // 2返回edit对象

    if (!req.body.rentId) {
      return Promise.reject(new FoundError('请选择收租单'))
    }

    // 1根据ID修改状态
    const editInfo = await db
      .dbModel('rent', {//* //标记，计租数据类，状态修改类型
        checkBill: Boolean, // 是否对账
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.rentId }, {
        checkBill: req.body.checkBill,
        updateTime: Date.now(),
      })
      .exec()

    if (!editInfo) {
      return Promise.reject(new FoundError('修改失败，数据不存在'))
    }

    // 2返回id
    return { _id: req.body.rentId }
  },

  rentDel: async req => {
    // 校验数据，错误退出
    // 1修改状态，错误退出
    // 2查询上一条数据
    // 3更新房屋挂载ID，错误退出
    // 4返回del对象

    if (!req.body._id || !req.body.haoId) {
      return Promise.reject(new FoundError('缺少参数'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1根据ID修改状态
    const rentDel = await db
      .dbModel('rent', {//* //标记，初始电费计费数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!rentDel || !rentDel.status) {
      return Promise.reject(new FoundError('删除失败'))
    }

    // 2查询上一条租单计费数据
    const rentPrev = await db
      .dbModel('rent')
      .findOne({})
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('haoId')
      .equals(db.db.Types.ObjectId(req.body.haoId))
      .where('status')
      .equals(1)
      .sort('-addTime')
      .exec()

    const rentPrevId = rentPrev ? rentPrev._id : null

    // 3更新房屋最新租单计费信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新电表计费引用类型
        rentId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        rentId: rentPrevId,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法删除租单'))
    }

    // 4返回ID
    return { _id: req.body._id }
  },

  rentListByHao: async req => {
    // 1查询数据
    // 2返回list对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('缺少参数'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 初始化挂载信息
    db.dbModel('house')
    db.dbModel('month')

    // 1查询数据
    const dbInfo = await db
      .dbModel('rent')
      .find({ haoId: db.db.Types.ObjectId(req.body.haoId) })
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime',
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
      .sort('-addTime fanghao')
      .lean()
      .exec()

    dbInfo.forEach(rent => {
      // 房屋
      if (rent.haoId && !rent.fanghao) {
        rent.fanghao = rent.haoId.fang + rent.haoId.hao
      }
    })

    // 2返回对象
    return dbInfo
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

    const houseAndMonth = await Promise.all([houseInfo(), monthInfo()])

    if (!houseAndMonth[1]) {
      return Promise.reject(new FoundError('暂无最新月度信息'))
    }

    // 2再根据monthId查询月度信息
    const rentInfo = await db
      .dbModel('rent')
      .find({ monthId: db.db.Types.ObjectId(houseAndMonth[1]._id) })
      .where('status')
      .equals(1)
      .sort('-addTime fanghao')
      .lean()
      .exec()

    // 3根据房屋Id插入monthId信息
    houseAndMonth[0].forEach(house => {
      // 字段提供
      if (!house.fanghao) house.fanghao = house.fang + house.hao
      if (!house.leaseId) house.leaseId = {}

      // 处理租住信息
      house.rents = rentInfo
        .filter(rent => rent.haoId.toString() === house._id.toString())
    })

    // 4返回list
    return houseAndMonth[0]
  },

  listByHaoAndMonth: async req => {
    // 1查询数据
    // 2返回list对象

    if (!req.body.monthId) {
      return Promise.reject(new FoundError('缺少rentId'))
    } else if (!req.body.haoId) {
      return Promise.reject(new FoundError('缺少参数'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

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
      .sort('-addTime fanghao')
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

  rentListByLandord: async req => {
    // 1查询数据
    // 2返回list对象

    if (!req.body.monthId) {
      return Promise.reject(new FoundError('缺少rentId'))
    }

    // 初始化该库
    db.dbModel('month')

    // 1查询数据
    const dbInfo = await db
      .dbModel('rent')
      .find({
        'type.type': 3,
        monthId: db.db.Types.ObjectId(req.body.monthId),
      })
      .populate({
        path: 'monthId',
        model: 'month',
        select: 'month',
        match: { status: 1 },
      })
      .where('status')
      .equals(1)
      .sort('-type.typeTime.3 fanghao')
      .lean()
      .exec()

    const list = {}
    dbInfo.forEach(rent => {
      // 东八区偏移时间
      const dateOffset = -480
      let time = new Date(rent.type.typeTime[3])
      time.setMinutes(time.getMinutes() + (time.getTimezoneOffset() - dateOffset))
      time = new Date(time.toLocaleDateString()).getTime()
      // 初始化字段
      if (!list[time]) {
        list[time] = {
          // 收租类型
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          all: 0,
          // 定制计算，不进行通用区分
          six: 0,
          sixRent: 0,
          sixCost: 0,
          sixList: [],
          eight: 0,
          eightRent: 0,
          eightCost: 0,
          eightList: [],
        }
      }
      // 分类统计
      list[time][rent.lease.payType] += rent.calRentResult
      list[time].all += rent.calRentResult
      // 非房租都认为是水电费
      // (rent.calWater ? rent.calWater.calWaterResult : 0) +
      // (rent.calElectric ? rent.calElectric.calElectricResult : 0)
      rent.cost = rent.calRentResult - rent.lease.rent
      // 修复不足整月时应收小于房租的问题，反推计算水电数和房租数
      if (rent.cost < 0) {
        const cost =
        (rent.calWater ? rent.calWater.calWaterResult : 0) +
        (rent.calElectric ? rent.calElectric.calElectricResult : 0)
        rent.lease.rent = rent.calRentResult - cost
        rent.cost = cost
      }
      rent.cost = Math.abs(rent.cost)
      // 默认字段提供
      if (!rent.checkBill) rent.checkBill = false
      rent.checkBilling = false
      // 定制计算，分类房屋，租单数据没有分开房屋，其实可以的
      if (rent.fanghao.indexOf('8坊68栋') >= 0) {
        list[time].eight += rent.calRentResult
        list[time].eightRent += rent.lease.rent
        list[time].eightCost += rent.cost
        list[time].eightList.push(rent)
      } else {
        list[time].six += rent.calRentResult
        list[time].sixRent += rent.lease.rent
        list[time].sixCost += rent.cost
        list[time].sixList.push(rent)
      }
    })

    const sortFun = (a, b) => {
      if (a.fanghao > b.fanghao) return 1
      if (a.fanghao < b.fanghao) return -1
      return 0
    }

    // 重新排序
    Object.keys(list).forEach(time => {
      list[time].sixList.sort(sortFun)
      list[time].eightList.sort(sortFun)
    })

    // 2返回数据
    return list
  },

  rentListByLandordTemp: async req => {
    // 1查询数据
    // 2返回list对象

    if (!req.body.monthId) {
      return Promise.reject(new FoundError('缺少rentId'))
    }

    // 初始化该库
    db.dbModel('month')

    // 1查询数据
    const dbInfo = await db
      .dbModel('rent')
      .find({
        'type.type': {
          $in: [1],
          $ne: 3,
        },
        monthId: db.db.Types.ObjectId(req.body.monthId),
      })
      .populate({
        path: 'monthId',
        model: 'month',
        select: 'month',
        match: { status: 1 },
      })
      .where('status')
      .equals(1)
      .sort('-type.typeTime.3 fanghao')
      .lean()
      .exec()

    const list = {
      // 收租类型
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      all: 0,
      // 定制计算，不进行通用区分
      six: 0,
      sixRent: 0,
      sixCost: 0,
      sixList: [],
      eight: 0,
      eightRent: 0,
      eightCost: 0,
      eightList: [],
    }

    dbInfo.forEach(rent => {
      list[rent.lease.payType] += rent.calRentResult
      list.all += rent.calRentResult
      // 非房租都认为是水电费
      // (i.calWater ? i.calWater.calWaterResult : 0) +
      // (i.calElectric ? i.calElectric.calElectricResult : 0)
      rent.cost = rent.calRentResult - rent.lease.rent
      // 默认字段提供
      if (!rent.checkBill) rent.checkBill = false
      rent.checkBilling = false
      // 定制计算，分类房屋，租单数据没有分开房屋，其实可以的
      if (rent.fanghao.indexOf('8坊68栋') >= 0) {
        list.eight += rent.calRentResult
        list.eightRent += rent.lease.rent
        list.eightCost += rent.cost
        list.eightList.push(rent)
      } else {
        list.six += rent.calRentResult
        list.sixRent += rent.lease.rent
        list.sixCost += rent.cost
        list.sixList.push(rent)
      }
    })

    const sortFun = (a, b) => {
      if (a.fanghao > b.fanghao) return 1
      if (a.fanghao < b.fanghao) return -1
      return 0
    }

    // 重新排序
    list.sixList.sort(sortFun)
    list.eightList.sort(sortFun)

    // 2返回数据
    return list
  },
}
