import Superagent from 'superagent'
import { Message } from 'element-ui'

import app from '@/pcside/js/main'

// 定义负载常量
const rootPath = '/api'

// 方法封装
const request = (_path, _body) => {
  const token = localStorage.getItem('token')
  const path = rootPath + _path
  const body = Object.assign({}, _body)
  if (token) body.token = token

  return Superagent
    .post(path)
    .send(body)
    .catch(err => {
      // 接口错误，报错退出
      Message({
        type: 'error',
        message: `状态：${err.status}，网络/服务器错误`,
        duration: 2000,
      })
      return Promise.reject(new Error('网络/服务器错误'))
    })
    .then(res => {
      const { code, msg, data } = res.body

      // 非正常情况，返回错误
      // 非auth接口，登陆失效或者未登陆，先报错后，清除旧登陆信息，跳转
      if (code === 2001 && !path.includes('/auth')) {
        Message({
          type: 'error',
          message: `编号：${code}，${msg}`,
          duration: 2000,
        })
        localStorage.removeItem('token')
        app.$router.push({
          path: '/login',
          query: { backurl: app.$router.currentRoute.fullPath },
        })
        return Promise.reject(new Error(msg))
      }

      // auth接口，返回msg
      if (code === 2001) {
        return Promise.reject(new Error(msg))
      }

      // 其他接口返回错误代码
      if (code) {
        Message({
          type: 'error',
          message: `编号：${code}，${msg}`,
          duration: 2000,
        })
        return Promise.reject(new Error(code))
      }

      // 正常返回数据
      return data
    })
}

export default request
