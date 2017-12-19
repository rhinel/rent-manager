const FoundError = require('./config-error')
const db = require('./models')

module.exports = {

  count: async req => {
    // 1查询房屋数
    // 2返回数据

    // 初始化该库
    db.dbModel('lease')

    // 1查询房屋数
    const houseInfo = await db
      .dbModel('house')
      .find({
        userId: db.db.Types.ObjectId(req.userId),
        status: 1,
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        match: { status: 1 },
      })
      .lean()
      .exec()

    const count = {
      leaseEmpty: 0,
      houseCount: houseInfo.length,
    }

    houseInfo.forEach(house => {
      if (!house.leaseId) count.leaseEmpty += 1
    })

    // 2返回数据
    return count
  },

  leaseEmptyList: async req => {
    // 查询房屋数
    // 返回数据

    // 初始化该库
    db.dbModel('lease')

    // 1查询
    const houseInfo = await db
      .dbModel('house')
      .find({
        userId: db.db.Types.ObjectId(req.userId),
        status: 1,
      })
      .populate({
        path: 'leaseId',
        model: 'lease',
        match: { status: 1 },
      })
      .lean()
      .exec()

    const emptyList = houseInfo
      .filter(house => !house.leaseId)

    return emptyList
  },

  addNote: async req => {
    // 不做数据校验
    // 1判断ID
    // 2不需要查重
    // 3返回被添加对象

    // 1如果有ID
    if (req.body._id) {
      const editNote = await db
        .dbModel('note', { //* //标记，初始记事数据类，修改类型
          haoId: db.db.Schema.Types.ObjectId,
          content: String, // 内容
          addTime: String, // 记事时间
          status: Number, // 状态
          updateTime: Number, // 更新时间
        })
        .findOneAndUpdate({ _id: req.body._id }, {
          haoId: db.db.Types.ObjectId(req.body.haoId),
          content: req.body.content,
          addTime: req.body.addTime,
          status: req.body.status,
          updateTime: Date.now(),
        })
        .exec()

      if (!editNote) {
        return Promise.reject(new FoundError('修改失败'))
      }

      return { _id: req.body._id }
    }

    // 2插入新数据
    const addNote = await db
      .dbModel('note', {//* //标记，初始记事数据类
        haoId: db.db.Schema.Types.ObjectId,
        userId: db.db.Schema.Types.ObjectId,
        content: String, // 内容
        status: Number, // 状态
        addTime: String, // 记事时间
        createTime: Number, // 创建时间
      })
      .create({
        haoId: db.db.Types.ObjectId(req.body.haoId),
        userId: db.db.Types.ObjectId(req.userId),
        content: req.body.content,
        status: 1,
        addTime: req.body.addTime,
        createTime: Date.now(),
      })

    if (!addNote) {
      return Promise.reject(new FoundError('新增失败'))
    }

    // 3返回
    return { _id: addNote._id }
  },

  notes: async req => {
    // 1查询记事
    // 2返回list对象

    // 初始化该库
    db.dbModel('house')

    // 1查询
    const noteList = await db
      .dbModel('note')
      .find({
        userId: db.db.Types.ObjectId(req.userId),
        status: {
          $lte: 2,
          $gte: 1,
        },
      })
      .populate({
        path: 'haoId',
        model: 'house',
        select: 'fang hao haoId addTime',
        match: { status: 1 },
      })
      .sort('status -addTime')
      .exec()

    // 2返回
    return noteList
  },

  waitingList: async req => {
    // 最好需要传入时间
    // 判断类型
    // 查询列表

    const today = new Date().getDate()
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    let seach
    // waiting 1 ，查询新建的及不为1的
    if (req.body.type === 1) {
      seach = {
        $or: [
          {
            type: null,
          },
          {
            'type.type': { $ne: 1 },
          },
        ],
      }
    // waiting 其他，查询不为这个数并有1的
    } else {
      seach = {
        'type.type': {
          $ne: req.body.type,
          $in: [1],
        },
      }
    }

    // 初始化该库
    db.dbModel('month')

    // 1查询列表
    const rentInfo = await db
      .dbModel('rent')
      .find(seach)
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
      .sort('fanghao')
      .lean()
      .exec()

    const isToday = []
    let isTodayCount = 0

    rentInfo.forEach(rent => {
      if (
        req.body.type === 1 &&
        (
          // 这个月交租是今天前
          (
            rent.lease.payDay <= today &&
            new Date(rent.monthId.month).getMonth() === month &&
            new Date(rent.monthId.month).getFullYear() === year
          ) ||
          // 这个月之前的
          (
            new Date(rent.monthId.month).getMonth() < month &&
            new Date(rent.monthId.month).getFullYear() === year
          ) ||
          // 今年前的
          new Date(rent.monthId.month).getFullYear() < year
        )
      ) {
        isTodayCount += rent.calRentResult
        isToday.push(rent)
      } else if (req.body.type === 3) {
        isTodayCount += rent.calRentResult
        isToday.push(rent)
      }
    })

    // 2返回数据
    return {
      // 数据列表
      data: rentInfo,
      // 今天的数据列表
      isToday,
      // 今天的租金统计
      isTodayCountMoney: isTodayCount,
    }
  },

  async waitingListCount(req) {
    const dutyData = await this.waitingList(req)

    return {
      // 数据count
      count: dutyData.data.length,
      // 今天的count
      isTodayCount: dutyData.isToday.length,
      // 今天的租金统计
      isTodayCountMoney: dutyData.isTodayCountMoney,
    }
  },

  okList: async req => {
    // 最好需要传入时间
    // 判断类型
    // 查询列表

    const today = new Date().getDate()
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    // 查询最新月度ID
    const newestMonth = await db
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

    if (!newestMonth) {
      return Promise.reject(new FoundError('暂无最新月度信息'))
    }

    // 判断类型
    const seach = {
      'type.type': { $in: [req.body.type] },
      monthId: db.db.Types.ObjectId(newestMonth._id),
    }

    let countMoney = 0
    const isToday = []

    // 查询统计
    const rentInfo = await db
      .dbModel('rent')
      .find(seach)
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
      .sort('fanghao')
      .lean()
      .exec()

    rentInfo.forEach(rent => {
      if (
        (
          rent.lease.payDay <= today &&
          new Date(rent.monthId.month).getMonth() === month &&
          new Date(rent.monthId.month).getFullYear() === year
        ) ||
        (
          new Date(rent.monthId.month).getMonth() < month &&
          new Date(rent.monthId.month).getFullYear() === year
        ) ||
        new Date(rent.monthId.month).getFullYear() < year
      ) {
        countMoney += rent.calRentResult
        isToday.push(rent)
      }
    })

    return {
      // 数据列表
      data: rentInfo,
      // 今天的数据列表
      isToday,
      // 今天的租金统计
      isTodayCountMoney: countMoney,
      // 月度信息
      month: newestMonth.month,
    }
  },

  async okListCount(req) {
    const dutyData = await this.okList(req)
    const countMoney = dutyData.data
      .reduce((sum, rent) => sum + rent.calRentResult, 0)

    return {
      // 数据count
      count: dutyData.data.length,
      // 数据租金统计
      countMoney,
      // 今天的租金统计
      isTodayCount: dutyData.isToday.length,
      month: dutyData.month,
    }
  },
}
