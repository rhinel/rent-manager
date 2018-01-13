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

      ￥{{ eandwCalGetPrice(rent) }}元/{{ unit }}

    </div>
    <div v-if="!rent[calType]">
      暂无
    </div>
  </div>
</template>

<script>
import { mixinDef, eandwCalGetPrice } from 'pcside/js/mixins'

export default {
  name: 'TableExpandEandwItem',
  mixins: [mixinDef, eandwCalGetPrice],
  props: {
    rent: {
      type: Object,
      default: () => ({}),
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
}
</script>

