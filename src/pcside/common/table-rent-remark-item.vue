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

<style lang="scss">
.remark-tag {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.remark-pop {
  max-width: 300px;
}
</style>
