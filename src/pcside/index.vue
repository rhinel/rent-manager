<style lang="scss">
  html, body{
    height: 100%;
    width: 100%;
    font-size: 14px;
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  }
  // 表格样式
  .el-table .el-table__body .cell{
    padding: 5px 18px;
  }
  // 高亮样式
  .main-txt-highline{
    color: #1D8CE0;
  }
  // 悬浮高亮样式
  .el-table--enable-row-hover .el-table__body tr:hover > td:not(.el-table__expanded-cell){
    font-weight: bold;
    // background-color: #58B7FF;
    // color: #fff;
    // .main-txt-highline {
    //   color: #fff;
    // }
    // .el-button--text {
    //   color: #fff;
    //   &:hover {
    //     color: #D3DCE6;
    //   }
    // }
  }
  // 折页打开样式
  .table-expand{
    font-size: 0;
    .rent-show-tag{
      padding-top: 6px;
      line-height: 0;
    }
  }
  .table-expand label{
    width: 150px;
    color: #99a9bf;
  }
  .table-expand .el-form-item{
    margin-right: 0;
    margin-bottom: 0;
    width: 33%;
  }
  // 重写组件样式
  .el-tag{
    vertical-align: top;
  }
  .el-popover{
    font-size: 14px;
    line-height: 1.5;
  }
</style>

<template>
  <router-view class="index"></router-view>
</template>

<script>
  export default {
    name: 'index'
  }
</script>
