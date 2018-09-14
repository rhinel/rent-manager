const FoundError = require('./config-error')
const db = require('./models')

const servicesHouse = require('./services-house')

module.exports = {

  leaseMainList: async req => {
    // 1查询房屋数据，租户信息
    // 2返回list对象

    // 初始化该库
    db.dbModel('lease')

    // 1数据库查询
    const dbInfo = await db
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

    // 字段初始化
    dbInfo.forEach(lease => {
      // 字段提供
      if (!lease.fanghao) {
        lease.fanghao = lease.fang + lease.hao
      }
      if (!lease.leaseId) {
        lease.leaseId = {}
      }
    })

    // 2返回list对象
    return dbInfo
  },

  leaseIn: async req => {
    // 此接口有效唯一
    // 不做数据校验
    // 1ID存在更新数据，错误退出
    // 2ID不存查询数据是否存在，存在->错误退出
    // 3插入数据，错误退出
    // 4更新房屋挂载ID，错误退出
    // 5返回add对象

    if (!req.body.haoId) {
      return Promise.reject(new FoundError('缺少房屋ID'))
    }

    // 0code 1 校验房屋ID
    await servicesHouse
      .houseFind(req)

    const leaseModel = {//* //标记，租住数据类型
      name: String, // 租户姓名
      call: String, // 租户电话
      leaserange: Array, // 租住周期
      payDay: Number, // 付租时间
      payType: Number, // 付租方式
      remark: String, // 备注

      calWaterPrice: {
        minPrice: Number, // 本次计费低消
        calType: String, // 计费类型
        singlePrice: Number, // single单价
        stepPrice: [{ // 阶梯价格
          step: Number, // 阶梯
          price: Number, // 单价
        }],
      },

      calElePrice: {
        minPrice: Number, // 本次计费低消
        calType: String, // 计费类型
        singlePrice: Number, // single单价
        stepPrice: [{ // 阶梯价格
          step: Number, // 阶梯
          price: Number, // 单价
        }],
      },

      rent: Number, // 租金
      deposit: Number, // 押金
      addTime: String, // 入住时间
    }

    // 1根据ID修改内容
    if (req.body._id) {
      // 数据处理
      const editLeaseModel = leaseModel
      editLeaseModel.updateTime = Number
      const editLease = req.body
      editLease.updateTime = Date.now()
      const editInfo = await db
        .dbModel('lease', editLeaseModel) //* //标记，更新数据类型
        .findOneAndUpdate({ _id: req.body._id }, { $set: editLease })
        .exec()

      if (!editInfo) {
        return Promise.reject(new FoundError('修改失败，数据不存在'))
      }

      return { _id: req.body._id }
    }

    // 2数据库查询是否已存在
    const leaseData = await db
      .dbModel('lease')
      .find({
        userId: db.db.Types.ObjectId(req.userId),
        haoId: req.body.haoId,
        status: 1,
      })
      .exec()

    if (leaseData.length) {
      return Promise.reject(new FoundError('房间已有人租住'))
    }

    // 3插入数据
    const createLeaseModel = leaseModel
    createLeaseModel.createTime = Number
    createLeaseModel.haoId = db.db.Schema.Types.ObjectId
    createLeaseModel.userId = db.db.Schema.Types.ObjectId
    createLeaseModel.fanghao = String
    createLeaseModel.status = Number
    const createLease = req.body
    createLease.createTime = Date.now()
    createLease.userId = req.userId
    createLease.status = 1
    delete createLease._id

    const newInfo = await db
      .dbModel('lease', createLeaseModel)//* //标记，新增数据类型
      .create(createLease)

    if (!newInfo) {
      return Promise.reject(new FoundError('入住数据插入失败'))
    }

    // 4更新房屋最新租户信息
    const house = await db
      .dbModel('house', {//* //标记，更新房屋数据类，扩增最新租户信息引用类型
        leaseId: db.db.Schema.Types.ObjectId,
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body.haoId }, {
        leaseId: newInfo._id,
        updateTime: Date.now(),
      })
      .exec()

    if (!house) {
      return Promise.reject(new FoundError('房屋不存在，无法删除水度数'))
    }

    // 4返回ID
    return { _id: newInfo._id }
  },

  leaseOut: async req => {
    // 校验字段，错误退出
    // 1修改状态（无需更新房屋挂载ID）
    // 2返回out对象

    if (!req.body.haoId || !req.body._id || !req.body.outTime) {
      return Promise.reject(new FoundError('缺少参数'))
    }

    // 1根据ID修改状态
    // 由于不需要读取上一条信息，因此houseId上并没有清除租住者ID
    const leaseOutInfo = await db
      .dbModel('lease', {//* //标记，初始租住类型数据类，删除类型
        outTime: String, // 搬出时间
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        outTime: req.body.outTime,
        status: 2, // 搬出为2，正常为1
        updateTime: Date.now(),
      })
      .exec()

    if (!leaseOutInfo || leaseOutInfo.status !== 1) {
      return Promise.reject(new FoundError('搬出修改失败'))
    }
    // 2返回ID
    return { _id: req.body._id }
  },

  leaseList: async req => {
    // 1查询房屋数据，租户信息（状态2）历史记录
    // 2返回list对象

    // 初始化该库
    db.dbModel('house')

    // 1数据库查询
    const dbInfo = await db
      .dbModel('lease')
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
      .equals(2)
      .sort('-addTime')
      .lean()
      .exec()

    dbInfo.forEach((lease) => {
      // loading字段提供
      if (!lease.gettingdelLease) {
        lease.gettingdelLease = false
      }
      // del提示字段提供
      if (!lease.dLeasePopFlag) {
        lease.dLeasePopFlag = false
      }
      // 房屋
      if (lease.haoId && !lease.fanghao) {
        lease.fanghao = lease.haoId.fang + lease.haoId.hao
      }
    })

    // 2返回数据
    return dbInfo
  },

  leaseDel: async req => {
    // 校验字段，错误退出
    // 1修改状态（无需更新房屋挂载ID）
    // 2返回del对象
    if (!req.body._id) {
      return Promise.reject(new FoundError('缺少参数'))
    }

    // 1根据ID修改状态
    // 由于不需要读取上一条信息，因此houseId上并没有清除租住者ID
    const leaseInfo = await db
      .dbModel('lease', {//* //标记，租住数据类，删除类型
        status: Number, // 状态
        updateTime: Number, // 更新时间
      })
      .findOneAndUpdate({ _id: req.body._id }, {
        status: 0,
        updateTime: Date.now(),
      })
      .exec()

    if (!leaseInfo || !leaseInfo.status) {
      return Promise.reject(new FoundError('删除失败'))
    }

    // 2返回del对象
    return { _id: req.body._id }
  },

}
