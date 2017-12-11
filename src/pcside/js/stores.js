export default {
  strict: process.env.NODE_ENV !== 'production',
  // 数据
  state: {
    menuing: '',
    menuCheck: '',
    titleAdd: '',

    config: {
      // 定义坊号，前台写死，后台分类统计用做判断
      houseFang: ['6坊65栋', '8坊68栋', '公司楼'],
      // 收租类型，写死类型，后台根据0-5ID
      payTypeVal: ['微信', '支付宝', '银行转账', '现金', '房东自收', '其他'],
      // 交租状态，写死类型，后台根据1-3ID
      typesVal: ['', '已交', '给单', '房东'],
      // 入住时的默认计费数据，后台均以这为准
      // 默认水费计费规则
      defaultCalWaterPrice: {
        minPrice: 6,
        calType: 'single',
        singlePrice: 8,
        stepPrice: [{
          step: 0,
          price: 0,
        }],
      },
      // 默认电费计费规则
      defaultCalElePrice: {
        minPrice: 30,
        calType: 'step',
        singlePrice: 1,
        stepPrice: [{
          step: 100,
          price: 1,
        },
        {
          step: 200,
          price: 1.2,
        },
        {
          step: 201,
          price: 1.4,
        }],
      },
      // 默认阶梯步长
      defaultStep: {
        step: 0,
        price: 0,
      },
      // 菜单
      menu: [
        {
          index: '/inner/dashboard/index',
          name: '主控面板',
          check: 'inner/dashboard/',
          icon: 'el-icon-menu',
        },
        {
          index: '/inner/house/index',
          name: '房屋管理',
          check: 'inner/house/',
          icon: 'el-icon-menu',
        },
        {
          index: '/inner/lease/index',
          name: '租住管理',
          check: 'inner/lease/',
          icon: 'el-icon-menu',
        },
        {
          index: '/inner/water/index',
          name: '水费管理',
          check: 'inner/water/',
          icon: 'el-icon-menu',
        },
        {
          index: '/inner/electric/index',
          name: '电费管理',
          check: 'inner/electric/',
          icon: 'el-icon-menu',
        },
        {
          index: '/inner/rent/index',
          name: '收租管理',
          check: 'inner/rent/',
          icon: 'el-icon-menu',
        },
        {
          index: '/inner/system/index',
          name: '系统设置',
          check: 'inner/system/',
          icon: 'el-icon-setting',
        },
      ],
    },
  },
  // 处理
  getters: {

  },
  // 提交
  mutations: {
    updateMenu(state, menuing) {
      state.menuing = menuing
    },
    menuCheck(state, path) {
      state.menuCheck = path
    },
    titleAdd(state, add) {
      state.titleAdd = add
    },
  },
  // 行为
  actions: {
    updateMenu(context, menuing) {
      context.commit('updateMenu', menuing)
    },
    menuCheck(context, path) {
      context.commit('menuCheck', path)
    },
    titleAdd(context, add) {
      context.commit('titleAdd', add)
    },
  },
}
