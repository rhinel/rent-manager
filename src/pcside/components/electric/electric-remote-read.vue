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
        :disabled="!!codeTime"
        @click="getCode">
        获取验证码{{
          typeof codeTime === 'number'
            && codeTime
            ? codeTime + '秒' : ''
        }}
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

      <el-button
        type="danger"
        @click="getClose">
        关闭连接
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

    <!-- 列表数据处理 -->
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
        codeTime: 0,
        canGetLogin: false,
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
      this.$store
        .dispatch('updateMenu', '/inner/electric/index')
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
          this.logFormat(
            'client-INFO',
            `后台系统已关闭！关闭码${evt.code}。请刷新页面重试。`
          )
        }

        ws.onmessage = (evt) => {
          const dataJson = JSON.parse(evt.data)
          const { code, type, data, msg } = dataJson

          // 统一日志打印处理
          if (code > 0) {
            return this.logFormat(
              `${type || 'sys'}-ERR`,
              msg
            )
          }

          this.logFormat(
            `${type || 'sys'}-${data.type || 'INFO'}`,
            data.message
          )
          if (data.type === 'ERR') return ''

          // 处理事件
          return this.dealWebSocket(type, data)
        }
      },
      dealWebSocket(type, data) {
        // 方法注册的回调处理
        // 由于前端业务没有异步 / 耗时任务
        // 此处没有根据请求 - 回调
        // 方式处理，而是统一写在判断里面
        // 做统一回调处理
        // 应根据type类型做返回回调、任务队列处理
        if (type === 'houseList' && data.type === 'DATA') {
          this.houseList = data.data
        } else if (type === 'sys' && data.type === 'DATA') {
          // status 1
          // 已经发送验证码
          if (data.data.status) {
            // 处理状态
            const gap = parseInt(
              (Date.now() - data.data.codeTime) / 1000,
              10
            )
            this.codeTimeDown(
              gap > 120 || gap < 0 ? 0 : 120 - gap
            )
            this.canGetLogin = true
          }

          // status 2 & 3
          // 已经登陆
          if (data.data.status > 1) {
            this.code = data.data.code

            // 处理状态
            this.codeTime = true
            this.canGetLogin = false
            this.canGetAllStart = true
          }

          // status 3
          // 已经有抄表数据，可继续处理
          if (data.data.status === 3) {
            this.day = new Date(data.data.day)

            // 处理状态
            // 数据会全部一起发过来
            Object.keys(data.data.cacheData).forEach(key => {
              if (!this.canGetAllInbase) {
                this.canGetAllInbase = true
              }
              this.checkIsGet(data.data.cacheData[key])
            })
          }
        } else if (type === 'getCode') {
          // status 1
          this.codeTimeDown(120)
          this.canGetLogin = true
        } else if (type === 'getLogin') {
          // status 2 & 3
          this.codeTime = true
          this.canGetLogin = false
          this.canGetAllStart = true
        } else if (type === 'getNumber' && data.type === 'DATA') {
          // status 3
          this.canGetAllInbase = true
          this.checkIsGet(data.data)
        } else if (type === 'getInbase' && data.type === 'DATA') {
          // 需处理数据
          // 更新本地houseList，而不重新获取
          this.checkIsBase(data.data)
        }
      },
      getCode() {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '请求验证码中 ...')
        ws.send(JSON.stringify({
          type: 'getCode',
        }))
      },
      codeTimeDown(num) {
        if (num) {
          this.codeTime = num + 1
        }

        if (this.codeTime && typeof this.codeTime === 'number') {
          this.codeTime -= 1
          setTimeout(this.codeTimeDown, 1000)
        }
      },
      getLogin() {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '系统登陆中 ...')
        ws.send(JSON.stringify({
          type: 'getLogin',
          data: { loginCode: this.code },
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
      getClose() {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '关闭连接中 ...')
        ws.send(JSON.stringify({
          type: 'getClose',
        }))
      },
    },
  }
</script>
