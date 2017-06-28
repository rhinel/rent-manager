let AuthLogin = resolve => require(['../components/auth/auth-login'], resolve)
let AuthInnerIndex = resolve => require(['../components/auth/auth-inner-index'], resolve)

let Dashboard = resolve => require(['../components/dashboard/dashboard-index'], resolve)
let DashboardIndex = resolve => require(['../components/dashboard/dashboard-main'], resolve)

let House = resolve => require(['../components/house/house-index'], resolve)
let HouseList = resolve => require(['../components/house/house-list'], resolve)

let Water = resolve => require(['../components/water/water-index'], resolve)
let WaterIndex = resolve => require(['../components/water/water-main'], resolve)
let WaterHistory = resolve => require(['../components/water/water-history'], resolve)

let Electric = resolve => require(['../components/electric/electric-index'], resolve)
let ElectricIndex = resolve => require(['../components/electric/electric-main'], resolve)
let ElectricHistory = resolve => require(['../components/electric/electric-history'], resolve)

let Lease = resolve => require(['../components/lease/lease-index'], resolve)
let LeaseIndex = resolve => require(['../components/lease/lease-main'], resolve)
let LeaseHistory = resolve => require(['../components/lease/lease-history'], resolve)

let Rent = resolve => require(['../components/rent/rent-index'], resolve)
let RentMonth = resolve => require(['../components/rent/rent-month'], resolve)
let RentIndex = resolve => require(['../components/rent/rent-main'], resolve)
let RentHistory = resolve => require(['../components/rent/rent-history'], resolve)

let System = resolve => require(['../components/system/system-index'], resolve)
let SystemIndex = resolve => require(['../components/system/system-main'], resolve)

export default {
  routes: [
    // outer层，默认层
    {// 登陆层
      path: '/login',
      component: AuthLogin,
      alias: ''
    },
    {// inner层
      path: '/inner',
      component: AuthInnerIndex,
      children: [
        {// dashboard层，默认层
          path: 'dashboard',
          component: Dashboard,
          alias: '',
          children: [
            {// 页面层，默认首页
              path: 'index',
              meta: { name: '主控面板' },
              component: DashboardIndex,
              alias: ''
            }
          ]
        },
        {// 房屋管理
          path: 'house',
          component: House,
          children: [
            {
              path: 'index',
              meta: { name: '房屋管理' },
              component: HouseList,
              alias: ''
            }
          ]
        },
        {// 水费管理
          path: 'water',
          component: Water,
          children: [
            {
              path: 'index',
              meta: { name: '水费管理' },
              component: WaterIndex,
              alias: ''
            },
            {
              path: 'history',
              meta: { name: '水费历史' },
              component: WaterHistory
            }
          ]
        },
        {// 电费管理
          path: 'electric',
          component: Electric,
          children: [
            {
              path: 'index',
              meta: { name: '电费管理' },
              component: ElectricIndex,
              alias: ''
            },
            {
              path: 'history',
              meta: { name: '电费历史' },
              component: ElectricHistory
            }
          ]
        },
        {// 租住管理
          path: 'lease',
          component: Lease,
          children: [
            {
              path: 'index',
              meta: { name: '租住管理' },
              component: LeaseIndex,
              alias: ''
            },
            {
              path: 'history',
              meta: { name: '租住历史' },
              component: LeaseHistory
            }
          ]
        },
        {// 收租管理
          path: 'rent',
          component: Rent,
          children: [
            {
              path: 'index',
              meta: { name: '收租管理' },
              component: RentIndex,
              alias: ''
            },
            {
              path: 'month',
              meta: { name: '月租周期' },
              component: RentMonth
            },
            {
              path: 'history',
              meta: { name: '收租历史' },
              component: RentHistory
            }
          ]
        },
        {// 系统管理
          path: 'system',
          component: System,
          children: [
            {
              path: 'index',
              meta: { name: '系统管理' },
              component: SystemIndex,
              alias: ''
            }
          ]
        }
      ]
    }
  ]
}
