// 定义负载常量
const rootPath = '/wsapi'

const websocket = (_path, callback) => {
  let path = rootPath + _path

  const token = localStorage.getItem('token')
  if (token) path += `?token=${token}`

  const { host, hostname, protocol } = window.location

  if (protocol === 'http:') {
    path = `ws://${hostname}${path}`
  } else {
    path = `wss://${host}${path}`
  }

  // 此处可进行深度封装
  // 比如：
  // 统一的格式处理
  // 统一的开启关闭处理
  // 标识回调队列

  if (callback) callback()

  return new WebSocket(path)
}

export default websocket
