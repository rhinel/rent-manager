const serviceAuth = require('./services-auth')
const serviceDashb = require('./services-dashboard')
const serviceRent = require('./services-rent')
const serviceMonth = require('./services-month')
const serviceHouse = require('./services-house')
const serviceWater = require('./services-water')
const serviceElect = require('./services-electric')
const serviceGas = require('./services-gas')
const serviceLease = require('./services-lease')
const code = require('./config-codes')

// res.json([req.params, req.query, req.body])
// res.json([req.params==url, req.query==get, req.body==post])
// 统一处理所有返回

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
      .then(next)
      .catch(err => res.json(code(req, 2001, err)))
  }
}

// inner类，失败则跳过
const inner = (req, res, next) => {
  if (req.params.class === 'auth') {
    if (req.params.function === 'sysInfo') {
      serviceAuth
        .getSysInfo(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 1004, err)))
    } else if (req.params.function === 'updateSysInfo') {
      serviceAuth
        .updateSysInfo(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 1005, err)))
    } else if (req.params.function === 'check') {
      res.json(code(req, 0))
    } else {
      next()
    }
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
      serviceWater
        .waterAdd(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3021, err)))
    } else if (req.params.function === 'mainList') {
      serviceWater
        .waterMainList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3022, err)))
    } else if (req.params.function === 'cal') {
      serviceWater
        .watercalWater(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3023, err)))
    } else if (req.params.function === 'list') {
      serviceWater
        .waterList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3024, err)))
    } else if (req.params.function === 'calList') {
      serviceWater
        .waterCalList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3025, err)))
    } else if (req.params.function === 'del') {
      serviceWater
        .waterDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3026, err)))
    } else if (req.params.function === 'delCal') {
      serviceWater
        .waterCalDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3027, err)))
    } else if (req.params.function === 'findByDate') {
      serviceWater
        .waterFindByDate(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3028, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'electric') {
    // 添加电表数接口
    if (req.params.function === 'add') {
      serviceElect.electricAdd(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3041, err)))
    } else if (req.params.function === 'mainList') {
      serviceElect
        .electricMainList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3042, err)))
    } else if (req.params.function === 'cal') {
      serviceElect
        .electriccalElectric(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3043, err)))
    } else if (req.params.function === 'list') {
      serviceElect
        .electricList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3044, err)))
    } else if (req.params.function === 'calList') {
      serviceElect
        .electricCalList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3045, err)))
    } else if (req.params.function === 'del') {
      serviceElect
        .electricDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3046, err)))
    } else if (req.params.function === 'delCal') {
      serviceElect
        .electricCalDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3047, err)))
    } else if (req.params.function === 'findByDate') {
      serviceElect
        .electricFindByDate(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3048, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'gas') {
    // 添加燃气表数接口
    if (req.params.function === 'add') {
      serviceGas
        .gasAdd(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3021, err)))
    } else if (req.params.function === 'mainList') {
      serviceGas
        .gasMainList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3022, err)))
    } else if (req.params.function === 'cal') {
      serviceGas
        .gascalGas(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3023, err)))
    } else if (req.params.function === 'list') {
      serviceGas
        .gasList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3024, err)))
    } else if (req.params.function === 'calList') {
      serviceGas
        .gasCalList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3025, err)))
    } else if (req.params.function === 'del') {
      serviceGas
        .gasDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3026, err)))
    } else if (req.params.function === 'delCal') {
      serviceGas
        .gasCalDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3027, err)))
    } else if (req.params.function === 'findByDate') {
      serviceGas
        .gasFindByDate(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3028, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'lease') {
    // 租住管理接口
    if (req.params.function === 'mainList') {
      serviceLease
        .leaseMainList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3031, err)))
    } else if (req.params.function === 'in') {
      serviceLease
        .leaseIn(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3032, err)))
    } else if (req.params.function === 'out') {
      serviceLease
        .leaseOut(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3033, err)))
    } else if (req.params.function === 'list') {
      serviceLease
        .leaseList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3034, err)))
    } else if (req.params.function === 'del') {
      serviceLease.leaseDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3035, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'month') {
    // 月度周期管理
    if (req.params.function === 'add') {
      serviceMonth
        .monthAdd(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3051, err)))
    } else if (req.params.function === 'list') {
      serviceMonth
        .monthList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3052, err)))
    } else if (req.params.function === 'del') {
      serviceMonth
        .monthDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3053, err)))
    } else if (req.params.function === 'find') {
      serviceMonth
        .monthFind(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3054, err)))
    } else if (req.params.function === 'newest') {
      serviceMonth
        .newest(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3055, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'rent') {
    // 计租管理
    if (req.params.function === 'add') {
      serviceRent
        .rentAdd(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3062, err)))
    } else if (req.params.function === 'listByMonth') {
      serviceRent
        .rentListByMonth(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3061, err)))
    } else if (req.params.function === 'type') {
      serviceRent
        .rentType(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3063, err)))
    } else if (req.params.function === 'del') {
      serviceRent
        .rentDel(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3064, err)))
    } else if (req.params.function === 'listByHao') {
      serviceRent
        .rentListByHao(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3065, err)))
    } else if (req.params.function === 'listByLandord') {
      serviceRent
        .rentListByLandord(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3066, err)))
    } else if (req.params.function === 'listByNewestMonth') {
      serviceRent
        .listByNewestMonth(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3067, err)))
    } else if (req.params.function === 'listByHaoAndMonth') {
      serviceRent
        .listByHaoAndMonth(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3068, err)))
    } else if (req.params.function === 'listByLandordTemp') {
      serviceRent.rentListByLandordTemp(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3069, err)))
    } else if (req.params.function === 'one') {
      serviceRent
        .one(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 30610, err)))
    } else if (req.params.function === 'checkBill') {
      serviceRent
        .rentCheckBill(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 30611, err)))
    } else if (req.params.function === 'dailyRemark') {
      serviceRent
        .dailyRemark(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 30612, err)))
    } else if (req.params.function === 'dailyRemarkList') {
      serviceRent
        .dailyRemarkList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 30613, err)))
    } else {
      next()
    }
  } else if (req.params.class === 'dash') {
    // 主控面板
    if (req.params.function === 'count') {
      serviceDashb
        .count(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3071, err)))
    } else if (req.params.function === 'addNote') {
      serviceDashb
        .addNote(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3072, err)))
    } else if (req.params.function === 'notes') {
      serviceDashb
        .notes(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3073, err)))
    } else if (req.params.function === 'waitingList') {
      serviceDashb
        .waitingList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3074, err)))
    } else if (req.params.function === 'waitingListCount') {
      serviceDashb
        .waitingListCount(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3075, err)))
    } else if (req.params.function === 'okList') {
      serviceDashb
        .okList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3077, err)))
    } else if (req.params.function === 'okListCount') {
      serviceDashb
        .okListCount(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3076, err)))
    } else if (req.params.function === 'leaseEmptyList') {
      serviceDashb
        .leaseEmptyList(req, res)
        .then(data => res.json(code(req, 0, data)))
        .catch(err => res.json(code(req, 3078, err)))
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
