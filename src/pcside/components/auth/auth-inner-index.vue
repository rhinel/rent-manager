<template>
  <div
    :class="{ 'in': !Navtg }"
    class="auth-inner-index">
    <div class="inner-header">
      <div class="header-left">
        <span>Rent Manager</span>
        <el-button
          class="nav-flag"
          size="mini"
          icon="el-icon-d-arrow-left"
          @click="getNavtg" />
      </div>
      <div class="header-name">
        {{ `${$route.meta.name} ${titleAdd}` }}
      </div>
      <div class="username">{{ config.username }}</div>
      <div class="version">v{{ version }}</div>
      <div
        class="header-right"
        @click="logout">
        <i :class="logouting ? 'el-icon-loading' : 'el-icon-star-on'" />
        登出
      </div>
    </div>
    <el-menu
      :default-active="menuing"
      :router="true"
      class="inner-sidebar">
      <el-menu-item
        v-for="(menuItem, index) in config.menu"
        :key="index"
        :index="menuItem.index">
        <i :class="menuItem.icon" />
        <span slot="title">
          {{ menuItem.name }}
          <i
            v-show="menuCheck.includes(menuItem.check)"
            class="el-icon-loading" />
        </span>
      </el-menu-item>
    </el-menu>
    <router-view class="inner-body" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import packageConfig from '../../../../package.json'

export default {
  name: 'AuthInnerIndex',
  data() {
    return {
      version: packageConfig.version,
      logouting: false,
      Navtg: true,
    }
  },
  computed: {
    ...mapState([
      'menuing',
      'menuCheck',
      'titleAdd',
      'config',
    ]),
  },
  methods: {
    // 伸缩菜单
    getNavtg() {
      this.Navtg = !this.Navtg
    },
    // 登出
    async logout() {
      if (this.logouting) return

      // 接口提交
      this.logouting = true

      await this.Ajax('/outer/log/logout')
        .then(() => {
          this.$message({
            type: 'success',
            message: '退出成功',
            duration: 2000,
          })
          localStorage.removeItem('token')
          this.$store.dispatch('clearDefaults')
          this.$router.push('/login')
        })
        .catch(() => {})

      this.logouting = false
    },
  },
}
</script>

<style lang="scss">
@media print {
  /* 打印样式 */
  .auth-inner-index {
    padding-top: 0 !important;

    .inner-header {
      display: none !important;
    }

    .inner-body {
      padding: 0 !important;
    }
  }
}

.auth-inner-index {
  /* 页面布局 */
  padding-left: 181px;
  transition: padding-left 0.3s;
  padding-top: 50px;

  /* 顶部开关按钮 */
  &.in {
    padding-left: 0;

    .header-left
    .el-button
    .el-icon-d-arrow-left {
      transform: rotateZ(180deg) !important;
    }

    .inner-sidebar {
      left: -181px;
    }
  }

  /* menu */
  .inner-sidebar {
    .el-icon-loading {
      vertical-align: text-bottom;
      position: relative;
      top: 0.5px;
    }

    width: 180px;
    height: calc(100vh - 50px);
    border-radius: 0;
    position: fixed;
    top: 50px;
    left: 0;
    transition: left 0.3s;
    bottom: 0;
  }

  /* header */
  .inner-header {
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
    background-color: #409eff;
    display: flex;

    .header-left {
      width: 161px;
      position: relative;
      background-color: #1d8ce0;
      padding-left: 20px;

      .el-button {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border-color: #fff;
        color: #fff;
        opacity: 0.69;
        transition: opacity 0.3s;

        .el-icon-d-arrow-left {
          transition: transform 0.3s;
          transform: rotateZ(0deg);
        }

        &:hover {
          opacity: 1;
        }
      }
    }

    .header-name {
      padding-left: 20px;
      flex: 1;
    }

    .username,
    .version {
      padding-right: 20px;
    }

    .header-right {
      opacity: 0.69;
      transition: opacity 0.3s;
      cursor: pointer;
      text-align: right;
      padding-right: 20px;

      [class*=" el-icon-"],
      [class^=el-icon-] {
        margin-right: 10px;
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  /* body */
  .inner-body {
    padding: 20px;
  }
}
</style>
