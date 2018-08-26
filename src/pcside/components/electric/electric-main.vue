<template>
  <div class="electric-main">

    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        @click="getAddElectricDialog">
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
          placeholder="搜索"
          v-model="electricDataSearch" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog
      custom-class="add-electric-dialog small"
      :key="'addElectric' + dialogId"
      :title="aedDialogTitle"
      :visible.sync="addElectricflag"
      :close-on-click-modal="false"
      @close="onAddElectricDialogClose">
      <el-form
        ref="addElectric"
        :model="addElectric"
        :rules="addElectricrules">
        <el-form-item
          label="房屋"
          prop="haoId"
          :label-width="aedLabelWidth">
          <el-select
            filterable
            placeholder="选择房屋"
            v-model="addElectric.haoId">
            <el-option
              v-for="item in houseData"
              :label="item.fang + item.hao"
              :value="item._id"
              :key="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="电表数"
          prop="electric"
          :label-width="aedLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="输入电表数"
            v-model.number="addElectric.electric">
            <template slot="append">度</template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="备注"
          :label-width="aedLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="备注"
            v-model="addElectric.remark" />
        </el-form-item>
        <el-form-item
          label="抄表时间"
          prop="addTime"
          :label-width="aedLabelWidth">
          <el-date-picker
            type="datetime"
            placeholder="输入抄表时间"
            v-model="addElectric.addTime"
            :editable="false" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingAddElectric"
          @click="getAddElectricDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingAddElectric"
          @click="getAddElectric">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 计费弹窗 -->
    <el-dialog
      custom-class="cal-electric-dialog"
      top="50px"
      :key="'calElectric' + dialogId"
      :title="calElectric.fanghao + cedDialogTitle"
      :visible.sync="calElectricflag"
      :close-on-click-modal="false"
      @close="onCalElectricDialogClose">
      <el-form
        ref="calElectric"
        :model="calElectric"
        :rules="calElectricrules">

        <!-- 房屋信息 -->
        <!-- 电底信息 -->
        <el-alert
          title="本抄表数据来源于最新一次抄表，可修改作为本次副本保存（不增加抄表数据），但建议按照逻辑操作，先抄表再计费"
          type="info" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="抄表数"
              prop="tnew.electric"
              :label-width="cedLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入抄表数"
                v-model.number="calElectric.tnew.electric">
                <template slot="append">度</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="抄表时间"
              prop="tnew.addTime"
              :label-width="cedLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入抄表时间"
                style="width: 100%;"
                v-model="calElectric.tnew.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="抄表备注"
          :label-width="cedLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="抄表备注"
            v-model="calElectric.tnew.remark" />
        </el-form-item>
        <el-alert
          title="本底表数来源于上一次计费数据，可修改作为本次副本保存（不创建底表计费信息），但建议按照逻辑操作，分次计费"
          type="info" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="底表数"
              prop="old.electric"
              :label-width="cedLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入底表数"
                v-model.number="calElectric.old.electric">
                <template slot="append">度</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="底表时间"
              prop="old.addTime"
              :label-width="cedLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入底表时间"
                style="width: 100%;"
                v-model="calElectric.old.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="底表备注"
          :label-width="cedLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="底表备注"
            v-model="calElectric.old.remark" />
        </el-form-item>

        <!-- 计费方式 -->
        <el-alert
          title="本计费方式及结果来源于租户信息，临时调整可修改作为本次副本保存（不更新租户信息），但建议按照逻辑操作，修改租住管理的租户信息"
          type="info" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="低消"
              prop="calElectric.minPrice"
              :label-width="cedLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入最低消费"
                v-model.number="calElectric.calElectric.minPrice">
                <template slot="append">度</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费方式"
              :label-width="cedLabelWidth">
              <el-radio
                label="single"
                v-model="calElectric.calElectric.calType">
                单一价格
              </el-radio>
              <el-radio
                label="step"
                v-model="calElectric.calElectric.calType">
                阶梯价格
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 单价计费 -->
        <el-form-item
          label="单价"
          prop="calElectric.singlePrice"
          v-if="calElectric.calElectric.calType == 'single'"
          key="eleSingle"
          :rules="calElectricrules[`calElectric.singlePrice`][0]"
          :label-width="cedLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="输入单价"
            v-model.number="calElectric.calElectric.singlePrice">
            <template slot="prepend">￥</template>
            <template slot="append">元/度</template>
          </el-input>
        </el-form-item>
        <!-- 阶梯计费 -->
        <div v-if="calElectric.calElectric.calType == 'step'">
          <el-form-item
            required
            v-for="(step, index) in calElectric.calElectric.stepPrice"
            :label="'阶梯' + (index + 1)"
            :label-width="cedLabelWidth"
            :key="'calElectric'+ index"
            :ref="'calElectric' + index">
            <el-col :span="10">
              <el-form-item
                :prop="'calElectric.stepPrice.' + index + '.step'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  auto-complete="off"
                  placeholder="本阶梯最大值"
                  v-model.number="step.step">
                  <template slot="append">度</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col
              class="line"
              :span="1" />
            <el-col :span="9">
              <el-form-item
                :prop="'calElectric.stepPrice.' + index + '.price'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  auto-complete="off"
                  placeholder="本阶梯单价"
                  v-model.number="step.price">
                  <template slot="prepend">￥</template>
                  <template slot="append">元</template>
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
          v-if="calElectric.calElectric.calType == 'step'"
          key="eleStep"
          :label-width="cedLabelWidth">
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
              prop="calElectricResult"
              :label="calElectric.fix ? '修正结果' : '计算结果'"
              :label-width="cedLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入金额"
                v-model.number="calElectric.calElectricResult">
                <template slot="prepend">￥</template>
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费时间"
              prop="addTime"
              :label-width="cedLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入计费时间"
                style="width: 100%;"
                v-model="calElectric.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="计费备注"
          :label-width="cedLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="计费备注"
            v-model="calElectric.remark" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingCalElectric"
          @click="getCalElectricDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingCalElectric"
          @click="getCalElectric">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 电费数据表 -->
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
            class="main-txt-highline"
            v-if="scope.row.electricId.electric > 0">
            {{ scope.row.electricId.electric }}
          </span>
          <span
            v-else>
            {{ scope.row.electricId.electric }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="electricId.addTime"
        label="最新抄表时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.electricId && scope.row.electricId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="calElectricId.electric"
        label="上计底表数(度)"
        width="160">
        <template slot-scope="scope">
          <span
            class="main-txt-highline"
            v-if="scope.row.calElectricId.electric > 0">
            {{ scope.row.calElectricId.electric }}
          </span>
          <span
            v-else>
            {{ scope.row.calElectricId.electric }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="calElectricId.addTime"
        label="上次计费/初始时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.calElectricId && scope.row.calElectricId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="gap"
        label="本期实用数(度)"
        width="160">
        <template slot-scope="scope">
          <span
            class="main-txt-highline"
            v-if="scope.row.gap > 0">
            {{ scope.row.gap }}
          </span>
          <span v-else>
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
            unit="度"
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
            @click="getElectricHistory(scope.$index, scope.row)">
            历史
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="getCalElectricDialog(scope.$index, scope.row)">
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
    name: 'ElectricMain',
    components: {
      TableEandwCalPriceViewItem,
    },
    mixins: [mixinDef],
    data() {
      return {
        addElectricflag: false,
        calElectricflag: false,
        gettingAddElectric: false,
        gettingListRefresh: false,
        gettingCalElectric: false,

        houseData: [],
        dialogId: Date.now(),
        // 超表弹窗
        aedDialogTitle: '抄电表',
        aedLabelWidth: '90px',
        // 抄表数据对象
        addElectric: {},
        addElectricClear: {
          haoId: '',
          electric: '',
          remark: '',
          addTime: '',
        },
        addElectricrules: {
          haoId: [{ required: true, message: '请选择', trigger: 'change' }],
          electric: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
        },

        tableMaxHeight: 200,
        electricData: [],
        electricDataSearch: '',
        // 计费弹窗
        cedDialogTitle: '电表计费',
        cedLabelWidth: '90px',
        // 计费数据对象
        calElectric: {},
        calElectricClear: {
          haoId: '',
          fanghao: '',
          tnew: {
            electric: 0,
            remark: '',
            addTime: '',
          },
          old: {
            electric: 0,
            remark: '',
            addTime: '',
          },
          calElectric: {
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
          calElectricResult: 0,
        },

        calElectricrules: {
          'tnew.electric': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'tnew.addTime': [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          'old.electric': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'old.addTime': [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          'calElectric.minPrice': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'calElectric.singlePrice': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          calElectricResult: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
        },
      }
    },
    computed: {
      filterElectricData() {
        if (!this.electricDataSearch) {
          return this.electricData
        }

        const searchKeys = ['fanghao', 'remark']

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
      calElectricResult() {
        // 电表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
        let result = 0
        if (!this.calElectric.tnew || !this.calElectric.old) return result
        let theGap = this.calElectric.tnew.electric - this.calElectric.old.electric
        theGap = Math.max(theGap, this.calElectric.calElectric.minPrice || 0)
        if (this.calElectric.calElectric.calType === 'single') {
          result = theGap * this.calElectric.calElectric.singlePrice
        } else {
          this.calElectric.calElectric.stepPrice.forEach((item, i, arr) => {
            // 假阶梯，取范围内的计算，大于按照最大的
            if (!item.price) return
            const prevPrices = arr[i - 1] || {}
            if (
              (theGap > (prevPrices.step || 0) && theGap <= item.step)
              || (i === (arr.length - 1) && theGap >= item.step)
            ) {
              result = theGap * item.price
            }
          })
        }
        result = Math.round(result * 100) / 100
        return result
      },
      ...mapState({
        defaultCalElePrice: state => state.config.defaultCalElePrice,
        defaultStep: state => state.config.defaultStep,
      }),
    },
    watch: {
      calElectricResult(n) {
        this.calElectric.calElectricResult = n
      },
      /* eslint object-shorthand: 0 */
      'calElectric.calElectricResult'(n) {
        this.calElectric.fix = n !== this.calElectricResult
      },
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/electric/index')
    },
    created() {
      this.getHouseList()
      this.getListRefresh()
      this.getResetAddElectric()
      this.getResetCalElectric()
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
      // 获取弹窗房屋列表
      async getHouseList() {
        await this.Ajax('/inner/house/list')
          .then(res => {
            this.houseData = res
          })
          .catch(() => {})
      },
      // 打开关闭添加弹窗
      getAddElectricDialog() {
        this.addElectricflag = !this.addElectricflag
        if (this.addElectricflag) this.addElectric.addTime = new Date()
      },
      // 弹窗数据初始化
      getResetAddElectric() {
        this.addElectric = Object.assign({}, this.addElectric, this.addElectricClear)
        this.addElectric.addTime = new Date()
        this.dialogId = Date.now()
      },
      // 关闭弹窗回调
      onAddElectricDialogClose() {
        setTimeout(() => {
          this.$refs.addElectric.resetFields()
          this.getResetAddElectric()
        }, 500)
      },
      // 抄表
      async getAddElectric() {
        if (this.gettingAddElectric) return

        // 表单校验
        try {
          await this.$refs.addElectric.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingAddElectric = true

        const _data = Object.assign({}, this.addElectric)
        await this.Ajax('/inner/electric/add', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '抄表成功',
              duration: 2000,
            })
            this.getAddElectricDialog()
            this.getListRefresh()
          })
          .catch(() => {})

        this.gettingAddElectric = false
      },
      // 拉取电费信息列表
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true
        await this.Ajax('/inner/electric/mainList')
          .then(res => {
            this.electricData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      // 打开关闭计费弹窗
      getCalElectricDialog(index, row) {
        this.calElectricflag = !this.calElectricflag
        if (this.calElectricflag && row) {
          // 基本信息
          this.calElectric.haoId = row._id
          this.calElectric.fanghao = row.fanghao
          this.calElectric.addTime = new Date()
          // tnew
          if (row.electricId.electric) this.calElectric.tnew.electric = row.electricId.electric
          if (row.electricId.remark) this.calElectric.tnew.remark = row.electricId.remark
          if (row.electricId.addTime) {
            this.calElectric.tnew.addTime = new Date(row.electricId.addTime)
          } else {
            this.calElectric.tnew.addTime = new Date()
          }
          // old
          if (row.calElectricId.electric) this.calElectric.old.electric = row.calElectricId.electric
          if (row.calElectricId.remark) this.calElectric.old.remark = row.calElectricId.remark
          if (row.calElectricId.addTime) {
            this.calElectric.old.addTime = new Date(row.calElectricId.addTime)
          } else {
            this.calElectric.old.addTime = new Date()
          }

          // 电费初始化
          if (!row.leaseId || !row.leaseId.calType) {
            this.calElectric.calElectric = Object.assign(
              {},
              JSON.parse(JSON.stringify(this.defaultCalElePrice))
            )
            return
          }

          // 水费
          Object.keys(this.calElectric.calElectric).forEach(key => {
            if (
              this.calElectric.calElectric[key].constructor === Array
              && row.leaseId[key]
            ) {
              this.calElectric.calElectric[key] = JSON.parse(JSON.stringify(row.leaseId[key]))
            } else if (row.leaseId[key]) {
              this.calElectric.calElectric[key] = row.leaseId[key]
            }
          })
          if (!this.calElectric.calElectric.stepPrice.length) this.addStep()
        }
      },
      // 计费弹窗数据初始化
      getResetCalElectric() {
        this.calElectric = Object.assign({}, JSON.parse(JSON.stringify(this.calElectricClear)))
        this.dialogId = Date.now()
      },
      // 关闭计费弹窗回调
      onCalElectricDialogClose() {
        setTimeout(() => {
          this.$refs.calElectric.resetFields()
          this.getResetCalElectric()
        }, 500)
      },
      // 添加步骤
      addStep() {
        const step = Object.assign({}, JSON.parse(JSON.stringify(this.defaultStep)))
        this.calElectric.calElectric.stepPrice.push(step)
      },
      // 删除步骤
      removeStep(step) {
        const index = this.calElectric.calElectric.stepPrice.indexOf(step)
        if (index !== -1) {
          this.calElectric.calElectric.stepPrice.splice(index, 1)
        }
      },
      // 计费
      async getCalElectric() {
        if (this.gettingCalElectric) return

        // 表单校验
        try {
          await this.$refs.calElectric.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingCalElectric = true

        const _data = Object.assign({}, this.calElectric)
        await this.Ajax('/inner/electric/cal', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '计费成功',
              duration: 2000,
            })
            this.getCalElectricDialog()
            this.getListRefresh()
          })
          .catch(() => {})

        this.gettingCalElectric = false
      },
      // 进入历史
      getElectricHistory(index, row) {
        this.$router.push(`/inner/electric/history?haoid=${row._id}`)
      },
    },
  }
</script>
