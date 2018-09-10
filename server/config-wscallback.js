// 封装socket接口的返回code
// 并结束链接
// 封装成异步方法
async function WsSend(ws, type, codeJson) {
  // 增加数据类型字段
  // 第二个参数是类型
  // 如果省略第二个参数，那么第二个参数就是data
  // 是否错误由type = close / data.code > 0控制
  // 此错误类型下断开连接
  // 如果是接口内部级别错误，由接口自行控制

  // 接口已经关闭则不执行
  if (ws.readyState === 3) return

  // 处理数据
  let data
  if (typeof type === 'string') {
    data = codeJson || {}
    data.type = type
  } else {
    data = type || {}
  }

  // 发送数据
  await new Promise((resolve, reject) => {
    ws.send(JSON.stringify(data), err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

  // 如果类型是close或者存在错误码
  // 服务端主动关闭
  if (
    data.type === 'close'
    || data.code
  ) ws.close()
}

function WsOnMessage(ws, callback, onErr) {
  // 封装每一个事件监听，用于错误处理
  ws.on('message', async (message) => {
    try {
      await callback(message)
    } catch (err) {
      if (onErr) onErr(err)
    }
  })
}

function WsOnClose(ws, callback, onErr) {
  // 封装每一个事件监听，用于错误处理
  ws.on('close', async () => {
    try {
      await callback()
    } catch (err) {
      if (onErr) onErr(err)
    }
  })
}

module.exports = {
  WsSend,
  WsOnMessage,
  WsOnClose,
}
