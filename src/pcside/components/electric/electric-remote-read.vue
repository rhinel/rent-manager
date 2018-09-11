<template>
  <div class="electric-remote-read">

    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <div class="table-btn-input">
        <el-input
          placeholder="请输入电力局验证码"
          :disabled="!canGetLogin"
          v-model="code" />
      </div>
      <el-button
        type="primary"
        :disabled="!canGetCode"
        @click="getCode">
        获取验证码
      </el-button>
      <el-button
        type="primary"
        :disabled="!canGetLogin"
        @click="getLogin">
        登陆电力局系统
      </el-button>

      <div class="table-btn-input">
        <el-date-picker
          type="date"
          placeholder="选择抄表日期"
          v-model="day"
          :disabled="!canGetAllStart"
          :editable="false" />
      </div>
      <el-button
        type="primary"
        :disabled="!canGetAllStart"
        @click="getAllStart()">
        全部开始抄表
      </el-button>
      <el-button
        type="primary"
        :disabled="!canGetAllStart || !canGetAllInbase"
        @click="getAllInbase()">
        全部开始写入系统
      </el-button>
    </div>

    <!-- 日志显示容器 -->
    <div class="log-wrap">
      <div
        v-for="(line, index) in infoLine"
        :key="index"
        v-html="line" />
      <div v-if="!isClose">等待指令 ...</div>
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
        // status
        canGetCode: true,
        canGetLogin: true,
        canGetAllStart: false,
        canGetAllInbase: false,
        isClose: false,

        // 操作字段
        code: '',
        day: '',

        // 房屋信息列表字段
        houseList: [],

        // 日志字段
        infoLine: [],
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
      logFormat(type, msg) {
        this.infoLine.push(
          `<span class="green">${
            this.GetTimeFormat(new Date())
          }</span> [${
            type
          }] ${
            msg
          }`
        )
      },
      initWebSocket() {
        ws = this.Ws('/inner/electric/remoteRead', () => {
          this.logFormat('client-INFO', '后台系统连接中 ...')
        })

        ws.onopen = () => {
          this.logFormat('client-INFO', '后台系统已连接！')
        }

        ws.onclose = (evt) => {
          this.isClose = true
          this.logFormat('client-INFO', `后台系统已关闭！关闭码${evt.code}。请刷新页面重试。`)
        }

        ws.onmessage = (evt) => {
          const dataJson = JSON.parse(evt.data)
          const { code, data, type, msg } = dataJson

          // 统一日志打印处理
          if (code > 0) {
            this.logFormat(
              `${type || 'sys'}-ERR`,
              msg
            )
            return
          }

          this.logFormat(
            `${type || 'sys'}-${data.type || 'INFO'}`,
            data.message
          )

          if (data.type === 'ERR') return

          // 方法注册的回调处理
          if (type === 'houseList' && data.type === 'DATA') {
            this.houseList = data.data
          } else if (type === 'sys' && data.type === 'DATA') {
            if (data.data.status) {
              this.code = data.data.code
              this.canGetCode = false
              this.canGetLogin = false
              this.canGetAllStart = true
            }
            if (data.data.status === 2) {
              this.day = new Date(data.data.day)
              Object.keys(data.data.cacheData).forEach(key => {
                this.checkIsGet(data.data.cacheData[key])
              })
            }
          } else if (type === 'getCode') {
            this.canGetLogin = true
          } else if (type === 'getLogin') {
            this.canGetCode = false
            this.canGetLogin = false
            this.canGetAllStart = true
          } else if (type === 'getNumber' && data.type === 'DATA') {
            this.checkIsGet(data.data)
          } else if (type === 'getInbase' && data.type === 'DATA') {
            this.checkIsBase(data.data)
          }
        }
      },
      getCode() {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '请求验证码中 ...')
        ws.send(JSON.stringify({
          type: 'getCode',
        }))
      },
      getLogin() {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '系统登陆中 ...')
        ws.send(JSON.stringify({
          type: 'getLogin',
          data: { code: this.code },
        }))
      },
      getAllStart(selectID = '') {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '系统抄表中 ...')
        ws.send(JSON.stringify({
          type: 'getNumber',
          data: {
            day: this.day ? this.GetDateFormat(this.day) : '',
            selectID,
          },
        }))
      },
      checkIsGet(data) {
        console.log('checkIsGet', data)
        this.canGetAllInbase = true
      },
      getAllInbase(selectID = '') {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '系统写入数据中 ...')
        ws.send(JSON.stringify({
          type: 'getInbase',
          data: { selectID },
        }))
      },
      checkIsBase(data) {
        console.log('checkIsBase', data)
      },
    },
  }
</script>
