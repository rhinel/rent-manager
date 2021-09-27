const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

module.exports = {

  gasAdd: async req => {
    // 校验数据，错误退出
    // 1插入数据，错误退出
    // 2更新房屋挂载ID，错误退出
    // 3返回add对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('请选择房屋'))
    }

    if (!req.body.gas) {
      return Promise.reject(new FoundError('请填写燃气表数'))
    }

    if (!req.body.addTime) {
      return Promise.reject(new FoundError('请填写抄表时间'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    // 1插入燃气表抄表记录
    const addData = await db
      .dbModel('gas', {//* //标记，初始燃气表数数据类，新增类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        haoId: db.db.Schema.Types.ObjectId, // 房屋ID
        gas: Number, // 燃气表数，全拼
        remark: String, // 备注，全拼
        addTime: String, // 抄表时间
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        haoId: req.body.haoId,
        gas: req.body.gas,
        remark: req.body.remark || '',
        addTime: req.body.addTime,
        status: 1,
        createTime: Date.now(),
      })

    if (!addData) {
      return Promise.reject(new FoundError('抄表失败'))
    }

    // 2更新房屋最新燃气表数信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新抄表数引用类型
        gasId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        gasId: addData._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法更新抄燃气表ID'))
    }

    // 3返回数据
    return { _id: addData._id }
  },

  gasMainList: async req => {
    // 1查询房屋数据，抄表记录，计费记录，租户信息
    // 2燃气费小计计费
    // 3返回list对象

    // 初始化该库
    db.dbModel('gas')
    db.dbModel('gascal')
    db.dbModel('lease')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('house')
      .find({}, {
        fang: 1,
        hao: 1,
        gasId: 1,
        calGasId: 1,
        leaseId: 1,
      })
      .populate({
        path: 'gasId',
        model: 'gas',
        select: 'gas remark addTime',
        match: { status: 1 },
      })
      .populate({
        path: 'calGasId',
        model: 'gascal',
        select: 'tnew addTime',
        match: { status: 1 },
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        select: 'calGasPrice',
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
      // 上次燃气费ID初始化
      if (!item.calGasId) item.calGasId = {}
      if (item.calGasId.tnew) {
        item.calGasId.tnew.addTime = item.calGasId.addTime
        item.calGasId = item.calGasId.tnew
      }
      // 抄燃气ID初始化
      if (!item.gasId) item.gasId = {}
      // 收费方式初始化
      if (!item.leaseId) item.leaseId = {}
      if (item.leaseId.calGasPrice) {
        item.leaseId = item.leaseId.calGasPrice
      }
      // 差距计算
      if (!item.gap) {
        item.gap = (item.gasId.gas || 0) - (item.calGasId.gas || 0)
      }
      if (item.gap <= 0) {
        item.gap = 0
      }

      // 小计计算
      // 燃气表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
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

  gasList: async req => {
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
      .dbModel('gas')
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

    dbInfo.forEach(gas => {
      // loading字段提供
      if (!gas.gettingdelGas) gas.gettingdelGas = false
      // del提示字段提供
      if (!gas.dGasPopFlag) gas.dGasPopFlag = false
      // 房屋
      if (gas.haoId && !gas.fanghao) {
        gas.fanghao = gas.haoId.fang + gas.haoId.hao
      }
    })

    // 2返回数据
    return dbInfo
  },

  gasCalList: async req => {
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
      .dbModel('gascal')
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

    dbInfo.forEach(gasCal => {
      // loading字段提供
      if (!gasCal.gettingdelCalGas) gasCal.gettingdelCalGas = false
      // del提示字段提供
      if (!gasCal.dCalGasPopFlag) gasCal.dCalGasPopFlag = false
      // 房屋
      if (gasCal.haoId && !gasCal.fanghao) {
        gasCal.fanghao = gasCal.haoId.fang + gasCal.haoId.hao
      }
      // 小计
      if (!gasCal.gap) {
        gasCal.gap = (gasCal.tnew.gas || 0) - (gasCal.old.gas || 0)
      }
      if (gasCal.gap <= 0) gasCal.gap = 0
    })

    // 2返回数据
    return dbInfo
  },

  gascalGas: async req => {
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
      .dbModel('gascal', {//* //标记，初始燃气表计费数数据类，新增类型
        userId: db.db.Schema.Types.ObjectId, // 用户ID
        haoId: db.db.Schema.Types.ObjectId, // 房屋ID，全拼
        tnew: {
          gas: Number, // 抄表数
          remark: String, // 抄表备注
          addTime: String, // 抄表时间
        },
        old: {
          gas: Number, // 底表数
          remark: String, // 底表备注
          addTime: String, // 底表时间
        },
        calGas: {
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
        calGasResult: Number, // 计算结果
        status: Number, // 状态
        createTime: Number, // 创建时间
      })
      .create({
        userId: req.userId,
        haoId: req.body.haoId,
        tnew: req.body.tnew,
        old: req.body.old,
        calGas: req.body.calGas,
        remark: req.body.remark,
        addTime: req.body.addTime,
        fix: req.body.fix,
        calGasResult: req.body.calGasResult,
        status: 1,
        createTime: Date.now(),
      })

    if (!addInfo) {
      return Promise.reject(new FoundError('插入失败'))
    }

    // 2更新房屋信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新计费数据引用类型
        calGasId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        calGasId: addInfo._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法燃气费计费更新ID'))
    }

    // 3返回数据
    return { _id: addInfo._id }
  },

  gasDel: async req => {
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
    const gasDel = await db
      .dbModel('gas', {//* //标记，初始燃气表类型数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!gasDel || !gasDel.status) {
      return Promise.reject(new FoundError('删除失败'))
    }

    // 2查询上一条数据
    const gasPrev = await db
      .dbModel('gas')
      .findOne({})
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('haoId')
      .equals(db.db.Types.ObjectId(req.body.haoId))
      .where('status')
      .equals(1)
      .sort('-createTime -_id')
      .exec()

    const gasPrevId = gasPrev ? gasPrev.id : null

    // 3更新房屋信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新抄燃气表数引用类型
        gasId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        gasId: gasPrevId,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法删除燃气度数'))
    }

    // 4返回ID
    return { _id: req.body._id }
  },

  gasCalDel: async req => {
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
    const gasCalDel = await db
      .dbModel('gascal', {//* //标记，初始燃气费计费数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!gasCalDel || !gasCalDel.status) {
      return Promise.reject(new FoundError('删除失败'))
    }

    // 2查询上一条数据
    const gasCalDelPrev = await db
      .dbModel('gascal')
      .findOne({})
      .where('userId')
      .equals(db.db.Types.ObjectId(req.userId))
      .where('haoId')
      .equals(db.db.Types.ObjectId(req.body.haoId))
      .where('status')
      .equals(1)
      .sort('-createTime -_id')
      .exec()

    const gasCalDelPrevId = gasCalDelPrev ? gasCalDelPrev.id : null

    // 3更新房屋最新燃气表计费信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新燃气表计费引用类型
        calGasId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        calGasId: gasCalDelPrevId,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法删除燃气费计费'))
    }

    // 4返回ID
    return { _id: req.body._id }
  },

  gasFindByDate: async req => {
    // 1获取时间
    // 2查询燃气表

    // 1获取时间
    const today = new Date().toLocaleDateString()
    const date = req.body.gasDate || today

    const time = new Date(date).getTime()
    const firstLeft = ' new Date(this.addTime).getTime() >= '
    const secondLfet = ' new Date(this.addTime).getTime() < '
    const all = `return${firstLeft}${time} &&${secondLfet}${time + 86400000}`

    db.dbModel('house')

    // 2查询燃气表
    const gasByDate = await db
      .dbModel('gas')
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

    gasByDate.forEach(gas => {
      // 房屋
      if (gas.haoId && !gas.fanghao) {
        gas.fanghao = gas.haoId.fang + gas.haoId.hao
      }
    })

    // 3返回数据
    return gasByDate
  },

}
