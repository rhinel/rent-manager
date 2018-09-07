// 封装socket接口的返回code
// 并结束链接
function WsCallback(ws, codeJson) {
  ws.send(JSON.stringify(codeJson))
  ws.close()
}

module.exports = WsCallback
