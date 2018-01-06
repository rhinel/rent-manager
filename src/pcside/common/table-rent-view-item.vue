<template>
  <div>
    <div>
      <el-tag>{{ rent.fix ? '修' : '计' }}</el-tag>
      <span v-if="!highline">
        ￥{{ rent.calRentResult || 0 }}元
      </span>
      <span v-else>
        ￥
        <span class="main-txt-highline">
          {{ rent.calRentResult }}
        </span>
        元
      </span>
    </div>
    <div
      :class="{ unimportant: highline }">
      {{ getDate(rent.addTime) }}
    </div>
  </div>
</template>

<script>
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'TableRentViewItem',
  mixins: [mixinDef],
  props: {
    rent: {
      type: Object,
      default: () => {},
    },
    highline: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
