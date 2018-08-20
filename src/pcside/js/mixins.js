const mixinDef = {
  methods: {
    // 时间格式化
    getDate(t) {
      return t ? this.GetTimeFormat(t) : '--'
    },
    // 时间格式化
    getTime(t) {
      return t ? this.GetTimeFormat(t) : '--'
    },
  },
}

const eandwCalGetPrice = {
  methods: {
    // 获取价格档次
    eandwCalGetPrice(data, type, calType) {
      const key = calType || this.calType
      if (data[key][key].calType === 'single') {
        return data[key][key].singlePrice
      }

      const steps = data[key][key].stepPrice
      const numKey = type || this.type
      const gap = data[key].tnew[numKey] - data[key].old[numKey]

      let rprice = 0
      steps.forEach((item, i, arr) => {
        if (!item.price) return
        const prevPrices = arr[i - 1] || {}

        if (
          (gap <= 0 && i === 0)
          || (gap > (prevPrices.step || 0) && gap <= item.step)
          || ((i + 1) === arr.length && gap > item.step)
        ) {
          rprice = item.price
        }
      })
      return rprice
    },
  },
}

export {
  mixinDef,
  eandwCalGetPrice,
}
