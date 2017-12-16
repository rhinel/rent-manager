const seperator1 = '-'
const seperator2 = ':'
const seperator3 = ' '
const redo = (n) => {
  const type = n >= 0 && n <= 9
  return type ? `0${n}` : n
}

const getTimeFormat = (t) => {
  const date = new Date(t)
  const year = date.getFullYear()
  const month = redo(date.getMonth() + 1)
  const day = redo(date.getDate())
  const hour = redo(date.getHours())
  const min = redo(date.getMinutes())
  const secs = redo(date.getSeconds())
  const currentdate = year + seperator1 + month + seperator1 + day +
    seperator3 + hour + seperator2 + min + seperator2 + secs
  return currentdate
}
const getDateFormat = (t) => {
  const date = new Date(t)
  const year = date.getFullYear()
  const month = redo(date.getMonth() + 1)
  const day = redo(date.getDate())
  const currentdate = year + seperator1 + month + seperator1 + day
  return currentdate
}

export default {
  getTimeFormat,
  getDateFormat,
}
