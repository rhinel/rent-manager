// 封装socket接口的返回code
// 并结束链接
function WsCallback(ws, type, codeJson) {
  // 增加数据类型字段
  // 第二个参数是类型
  // 如果省略第二个参数，那么第二个参数就是data
  let data
  if (typeof type === 'string') {
    data = codeJson || {}
    data.type = type
  } else {
    data = type
  }

  // 发送数据
  ws.send(JSON.stringify(data))

  // 如果类型是close或者存在错误码
  // 服务端主动关闭
  if (
    data.type === 'close'
    || data.code
  ) ws.close()
}

module.exports = WsCallback
