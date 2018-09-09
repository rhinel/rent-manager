// 定义负载常量
const rootPath = '/wsapi'

const websocket = (_path) => {
  let path = rootPath + _path

  const token = localStorage.getItem('token')
  if (token) path += `?token=${token}`

  const { host, hostname, protocol } = window.location

  if (protocol === 'http:') {
    path = `ws://${hostname}${path}`
  } else {
    path = `wss://${host}${path}`
  }

  return new WebSocket(path)
}

export default websocket
