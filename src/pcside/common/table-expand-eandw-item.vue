<template>
  <div>
    <div v-if="rent[calType]">

      {{
        rent[calType].tnew[type]
          - rent[calType].old[type]
      }}{{ unit }}

      <el-popover
        placement="top"
        trigger="hover">

        <div>本次抄表数：{{ rent[calType].tnew[type] }}{{ unit }}</div>
        <div>抄表时间：{{ getTime(rent[calType].tnew.addTime) }}</div>
        <div>上次表底数：{{ rent[calType].old[type] }}{{ unit }}</div>
        <div>表底时间：{{ getTime(rent[calType].old.addTime) }}</div>

        <el-tag
          class="show-tag"
          slot="reference">
          计数
        </el-tag>

      </el-popover>

      ￥{{ getPrice(rent) }}元/{{ unit }}

    </div>
    <div v-if="!rent[calType]">
      暂无
    </div>
  </div>
</template>

<script>
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'TableExpandEandwItem',
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

