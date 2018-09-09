<template>
  <div class="electric-remote-read">

    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <div class="table-btn-input">
        <el-input
          placeholder="请输入电力局验证码"
          v-model="electricIdentify" />
      </div>
      <el-button
        type="primary"
        @click="getElectricIdentify">
        获取验证码
      </el-button>

      <div class="table-btn-input">
        <el-date-picker
          type="date"
          placeholder="选择抄表日期"
          v-model="electricDay"
          :editable="false" />
      </div>
      <el-button
        type="primary"
        @click="getAllStart">
        全部开始抄表
      </el-button>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { mixinDef } from 'pcside/js/mixins'

  // 本页面websocket对象
  let ws

  export default {
    name: 'ElectricRemoteRead',
    mixins: [mixinDef],
    data() {
      return {
        electricIdentify: '',
        electricDay: '',
      }
    },
    computed: {
      ...mapState({
        sysInfo: state => state.config.defaultElseInfo,
      }),
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/electric/index')
    },
    created() {
      this.initWebSocket()
    },
    methods: {
      initWebSocket() {
        ws = this.Ws('/inner/electric/remoteRead')
        ws.onopen = () => {
          console.log('Connection open ...')
        }

        ws.onmessage = (evt) => {
          console.log(`Received Message: ${evt.data}`)
        }

        ws.onclose = (evt) => {
          console.log('Connection closed.', evt.code)
        }
      },
      getElectricIdentify() {},
      getAllStart() {},
    },
  }
</script>
