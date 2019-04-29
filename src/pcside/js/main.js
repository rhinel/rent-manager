// 加载应用层
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'normalize.css'

// 加载组件
import ajax from 'common/js/request'
import ws from 'common/js/websocket'
import plugin from 'common/js/plugin'

// 应用配置加载
import App from '../index'
import stores from './stores'
import routes from './routes'
import routerEach from './routerEach'

// 载入应用层
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.prototype.Ajax = ajax
Vue.prototype.Ws = ws
Vue.prototype.GetTimeFormat = plugin.getTimeFormat
Vue.prototype.GetDateFormat = plugin.getDateFormat

// 全局存储配置
const store = new Vuex.Store(stores)

// 全局路由配置
const router = new VueRouter(routes)
router.beforeEach((to, from, next) => routerEach.beforeEach(router, to, from, next))
router.afterEach(() => routerEach.afterEach(router))

// 页面初始化
// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
})
