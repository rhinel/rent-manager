export default {
  strict: process.env.NODE_ENV !== 'production',
  // 数据
  state: {
    menuing: '',
    menuCheck: '',
    titleAdd: '',

    default: {
      payTypeVal: ['微信', '支付宝', '银行转账', '现金', '房东自收', '其他'],
      typesVal: ['', '已交', '给单', '房东'],
      menu: [
        {
          index: '/inner/dashboard/index',
          name: '主控面板',
          check: 'inner/dashboard/',
          icon: 'el-icon-tickets',
        },
        {
          index: '/inner/house/index',
          name: '房屋管理',
          check: 'inner/house/',
          icon: 'el-icon-tickets',
        },
        {
          index: '/inner/lease/index',
          name: '租住管理',
          check: 'inner/lease/',
          icon: 'el-icon-tickets',
        },
        {
          index: '/inner/water/index',
          name: '水费管理',
          check: 'inner/water/',
          icon: 'el-icon-tickets',
        },
        {
          index: '/inner/electric/index',
          name: '电费管理',
          check: 'inner/electric/',
          icon: 'el-icon-tickets',
        },
        {
          index: '/inner/rent/index',
          name: '收租管理',
          check: 'inner/rent/',
          icon: 'el-icon-tickets',
        },
        {
          index: '/inner/system/index',
          name: '系统设置',
          check: 'inner/system/',
          icon: 'el-icon-tickets',
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
