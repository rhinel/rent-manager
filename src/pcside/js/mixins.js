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

export {
  mixinDef,
}

export default {
  mixinDef,
}
