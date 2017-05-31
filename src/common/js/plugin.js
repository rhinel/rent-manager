const getTimeFormat = (t) => {
  let date = new Date(t)
  let seperator1 = '-'
  let seperator2 = ':'
  let redo = (n) => {
    return (n >= 0 && n <= 9 && (n = '0' + n)) || n
  }
  let currentdate = date.getFullYear() + seperator1 + redo(date.getMonth() + 1) + seperator1 + redo(date.getDate()) + ' ' + redo(date.getHours()) + seperator2 + redo(date.getMinutes()) + seperator2 + redo(date.getSeconds())
  return currentdate
}
const getDateFormat = (t) => {
  let date = new Date(t)
  let seperator1 = '-'
  let redo = (n) => {
    return (n >= 0 && n <= 9 && (n = '0' + n)) || n
  }
  let currentdate = date.getFullYear() + seperator1 + redo(date.getMonth() + 1) + seperator1 + redo(date.getDate())
  return currentdate
}

export default {
  getTimeFormat: getTimeFormat,
  getDateFormat: getDateFormat
}
