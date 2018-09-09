<template>
  <router-view class="index" />
</template>

<script>
  export default {
    name: 'Index',
  }
</script>

<style lang="scss">
/* reset */
html,
body {
  padding: 0;
  margin: 0;
  font-family:
    "Helvetica Neue",
    Helvetica,
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "微软雅黑",
    Arial,
    sans-serif;
  height: 100%;
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

button,
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

/* 页面=顶部按钮样式 */
.table-btn {
  margin-bottom: 15px;
}

.table-btn-input {
  vertical-align: top;
  max-width: 300px;
  display: inline-block;
}

.el-button + .table-btn-input,
.table-btn-input + .el-button {
  margin-left: 10px;
}

/* 表格=高亮样式 */
.main-txt-highline {
  color: #409eff;
}

/* 表格=非低亮 */
.unimportant {
  color: #99a9bf;
  font-weight: normal;
}

/* 表格=悬浮高亮样式 */
.el-table--enable-row-hover
.el-table__body
tr:hover
> td:not(.el-table__expanded-cell) {
  font-weight: bold;
}

.el-table--enable-row-hover
.el-table__body
tr:hover
> td {
  background-color: #dcdfe6;
}

/* 表格=折页打开样式 */
.table-expand {
  font-size: 0;

  .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 33%;
  }

  label {
    width: 150px;
    color: #99a9bf;
  }
}

/* 表格=信息悬浮窗样式 */
.show-tag {
  cursor: pointer;
  display: inline-block;
}

.show-tag3 {
  margin-right: 4px;
}

.history-step-p-wrap {
  display: flex;

  .step-p-val {
    flex: 1;
  }
}

/* 表格=删除pop样式 */
.show-pop {
  margin-left: 10px;
}

.pop-cont {
  text-align: right;
}

/* 表单 */
.el-form {
  /* 表单=alert */
  .el-alert {
    margin-bottom: 22px;
  }

  /* 表单=删除按钮 */
  .step-btn {
    text-align: right;
  }

  /* 表单=分割 */
  .line {
    height: 14px;
  }
}

/* 折页=内表格高亮 */
.content-bg {
  &:hover {
    background-color: #f5f7fa;
  }
}

/* 折页标题样式 */
.landord-title {
  display: inline-block;
  margin-right: 20px;

  & + .el-button {
    font-size: 13px;
  }
}

/* 详情样式 */
.landord-content {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .collapse-btn {
    width: auto;
    min-width: 90px;
    display: inline-block;
  }

  & > span {
    display: inline-block;
    line-height: 1;
    padding: 11px 0;
    width: 180px;
    vertical-align: top;
  }

  & > span:last-child {
    min-width: 180px;
    width: auto;
  }

  .landord-check {
    display: inline-block;
    width: 120px;
  }

  .landord-content-type {
    padding: 2px 0;
  }
}

/* 重写组件样式 */
.el-dialog {
  max-width: 800px;

  &.small {
    max-width: 400px;

    .el-select,
    .el-input {
      width: 100%;
      max-width: 300px;
    }
  }
}

.el-popover {
  font-size: 14px;
  line-height: 1.5;

  p {
    margin: 0;
  }
}

.el-alert {
  line-height: initial;

  .el-alert__closebtn {
    top: 11px;
  }
}

.el-date-editor
.el-range__close-icon {
  margin-left: -8px;
  margin-right: -7px;
}

.el-button {
  [class*=" el-icon-"],
  [class^=el-icon-] {
    vertical-align: top;
  }
}

.el-input__inner {
  vertical-align: top;
}
</style>
