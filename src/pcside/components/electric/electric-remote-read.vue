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
          :editable="false"
          :picker-options="{disabledDate(time) {
            return time.getTime() > Date.now()
          }}" />
      </div>
      <el-button
        type="primary"
        :disabled="!canGetAllStart"
        @click="getAllStart()">
        全部开始抄数
      </el-button>
      <el-button
        type="warning"
        :disabled="!canGetAllStart || !canGetAllInbase"
        @click="getAllInbase()">
        全部开始写入
      </el-button>

      <el-button
        type="primary"
        :disabled="isClose"
        @click="refreshWebSocket">
        刷新连接
      </el-button>

      <el-button
        type="danger"
        @click="getTakeClose">
        {{ isClose ? '重新连接' : '关闭连接' }}
      </el-button>
    </div>

    <!-- 日志显示容器 -->
    <div
      class="log-wrap"
      ref="logWrap">
      <div
        v-for="(line, index) in infoLine"
        :key="index"
        v-html="line" />
      <div v-if="!isClose">等待指令 ...</div>
    </div>

    <!-- 列表数据处理 -->
    <el-table
      v-loading.body="gettingListRefresh"
      class="electric-table"
      stripe
      border
      ref="electricTable"
      :max-height="tableMaxHeight"
      :data="filterElectricData">
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120" />
      <el-table-column
        prop="electricId.electric"
        label="最新抄表数(度)"
        width="160">
        <template slot-scope="scope">
          <span
            :class="
              scope.row.electricId.electric > 0
                ? 'main-txt-highline' : ''
            ">
            {{ scope.row.electricId.electric }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="electricId.addTime"
        label="最新抄表时间"
        min-width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.electricId
          && scope.row.electricId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="addElectric.electric"
        label="电力局读数(度)"
        width="160">
        <template slot-scope="scope">
          <span
            :class="
              scope.row.addElectric.electric > 0
                ? 'main-txt-highline' : ''
            ">
            {{ scope.row.addElectric.electric || '--' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="addElectric.addTime"
        label="电力局读数时间"
        min-width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.addElectric
          && scope.row.addElectric.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            v-if="scope.row.dbjb && scope.row.glyhbh"
            :disabled="!canGetAllStart"
            @click="getAllStart(scope.row._id)">
            抄数
          </el-button>
          <el-button
            size="small"
            type="warning"
            v-if="scope.row.dbjb && scope.row.glyhbh"
            :disabled="
              !canGetAllStart
                || !canGetAllInbase
                || !scope.row.addElectric.addTime
                || scope.row.electricId.addTime === scope.row.addElectric.addTime
            "
            @click="getAllInbase(scope.row._id)">
            写入
            <i
              class="el-icon-success"
              v-if="scope.row.electricId.addTime === scope.row.addElectric.addTime" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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
        // 没有处理等待响应状态
        // 应基于业务习惯及服务可用性、最大自由度来考虑
        // 应该如何设计本页面的loading及阻止处理
        codeTime: 0,
        canGetLogin: false,
        canGetAllStart: false,
        canGetAllInbase: false,
        isClose: false,

        // 操作字段
        code: '',
        day: '',
        // 房屋信息列表字段
        gettingListRefresh: false,
        tableMaxHeight: 200,
        electricData: [],
        electricDataSearch: '',

        // 日志字段
        infoLine: [],
      }
    },
    computed: {
      filterElectricData() {
        if (!this.electricDataSearch) {
          return this.electricData
        }

        const searchKeys = ['fanghao']

        const _electricDataSearch = new RegExp(this.electricDataSearch, 'i')
        return this.electricData.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _electricDataSearch.test(testItem)
        })
      },
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
    mounted() {
      window.onresize = () => {
        const height = window.innerHeight || document.body.clientHeight
        const offsetTop = this.$refs.electricTable.$el.getBoundingClientRect().top
        this.tableMaxHeight = height - offsetTop - 20 - 0.5
      }
      this.$nextTick(() => window.onresize())
    },
    beforeDestroy() {
      window.onresize = null
    },
    methods: {
      // log
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

        this.$nextTick(() => {
          const el = this.$refs.logWrap
          if (el) {
            el.scrollTop = el.scrollHeight
          }
        })
      },
      // resetStatus
      resetStatus() {
        this.codeTime = 0
        this.canGetLogin = false
        this.canGetAllStart = false
        this.canGetAllInbase = false
        this.code = ''
        this.day = ''
      },

      // socket
      initWebSocket() {
        // init onopen onclose onmessage
        ws = this.Ws('/inner/electric/remoteRead', () => {
          this.logFormat('client-INFO', '后台系统连接中 ...')
        })

        ws.onopen = () => {
          this.isClose = false
          this.logFormat('client-INFO', '后台系统已连接！')
        }

        ws.onclose = (evt) => {
          this.isClose = true
          this.logFormat(
            'client-INFO',
            `后台系统已关闭！关闭码${evt.code}。请重新连接。`
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

        console.log(ws)
      },
      dealWebSocket(type, data) {
        // 方法注册的回调处理
        // 由于前端业务没有异步 / 耗时任务
        // 此处没有根据请求 - 回调
        // 方式处理，而是统一写在判断里面
        // 做统一回调处理
        // 应根据type类型做返回回调、任务队列处理
        if (type === 'electricData' && data.type === 'DATA') {
          this.electricData = data.data
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
          // 已经有抄数数据，可继续处理
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
          // 更新本地electricData，而不重新获取
          // 服务端也会更新
          this.checkIsBase(data.data)
        }
      },
      refreshWebSocket() {
        // 因为时序搞不好
        // setTimeout延时一下
        ws.close()
        setTimeout(this.initWebSocket, 500)
      },
      closeWebSocket() {
        // ws.close() will call by server
        this.logFormat('client-INFO', '关闭连接中 ...')
        ws.send(JSON.stringify({
          type: 'getClose',
        }))
      },

      // 方法
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
      getAllStart(haoId = '') {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '系统抄数中 ...')
        ws.send(JSON.stringify({
          type: 'getNumber',
          data: {
            day: this.day ? this.GetDateFormat(this.day) : '',
            haoId,
          },
        }))
      },
      checkIsGet(data) {
        const electricItem = this.electricData
          .find(item => item._id === data.haoId)

        if (electricItem) {
          electricItem.addElectric = data
        }
      },
      getAllInbase(haoId = '') {
        if (ws.readyState === 3) return
        this.logFormat('client-INFO', '系统写入数据中 ...')
        ws.send(JSON.stringify({
          type: 'getInbase',
          data: { haoId },
        }))
      },
      checkIsBase(data) {
        const electricItem = this.electricData
          .find(item => item._id === data.haoId)

        if (electricItem) {
          electricItem.electricId = data
        }
      },
      getTakeClose() {
        if (this.isClose) {
          this.initWebSocket()
          return
        }
        this.closeWebSocket()
        this.resetStatus()
      },
    },
  }
</script>
