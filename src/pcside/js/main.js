//加载应用层
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'normalize.css'
import 'element-ui/lib/theme-default/index.css'

//应用配置加载
import App from '../index'
import stores from './stores'
import routes from './routes'
import routerEach from './routerEach'
import ajax from 'common/js/request'
import plugin from 'common/js/plugin'

//载入应用层
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.prototype.Ajax = ajax
Vue.prototype.GetTimeFormat = plugin.getTimeFormat
Vue.prototype.GetDateFormat = plugin.getDateFormat

//全局存储配置
const store = new Vuex.Store(stores)

//路由配置
const router = new VueRouter(routes)
router.beforeEach((to, from, next)=>{
	routerEach.beforeEach(to, from, next, app)
})
router.afterEach((to, from)=>{
	routerEach.afterEach(to, from, app)
})

//页面初始化
const app = new Vue({
	el: '#app',
	router,
	store,
	render: h => h(App)
})