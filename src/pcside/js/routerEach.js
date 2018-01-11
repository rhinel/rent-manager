import Ajax from 'common/js/request'
import { Message } from 'element-ui'

const beforeEach = async (router, to, from, next) => {
  // 继承或直接记录目的地
  await router.app.$store.dispatch('menuCheck', to.fullPath)
  const nextConfig = {
    path: '/login',
    query: { backurl: to.fullPath },
  }

  if (to.path.includes('/inner') && !localStorage.getItem('token')) {
    // 不存在token，进入登陆页，中断后继续
    Message.error({
      message: '请重新登陆',
      duration: 2000,
    })
    next(nextConfig)
  } else if (to.path.includes('/inner')) {
    // 校验token，进入登陆页，中断后继续
    await Ajax('/inner/auth/check')
      .then(() => {
        const { defaultGot, defaultGetting } = router.app.$store.state
        if (!defaultGot && !defaultGetting) {
          return router.app.$store.dispatch('getDefaults')
        }
        return ''
      })
      .then(() => next())
      .catch(err => {
        Message.error({
          type: 'error',
          message: `编号：2001，${err.message}`,
          duration: 2000,
        })
        localStorage.removeItem('token')
        router.app.$store.dispatch('clearDefaults')
        next(nextConfig)
      })
  } else if (to.path.includes('/login') && localStorage.getItem('token')) {
    // 登陆页面校验token，进入主页
    await Ajax('/inner/auth/check')
      .then(() => {
        if (to.query.backurl) {
          next(to.query.backurl)
        } else if (from.path.includes('/inner')) {
          next(from.fullPath)
        } else {
          next('/inner')
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        router.app.$store.dispatch('clearDefaults')
        next()
      })
  } else {
    // 非处理outer和无状态登陆页
    next()
  }
}

const afterEach = async router => {
  await router.app.$store.dispatch('menuCheck', '')
  await router.app.$store.dispatch('titleAdd', '')
}

export default {
  beforeEach,
  afterEach,
}
