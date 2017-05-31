import Ajax from 'common/js/request'
import { Message } from 'element-ui'

const beforeEach = (to, from, next, vue) => {
  // 继承或直接记录目的地
  vue && vue.$store.dispatch('menuCheck', to.fullPath)
  let nextConfig = {
    path: '/login',
    query: {backurl: to.fullPath}
  }

  if (to.path.indexOf('/inner') > -1 && !localStorage.getItem('token')) {
    // 不存在token，进入登陆页，中断后继续
    Message.error({
      message: '请重新登陆',
      duration: 2000
    })
    next(nextConfig)
  } else if (to.path.indexOf('/inner') > -1) {
    // 校验token，进入登陆页，中断后继续
    Ajax('/inner/auth/check', {}, (res) => {
      next()
    }, (res) => {
      Message.error({
        message: '编号：' + res.body.code + '，' + res.body.msg,
        duration: 2000
      })
      localStorage.removeItem('token')
      next(nextConfig)
    })
  } else if (to.path.indexOf('/login') > -1 && localStorage.getItem('token')) {
    // 登陆页面校验token，进入主页
    Ajax('/inner/auth/check', {}, (res) => {
      if (to.query.backurl) {
        next(to.query.backurl)
      } else if (from.path.indexOf('/inner') > -1) {
        next(from.fullPath)
      } else {
        next('/inner')
      }
    }, (res) => {
      localStorage.removeItem('token')
      next()
    })
  } else {
    // 非处理outer和无状态登陆页
    next()
  }
}

const afterEach = function (to, from, vue) {
  vue && vue.$store.dispatch('menuCheck', '')
  vue && vue.$store.dispatch('titleAdd', '')
}

export default {
  beforeEach: beforeEach,
  afterEach: afterEach
}
