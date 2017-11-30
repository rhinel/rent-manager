const serviceAuth = require('./services-auth')
const service = require('./services')
const serviceDashb = require('./services-dashboard')
const serviceRent = require('./services-rent')
const serviceMonth = require('./services-month')
const serviceHouse = require('./services-house')
const code = require('./config-codes')

// res.json([req.params, req.query, req.body])
// res.json([req.params==url, req.query==get, req.body==post])

// outer类，失败则跳过
const outer = (req, res, next) => {
  // 登陆类
  if (req.params.class === 'log') {
    // 登录接口
    if (req.params.function === 'login') {
      serviceAuth
        .login(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 1001, err)))
    } else if (req.params.function === 'logout') {
      serviceAuth
        .logout(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 1002, err)))
    // 首页背景图
    } else if (req.params.function === 'bingBg') {
      serviceAuth
        .bingBg(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 1003, err)))
    } else {
      next()
    }
  } else {
    next()
  }
}

// auth类，成功则跳过
const auth = (req, res, next) => {
  // 接口校验
  const token = req.body.token || req.query.token || ''
  if (!token) {
    res.json(code(req, 2001))
  } else {
    serviceAuth
      .auth(req, res)
      .then(() => next())
      .catch(err => res.json(code(req, 2001, err)))
  }
}

// inner类，失败则跳过
const inner = (req, res, next) => {
  if (req.params.class === 'auth') {
    res.json(code(req, 0))
  } else if (req.params.class === 'house') {
    // 添加房屋接口
    if (req.params.function === 'add') {
      serviceHouse
        .houseAdd(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3011, err)))
    } else if (req.params.function === 'list') {
      serviceHouse
        .houseList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3012, err)))
    } else if (req.params.function === 'del') {
      serviceHouse.houseDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3013, err)))
    } else if (req.params.function === 'find') {
      serviceHouse
        .houseFind(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3014, err)))
    } else if (req.params.function === 'listWithCal') {
      serviceHouse
        .listWithCal(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3015, err)))
    } else if (req.params.function === 'detByHao') {
      serviceHouse
        .detByHao(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3016, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'water') {
    // 添加水表数接口
    if (req.params.function === 'add') {
      service.waterAdd(req, res, (data) => {
        res.json(code(3021, data))
      })
    } else if (req.params.function === 'mainList') {
      service.waterMainList(req, res, (data) => {
        res.json(code(3022, data))
      })
    } else if (req.params.function === 'cal') {
      service.watercalWater(req, res, (data) => {
        res.json(code(3023, data))
      })
    } else if (req.params.function === 'list') {
      service.waterList(req, res, (data) => {
        res.json(code(3024, data))
      })
    } else if (req.params.function === 'calList') {
      service.waterCalList(req, res, (data) => {
        res.json(code(3025, data))
      })
    } else if (req.params.function === 'del') {
      service.waterDel(req, res, (data) => {
        res.json(code(3026, data))
      })
    } else if (req.params.function === 'delCal') {
      service.waterCalDel(req, res, (data) => {
        res.json(code(3027, data))
      })
    } else if (req.params.function === 'findByDate') {
      service.waterFindByDate(req, res, (data) => {
        res.json(code(3028, data))
      })
    } else {
      next()
    }
  } else if (req.params.class === 'electric') {
    // 添加电表数接口
    if (req.params.function === 'add') {
      service.electricAdd(req, res, (data) => {
        res.json(code(3041, data))
      })
    } else if (req.params.function === 'mainList') {
      service.electricMainList(req, res, (data) => {
        res.json(code(3042, data))
      })
    } else if (req.params.function === 'cal') {
      service.electriccalElectric(req, res, (data) => {
        res.json(code(3043, data))
      })
    } else if (req.params.function === 'list') {
      service.electricList(req, res, (data) => {
        res.json(code(3044, data))
      })
    } else if (req.params.function === 'calList') {
      service.electricCalList(req, res, (data) => {
        res.json(code(3045, data))
      })
    } else if (req.params.function === 'del') {
      service.electricDel(req, res, (data) => {
        res.json(code(3046, data))
      })
    } else if (req.params.function === 'delCal') {
      service.electricCalDel(req, res, (data) => {
        res.json(code(3047, data))
      })
    } else if (req.params.function === 'findByDate') {
      service.electricFindByDate(req, res, (data) => {
        res.json(code(3048, data))
      })
    } else {
      next()
    }
  } else if (req.params.class === 'lease') {
    // 租住管理接口
    if (req.params.function === 'mainList') {
      service.leaseMainList(req, res, (data) => {
        res.json(code(3031, data))
      })
    } else if (req.params.function === 'in') {
      service.leaseIn(req, res, (data) => {
        res.json(code(3032, data))
      })
    } else if (req.params.function === 'out') {
      service.leaseOut(req, res, (data) => {
        res.json(code(3033, data))
      })
    } else if (req.params.function === 'list') {
      service.leaseList(req, res, (data) => {
        res.json(code(3034, data))
      })
    } else if (req.params.function === 'del') {
      service.leaseDel(req, res, (data) => {
        res.json(code(3035, data))
      })
    } else {
      next()
    }
  } else if (req.params.class === 'month') {
    // 月度周期管理
    if (req.params.function === 'add') {
      service.monthAdd(req, res, (data) => {
        res.json(code(3051, data))
      })
    } else if (req.params.function === 'list') {
      service.monthList(req, res, (data) => {
        res.json(code(3052, data))
      })
    } else if (req.params.function === 'del') {
      service.monthDel(req, res, (data) => {
        res.json(code(3053, data))
      })
    } else if (req.params.function === 'find') {
      service.monthFind(req, res, (data) => {
        res.json(code(3054, data))
      })
    } else if (req.params.function === 'newest') {
      serviceMonth.newest(req, res, (data) => {
        res.json(code(3055, data))
      })
    } else {
      next()
    }
  } else if (req.params.class === 'rent') {
    // 计租管理
    if (req.params.function === 'add') {
      service.rentAdd(req, res, (data) => {
        res.json(code(3062, data))
      })
    } else if (req.params.function === 'listByMonth') {
      service.rentListByMonth(req, res, (data) => {
        res.json(code(3061, data))
      })
    } else if (req.params.function === 'type') {
      service.rentType(req, res, (data) => {
        res.json(code(3063, data))
      })
    } else if (req.params.function === 'del') {
      service.rentDel(req, res, (data) => {
        res.json(code(3064, data))
      })
    } else if (req.params.function === 'listByHao') {
      service.rentListByHao(req, res, (data) => {
        res.json(code(3065, data))
      })
    } else if (req.params.function === 'listByLandord') {
      service.rentListByLandord(req, res, (data) => {
        res.json(code(3066, data))
      })
    } else if (req.params.function === 'listByNewestMonth') {
      serviceRent.listByNewestMonth(req, res, (data) => {
        res.json(code(3067, data))
      })
    } else if (req.params.function === 'listByHaoAndMonth') {
      serviceRent.listByHaoAndMonth(req, res, (data) => {
        res.json(code(3068, data))
      })
    } else if (req.params.function === 'listByLandordTemp') {
      service.rentListByLandordTemp(req, res, (data) => {
        res.json(code(3069, data))
      })
    } else if (req.params.function === 'one') {
      serviceRent.one(req, res, (data) => {
        res.json(code(30610, data))
      })
    } else {
      next()
    }
  } else if (req.params.class === 'dash') {
    // 主控面板
    if (req.params.function === 'count') {
      serviceDashb.count(req, res, (data) => {
        res.json(code(3071, data))
      })
    } else if (req.params.function === 'addNote') {
      serviceDashb.addNote(req, res, (data) => {
        res.json(code(3072, data))
      })
    } else if (req.params.function === 'notes') {
      serviceDashb.notes(req, res, (data) => {
        res.json(code(3073, data))
      })
    } else if (req.params.function === 'waitingList') {
      serviceDashb.waitingList(req, res, (data) => {
        res.json(code(3074, data))
      })
    } else if (req.params.function === 'waitingListCount') {
      serviceDashb.waitingListCount(req, res, (data) => {
        res.json(code(3075, data))
      })
    } else if (req.params.function === 'okList') {
      serviceDashb.okList(req, res, (data) => {
        res.json(code(3077, data))
      })
    } else if (req.params.function === 'okListCount') {
      serviceDashb.okListCount(req, res, (data) => {
        res.json(code(3076, data))
      })
    } else if (req.params.function === 'leaseEmptyList') {
      serviceDashb.leaseEmptyList(req, res, (data) => {
        res.json(code(3078, data))
      })
    } else {
      next()
    }
  } else {
    next()
  }
}

// default类，最后返回
const def = (req, res) => res.json(code(req, 9999))

module.exports = {
  outer,
  auth,
  inner,
  def,
}
