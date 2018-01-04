<template>
  <el-popover
    placement="top"
    trigger="hover">
    <div class="remark-pop">
      {{ rent.remark }}
    </div>
    <span
      class="show-tag"
      slot="reference">
      <div class="remark-tag">
        {{ rent.remark }}
      </div>
    </span>
  </el-popover>
</template>

<script>
export default {
  name: 'TableRentRemarkItem',
  props: {
    rent: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

