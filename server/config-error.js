// 封装自定义错误类型
// 继承基础错误类型
// 用来识别service主动抛出的错误
function FoundError(message) {
  this.name = 'FoundError'
  this.message = message || ''
  this.stack = (new Error()).stack
}

FoundError.prototype = Object.create(Error.prototype)
FoundError.prototype.constructor = FoundError

module.exports = FoundError
