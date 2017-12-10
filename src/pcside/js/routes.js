const AuthLogin = () => import('../components/auth/auth-login')
const AuthInnerIndex = () => import('../components/auth/auth-inner-index')

const Dashboard = () => import('../components/dashboard/dashboard-index')
const DashboardIndex = () => import('../components/dashboard/dashboard-main')

const House = () => import('../components/house/house-index')
const HouseList = () => import('../components/house/house-list')

// const Water = () => import('../components/water/water-index')
// const WaterIndex = () => import('../components/water/water-main')
// const WaterHistory = () => import('../components/water/water-history')

// const Electric = () => import('../components/electric/electric-index')
// const ElectricIndex = () => import('../components/electric/electric-main')
// const ElectricHistory = () => import('../components/electric/electric-history')

const Lease = () => import('../components/lease/lease-index')
const LeaseIndex = () => import('../components/lease/lease-main')
const LeaseHistory = () => import('../components/lease/lease-history')

// const Rent = () => import('../components/rent/rent-index')
// const RentMonth = () => import('../components/rent/rent-month')
// const RentIndex = () => import('../components/rent/rent-main')
// const RentHistory = () => import('../components/rent/rent-history')

// const System = () => import('../components/system/system-index')
// const SystemIndex = () => import('../components/system/system-main')

export default {
  routes: [
    // outer层，默认层
    {// 登陆层
      path: '/login',
      component: AuthLogin,
      alias: '',
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
              alias: '',
            },
          ],
        },
        {// 房屋管理
          path: 'house',
          component: House,
          children: [
            {
              path: 'index',
              meta: { name: '房屋管理' },
              component: HouseList,
              alias: '',
            },
          ],
        },
        // {// 水费管理
        //   path: 'water',
        //   component: Water,
        //   children: [
        //     {
        //       path: 'index',
        //       meta: { name: '水费管理' },
        //       component: WaterIndex,
        //       alias: '',
        //     },
        //     {
        //       path: 'history',
        //       meta: { name: '水费历史' },
        //       component: WaterHistory,
        //     },
        //   ],
        // },
        // {// 电费管理
        //   path: 'electric',
        //   component: Electric,
        //   children: [
        //     {
        //       path: 'index',
        //       meta: { name: '电费管理' },
        //       component: ElectricIndex,
        //       alias: '',
        //     },
        //     {
        //       path: 'history',
        //       meta: { name: '电费历史' },
        //       component: ElectricHistory,
        //     },
        //   ],
        // },
        {// 租住管理
          path: 'lease',
          component: Lease,
          children: [
            {
              path: 'index',
              meta: { name: '租住管理' },
              component: LeaseIndex,
              alias: '',
            },
            {
              path: 'history',
              meta: { name: '租住历史' },
              component: LeaseHistory,
            },
          ],
        },
        // {// 收租管理
        //   path: 'rent',
        //   component: Rent,
        //   children: [
        //     {
        //       path: 'index',
        //       meta: { name: '收租管理' },
        //       component: RentIndex,
        //       alias: '',
        //     },
        //     {
        //       path: 'month',
        //       meta: { name: '月租周期' },
        //       component: RentMonth,
        //     },
        //     {
        //       path: 'history',
        //       meta: { name: '收租历史' },
        //       component: RentHistory,
        //     },
        //   ],
        // },
        // {// 系统管理
        //   path: 'system',
        //   component: System,
        //   children: [
        //     {
        //       path: 'index',
        //       meta: { name: '系统管理' },
        //       component: SystemIndex,
        //       alias: '',
        //     },
        //   ],
        // },
      ],
    },
  ],
}
