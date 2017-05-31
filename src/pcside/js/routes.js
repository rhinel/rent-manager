export default {
  routes: [
    // outer层，默认层
    {// 登陆层
      path: '/login',
      component: require('../components/auth/auth-login'),
      alias: ''
    },
    {// inner层
      path: '/inner',
      component: require('../components/auth/auth-inner-index'),
      children: [
        {// dashboard层，默认层
          path: 'dashboard',
          component: require('../components/dashboard/dashboard-index'),
          alias: '',
          children: [
            {// 页面层，默认首页
              path: 'index',
              meta: { name: '主控面板' },
              component: require('../components/dashboard/dashboard-main'),
              alias: ''
            }
          ]
        },
        {// 房屋管理
          path: 'house',
          component: require('../components/house/house-index'),
          children: [
            {
              path: 'index',
              meta: { name: '房屋管理' },
              component: require('../components/house/house-list'),
              alias: ''
            }
          ]
        },
        {// 水费管理
          path: 'water',
          component: require('../components/water/water-index'),
          children: [
            {
              path: 'index',
              meta: { name: '水费管理' },
              component: require('../components/water/water-main'),
              alias: ''
            },
            {
              path: 'history',
              meta: { name: '水费历史' },
              component: require('../components/water/water-history')
            }
          ]
        },
        {// 电费管理
          path: 'electric',
          component: require('../components/electric/electric-index'),
          children: [
            {
              path: 'index',
              meta: { name: '电费管理' },
              component: require('../components/electric/electric-main'),
              alias: ''
            },
            {
              path: 'history',
              meta: { name: '电费历史' },
              component: require('../components/electric/electric-history')
            }
          ]
        },
        {// 租住管理
          path: 'lease',
          component: require('../components/lease/lease-index'),
          children: [
            {
              path: 'index',
              meta: { name: '租住管理' },
              component: require('../components/lease/lease-main'),
              alias: ''
            },
            {
              path: 'history',
              meta: { name: '租住历史' },
              component: require('../components/lease/lease-history')
            }
          ]
        },
        {// 收租管理
          path: 'rent',
          component: require('../components/rent/rent-index'),
          children: [
            {
              path: 'index',
              meta: { name: '收租管理' },
              component: require('../components/rent/rent-main'),
              alias: ''
            },
            {
              path: 'month',
              meta: { name: '月租周期' },
              component: require('../components/rent/rent-month')
            },
            {
              path: 'history',
              meta: { name: '收租历史' },
              component: require('../components/rent/rent-history')
            }
          ]
        },
        {// 系统管理
          path: 'system',
          component: require('../components/system/system-index'),
          children: [
            {
              path: 'index',
              meta: { name: '系统管理' },
              component: require('../components/system/system-main'),
              alias: ''
            }
          ]
        }
      ]
    }
  ]
}
