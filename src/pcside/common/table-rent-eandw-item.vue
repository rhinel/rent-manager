<template>
  <div>
    <div v-if="rent[calType]">

      <el-tag>
        {{ rent[calType].fix ? '修' : '计' }}
      </el-tag>

      <span>
        {{
          rent[calType].tnew[type]
            - rent[calType].old[type]
        }}
        *
        {{ getPrice(rent) }}
        =￥
        <span class="main-txt-highline">
          {{ rent[calType][resultType] }}
        </span>
        元
      </span>

      <div class="unimportant">
        {{ getTime(rent[calType].addTime) }}
      </div>

    </div>

    <div v-if="!rent[calType]">
      暂无
    </div>
  </div>
</template>

<script>
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'TableRentEandwItem',
  mixins: [mixinDef],
  props: {
    rent: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: '',
    },
    calType: {
      type: String,
      default: '',
    },
    resultType: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
  },
  methods: {
    // 获取价格档次
    getPrice(data) {
      const key = this.calType
      if (data[key][key].calType === 'single') {
        return data[key][key].singlePrice
      }

      const steps = data[key][key].stepPrice
      const numKey = this.type
      const gap = data[key].tnew[numKey] - data[key].old[numKey]

      let rprice = 0
      steps.forEach((item, i, arr) => {
        if (!item.price) return
        const prevPrices = arr[i - 1] || {}

        if (
          (gap <= 0 && i === 0) ||
          (gap > (prevPrices.step || 0) && gap <= item.step) ||
          ((i + 1) === arr.length && gap > item.step)
        ) {
          rprice = item.price
        }
      })
      return rprice
    },
  },
}
</script>

