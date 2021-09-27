<template>
  <div class="gas-main">
    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        @click="getAddGasDialog">
        抄表
      </el-button>
      <el-button
        type="primary"
        :loading="gettingListRefresh"
        @click="getListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="gasDataSearch"
          placeholder="搜索" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog
      custom-class="add-gas-dialog small"
      :title="awdDialogTitle"
      :visible.sync="addGasflag"
      :close-on-click-modal="false"
      :key="'addGas' + dialogId"
      @closed="onAddGasDialogClose">
      <el-form
        :model="addGas"
        :rules="addGasrules"
        ref="addGas">
        <el-form-item
          label="房屋"
          prop="haoId"
          :label-width="awdLabelWidth">
          <el-select
            v-model="addGas.haoId"
            placeholder="选择房屋"
            :filterable="true">
            <el-option
              :label="item.fang + item.hao"
              :value="item._id"
              v-for="item in houseData"
              :key="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="燃气表数"
          prop="gas"
          :label-width="awdLabelWidth">
          <el-input
            v-model.number="addGas.gas"
            auto-complete="off"
            placeholder="输入燃气表数">
            <template slot="append">
              吨
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="备注"
          :label-width="awdLabelWidth">
          <el-input
            v-model="addGas.remark"
            auto-complete="off"
            placeholder="备注" />
        </el-form-item>
        <el-form-item
          label="抄表时间"
          prop="addTime"
          :label-width="awdLabelWidth">
          <el-date-picker
            v-model="addGas.addTime"
            type="datetime"
            placeholder="输入抄表时间"
            :editable="false" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingAddGas"
          @click="getAddGasDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingAddGas"
          @click="getAddGas">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 计费弹窗 -->
    <el-dialog
      top="50px"
      custom-class="cal-gas-dialog"
      :title="calGas.fanghao + cwdDialogTitle"
      :visible.sync="calGasflag"
      :close-on-click-modal="false"
      :key="'calGas' + dialogId"
      @closed="onCalGasDialogClose">
      <el-form
        :model="calGas"
        :rules="calGasrules"
        ref="calGas">
        <!-- 房屋信息 -->
        <!-- 燃气底信息 -->
        <el-alert
          type="info"
          :title="'本抄表数据来源于最新一次抄表，' +
            '可修改作为本次副本保存（不增加抄表数据），' +
            '但建议按照逻辑操作，先抄表再计费'" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="抄表数"
              prop="tnew.gas"
              :label-width="cwdLabelWidth">
              <el-input
                v-model.number="calGas.tnew.gas"
                auto-complete="off"
                placeholder="输入抄表数">
                <template slot="append">
                  吨
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="抄表时间"
              prop="tnew.addTime"
              :label-width="cwdLabelWidth">
              <el-date-picker
                v-model="calGas.tnew.addTime"
                type="datetime"
                placeholder="输入抄表时间"
                style="width: 100%;"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="抄表备注"
          :label-width="cwdLabelWidth">
          <el-input
            v-model="calGas.tnew.remark"
            auto-complete="off"
            placeholder="抄表备注" />
        </el-form-item>
        <el-alert
          type="info"
          :title="'本底表数来源于上一次计费数据，' +
            '可修改作为本次副本保存（不创建底表计费信息），' +
            '但建议按照逻辑操作，分次计费'" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="底表数"
              prop="old.gas"
              :label-width="cwdLabelWidth">
              <el-input
                v-model.number="calGas.old.gas"
                auto-complete="off"
                placeholder="输入底表数">
                <template slot="append">
                  吨
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="底表时间"
              prop="old.addTime"
              :label-width="cwdLabelWidth">
              <el-date-picker
                v-model="calGas.old.addTime"
                type="datetime"
                placeholder="输入底表时间"
                style="width: 100%;"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="底表备注"
          :label-width="cwdLabelWidth">
          <el-input
            v-model="calGas.old.remark"
            auto-complete="off"
            placeholder="底表备注" />
        </el-form-item>

        <!-- 计费方式 -->
        <el-alert
          type="info"
          :title="'本计费方式及结果来源于租户信息，' +
            '临时调整可修改作为本次副本保存（不更新租户信息），' +
            '但建议按照逻辑操作，修改租住管理的租户信息'" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="低消"
              prop="calGas.minPrice"
              :label-width="cwdLabelWidth">
              <el-input
                v-model.number="calGas.calGas.minPrice"
                auto-complete="off"
                placeholder="输入最低消费">
                <template slot="append">
                  吨
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费方式"
              :label-width="cwdLabelWidth">
              <el-radio
                v-model="calGas.calGas.calType"
                label="single">
                单一价格
              </el-radio>
              <el-radio
                v-model="calGas.calGas.calType"
                label="step">
                阶梯价格
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 单价计费 -->
        <el-form-item
          label="单价"
          prop="calGas.singlePrice"
          :label-width="cwdLabelWidth"
          :rules="calGasrules[`calGas.singlePrice`][0]"
          v-if="calGas.calGas.calType == 'single'"
          key="watSingle">
          <el-input
            v-model.number="calGas.calGas.singlePrice"
            auto-complete="off"
            placeholder="输入单价">
            <template slot="prepend">
              ￥
            </template>
            <template slot="append">
              元/吨
            </template>
          </el-input>
        </el-form-item>
        <!-- 阶梯计费 -->
        <div v-if="calGas.calGas.calType == 'step'">
          <el-form-item
            required
            :label="'阶梯' + (index + 1)"
            :label-width="cwdLabelWidth"
            v-for="(step, index) in calGas.calGas.stepPrice"
            :key="'calGas'+ index"
            :ref="'calGas' + index">
            <el-col :span="10">
              <el-form-item
                :prop="'calGas.stepPrice.' + index + '.step'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  v-model.number="step.step"
                  auto-complete="off"
                  placeholder="本阶梯最大值">
                  <template slot="append">
                    吨
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col
              class="line"
              :span="1" />
            <el-col :span="9">
              <el-form-item
                :prop="'calGas.stepPrice.' + index + '.price'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  v-model.number="step.price"
                  auto-complete="off"
                  placeholder="本阶梯单价">
                  <template slot="prepend">
                    ￥
                  </template>
                  <template slot="append">
                    元
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col
              class="line"
              :span="1" />
            <el-col
              class="step-btn"
              :span="3">
              <el-button @click.prevent="removeStep(step)">
                删除
              </el-button>
            </el-col>
          </el-form-item>
        </div>
        <el-form-item
          :label-width="cwdLabelWidth"
          v-if="calGas.calGas.calType == 'step'"
          key="watStep">
          <el-button
            type="primary"
            @click="addStep">
            新增阶梯
          </el-button>
        </el-form-item>
        <!-- 本次计费情况 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              prop="calGasResult"
              :label="calGas.fix ? '修正结果' : '计算结果'"
              :label-width="cwdLabelWidth">
              <el-input
                v-model.number="calGas.calGasResult"
                auto-complete="off"
                placeholder="输入金额">
                <template slot="prepend">
                  ￥
                </template>
                <template slot="append">
                  元
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费时间"
              prop="addTime"
              :label-width="cwdLabelWidth">
              <el-date-picker
                v-model="calGas.addTime"
                type="datetime"
                placeholder="输入计费时间"
                style="width: 100%;"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="计费备注"
          :label-width="cwdLabelWidth">
          <el-input
            v-model="calGas.remark"
            auto-complete="off"
            placeholder="计费备注" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingCalGas"
          @click="getCalGasDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingCalGas"
          @click="getCalGas">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 燃气费数据表 -->
    <el-table
      v-loading.body="gettingListRefresh"
      class="gas-table"
      stripe
      border
      :max-height="tableMaxHeight"
      :data="filterGasData"
      ref="gasTable">
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120" />
      <el-table-column
        prop="gasId.gas"
        label="最新抄表数(吨)"
        width="160">
        <template slot-scope="scope">
          <span
            :class="
              scope.row.gasId.gas > 0
                ? 'main-txt-highline' : ''
            ">
            {{ scope.row.gasId.gas }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="gasId.addTime"
        label="最新抄表时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.gasId && scope.row.gasId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="calGasId.gas"
        label="上计底表数(吨)"
        width="160">
        <template slot-scope="scope">
          <span
            :class="
              scope.row.calGasId.gas > 0
                ? 'main-txt-highline' : ''
            ">
            {{ scope.row.calGasId.gas }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="calGasId.addTime"
        label="上次计费/初始时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.calGasId && scope.row.calGasId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="gap"
        label="本期实用数(吨)"
        width="160">
        <template slot-scope="scope">
          <span
            class="main-txt-highline"
            v-if="scope.row.gap > 0">
            {{ scope.row.gap }}
          </span>
          <span
            v-else>
            {{ scope.row.gap }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="result"
        label="小计"
        width="180">
        <template slot-scope="scope">
          ￥{{ scope.row.result || 0 }}元
        </template>
      </el-table-column>
      <el-table-column
        label="当前计费方式"
        min-width="180">
        <template slot-scope="scope">
          <table-eandw-cal-price-view-item
            type="leaseId"
            unit="吨"
            :lease="scope.row" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="getGasHistory(scope.$index, scope.row)">
            历史
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="getCalGasDialog(scope.$index, scope.row)">
            计费
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { mixinDef } from 'pcside/js/mixins'
  import TableEandwCalPriceViewItem from 'pcside/common/table-eandw-cal-price-view-item'

  export default {
    name: 'GasMain',
    components: {
      TableEandwCalPriceViewItem,
    },
    mixins: [mixinDef],
    data() {
      return {
        addGasflag: false,
        calGasflag: false,
        gettingAddGas: false,
        gettingListRefresh: false,
        gettingCalGas: false,

        houseData: [],
        dialogId: Date.now(),
        // 抄表弹窗
        awdDialogTitle: '抄燃气表',
        awdLabelWidth: '90px',
        // 抄表数据对象
        addGas: {},
        addGasClear: {
          haoId: '',
          gas: '',
          remark: '',
          addTime: '',
        },
        addGasrules: {
          haoId: [{
            required: true, message: '请选择', trigger: 'change',
          }],
          gas: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
        },

        tableMaxHeight: 200,
        gasData: [],
        gasDataSearch: '',
        // 计费弹窗
        cwdDialogTitle: '燃气表计费',
        cwdLabelWidth: '90px',
        // 计费数据对象
        calGas: {},
        calGasClear: {
          haoId: '',
          fanghao: '',
          tnew: {
            gas: 0,
            remark: '',
            addTime: '',
          },
          old: {
            gas: 0,
            remark: '',
            addTime: '',
          },
          calGas: {
            minPrice: 0,
            calType: 'single',
            singlePrice: 0,
            stepPrice: [{
              step: 0,
              price: 0,
            }],
          },
          remark: '',
          addTime: '',
          fix: false,
          calGasResult: 0,
        },

        calGasrules: {
          'tnew.gas': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'tnew.addTime': [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          'old.gas': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'old.addTime': [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          'calGas.minPrice': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'calGas.singlePrice': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          calGasResult: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
        },
      }
    },
    computed: {
      filterGasData() {
        if (!this.gasDataSearch) {
          return this.gasData
        }
        const searchKeys = ['fanghao']

        const _gasDataSearch = new RegExp(this.gasDataSearch, 'i')
        return this.gasData.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _gasDataSearch.test(testItem)
        })
      },
      calGasResult() {
        // 燃气表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
        let result = 0
        if (!this.calGas.tnew || !this.calGas.old) return result
        let theGap = this.calGas.tnew.gas - this.calGas.old.gas
        theGap = Math.max(theGap, this.calGas.calGas.minPrice || 0)
        if (this.calGas.calGas.calType === 'single') {
          result = theGap * this.calGas.calGas.singlePrice
        } else {
          this.calGas.calGas.stepPrice.forEach((item, i, arr) => {
            // 假阶梯，取范围内的计算，大于按照最大的
            if (!item.price) return
            const prevPrices = arr[i - 1] || {}
            if (
              (theGap > (prevPrices.step || 0) && theGap <= item.step)
              || (i === (arr.length - 1) && theGap >= item.step)) {
              result = theGap * item.price
            }
          })
        }
        result = Math.round(result * 100) / 100
        return result
      },
      ...mapState({
        defaultCalGasPrice: state => state.config.defaultCalGasPrice,
        defaultStep: state => state.config.defaultStep,
      }),
    },
    watch: {
      calGasResult(n) {
        this.calGas.calGasResult = n
      },
      /* eslint object-shorthand: 0 */
      'calGas.calGasResult'(n) {
        this.calGas.fix = n !== this.calGasResult
      },
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/gas/index')
    },
    created() {
      this.getHouseList()
      this.getListRefresh()
      this.getResetAddGas()
      this.getResetCalGas()
    },
    mounted() {
      window.onresize = () => {
        const height = window.innerHeight || document.body.clientHeight
        const offsetTop = this.$refs.gasTable.$el.getBoundingClientRect().top
        this.tableMaxHeight = height - offsetTop - 20 - 0.5
      }
      this.$nextTick(() => window.onresize())
    },
    beforeDestroy() {
      window.onresize = null
    },
    methods: {
      // 获取弹窗房屋列表
      async getHouseList() {
        await this.Ajax('/inner/house/list')
          .then(res => {
            this.houseData = res
          })
          .catch(() => {})
      },
      // 打开关闭添加弹窗
      async getAddGasDialog() {
        this.addGasflag = !this.addGasflag
        if (this.leaseInflag) this.addGas.addTime = new Date()
        await new Promise(r => setTimeout(r, 300))
      },
      // 弹窗数据初始化
      getResetAddGas() {
        this.addGas = Object.assign({}, this.addGas, this.addGasClear)
        this.addGas.addTime = new Date()
        this.dialogId = Date.now()
      },
      // 关闭弹窗回调
      onAddGasDialogClose() {
        this.$refs.addGas.resetFields()
        this.getResetAddGas()
      },
      // 抄表
      async getAddGas() {
        if (this.gettingAddGas) return

        // 表单校验
        try {
          await this.$refs.addGas.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingAddGas = true

        const _data = Object.assign({}, this.addGas)
        await this.Ajax('/inner/gas/add', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '抄表成功',
              duration: 2000,
            })
          })
          .then(this.getAddGasDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingAddGas = false
      },
      // 拉取燃气费信息列表
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/gas/mainList')
          .then(res => {
            this.gasData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      // 打开关闭计费弹窗
      async getCalGasDialog(index, row) {
        this.calGasflag = !this.calGasflag
        if (this.calGasflag && row) {
          // 基本信息
          this.calGas.haoId = row._id
          this.calGas.fanghao = row.fanghao
          this.calGas.addTime = new Date()
          // tnew
          if (row.gasId.gas) this.calGas.tnew.gas = row.gasId.gas
          if (row.gasId.remark) this.calGas.tnew.remark = row.gasId.remark
          if (row.gasId.addTime) {
            this.calGas.tnew.addTime = new Date(row.gasId.addTime)
          } else {
            this.calGas.tnew.addTime = new Date()
          }
          // old
          if (row.calGasId.gas) this.calGas.old.gas = row.calGasId.gas
          if (row.calGasId.remark) this.calGas.old.remark = row.calGasId.remark
          if (row.calGasId.addTime) {
            this.calGas.old.addTime = new Date(row.calGasId.addTime)
          } else {
            this.calGas.old.addTime = new Date()
          }

          // 燃气费初始化
          if (!row.leaseId || !row.leaseId.calType) {
            this.calGas.calGas = Object.assign(
              {},
              JSON.parse(JSON.stringify(this.defaultCalGasPrice))
            )
            return
          }

          // 燃气费
          Object.keys(this.calGas.calGas).forEach(key => {
            if (
              this.calGas.calGas[key].constructor === Array
              && row.leaseId[key]
            ) {
              this.calGas.calGas[key] = JSON.parse(JSON.stringify(row.leaseId[key]))
            } else if (row.leaseId[key]) {
              this.calGas.calGas[key] = row.leaseId[key]
            }
          })
          if (!this.calGas.calGas.stepPrice.length) this.addStep()
        }
        await new Promise(r => setTimeout(r, 300))
      },
      // 计费弹窗数据初始化
      getResetCalGas() {
        this.calGas = Object.assign({}, JSON.parse(JSON.stringify(this.calGasClear)))
        this.dialogId = Date.now()
      },
      // 关闭计费弹窗回调
      onCalGasDialogClose() {
        this.$refs.calGas.resetFields()
        this.getResetCalGas()
      },
      // 添加步骤
      addStep() {
        const step = Object.assign({}, JSON.parse(JSON.stringify(this.defaultStep)))
        this.calGas.calGas.stepPrice.push(step)
      },
      // 删除步骤
      removeStep(step) {
        const index = this.calGas.calGas.stepPrice.indexOf(step)
        if (index !== -1) {
          this.calGas.calGas.stepPrice.splice(index, 1)
        }
      },
      // 计费
      async getCalGas() {
        if (this.gettingCalGas) return

        // 表单校验
        try {
          await this.$refs.calGas.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingCalGas = true
        const _data = Object.assign({}, this.calGas)
        await this.Ajax('/inner/gas/cal', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '计费成功',
              duration: 2000,
            })
          })
          .then(this.getCalGasDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingCalGas = false
      },
      // 进入历史
      getGasHistory(index, row) {
        this.$router.push(`/inner/gas/history?haoid=${row._id}`)
      },
    },
  }
</script>
