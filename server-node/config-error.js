function FoundError(message) {
  this.name = 'FoundError'
  this.message = message || ''
  this.stack = (new Error()).stack
}

FoundError.prototype = Object.create(Error.prototype)
FoundError.prototype.constructor = FoundError

module.exports = FoundError
