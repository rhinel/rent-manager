// 封装socket接口的返回code
// 在原有code对象上增加

// APIbackdata = {
//   code: '请求代码',
//   type: 'socket事件类型',
//   data: 'socket返回的数据',
//   msg: '错误消息',
// }

// code为0时，增加type返回
// 而data对象为socket返回数据的封装
// data = {
//   type: '事件代码', INFO、ERR、DATA等
//   message: '用于显示的message信息 / 错误消息',
//   data: '返回的数据'.
// }

// type为DATA时，返回data数据，应指定

// 包含结束链接
// 封装成异步方法
async function WsSend(ws, type, codeJson) {
  // 增加数据类型字段
  // 第二个参数是类型
  // 如果省略第二个参数，那么第二个参数就是data
  // 是否错误由type = close / data.code > 0控制
  // 此错误类型下断开连接
  // 如果是接口内部级别错误，由接口自行控制

  // 接口未连接则不执行
  // 一般不会，路由过来一般都已连接
  if (ws.readyState === 0) return

  // 处理数据
  let data
  if (typeof type === 'string') {
    data = codeJson || {}
    data.type = type
  } else {
    data = type || {}
  }

  // 发送数据
  // 如果连接有效
  if (ws.readyState === 1) {
    await new Promise((resolve, reject) => {
      ws.send(JSON.stringify(data), err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // 如果类型是close或者存在错误码
  // 服务端主动关闭
  if (
    data.type !== 'close'
    && !data.code
  ) return

  // 连接有效则触发close
  // 否则手动触发，自定义4999
  // 框架封装的方法
  if (ws.readyState === 1) {
    ws.close()
  } else {
    ws.emit('close', 4999)
  }
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
  ws.on('close', async (evtCode, evtMsg) => {
    try {
      await callback(evtCode, evtMsg)
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
