const getTimeFormat = (t)=>{
	let date = new Date(t)
	let seperator1 = '-'
	let seperator2 = ':'
	let strDate = date.getDate()
	strDate >= 0 && strDate <= 9 && (strDate = '0' + strDate)
	let redo = (n)=>{
		return (n >= 1 && n <= 9 && (n = '0' + n)) || n
	}
	let currentdate = date.getFullYear() + seperator1 + redo(date.getMonth() + 1) + seperator1 + strDate + ' ' + redo(date.getHours()) + seperator2 + redo(date.getMinutes()) + seperator2 + redo(date.getSeconds())
		return currentdate
}

module.exports = {
	getTimeFormat: getTimeFormat
}