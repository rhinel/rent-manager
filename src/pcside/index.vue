<template>
  <router-view class="index"></router-view>
</template>

<script>
  export default {
    name: 'index',
  }
</script>

<style lang="scss">
html,
body {
  height: 100%;
  width: 100%;
  font-size: 14px;
}
// button text
html,
body,
.el-button--text {
  font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
}
// 高亮样式
.main-txt-highline {
  color: #1d8ce0;
}
// 悬浮高亮样式
.el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td:not(.el-table__expanded-cell) {
  font-weight: bold;
}
// 折页打开样式
.table-expand {
  font-size: 0;
  .rent-show-tag {
    padding-top: 6px;
    line-height: 0;
  }
}
.table-expand label {
  width: 150px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 33%;
}
// 重写组件样式
.el-popover {
  font-size: 14px;
  line-height: 1.5;
}
.el-table--border
  .has-gutter
  td:nth-last-of-type(2),
.el-table--border
  .has-gutter
  th:nth-last-of-type(2) {
  border-right: 1px solid #e6ebf5;
}
</style>
