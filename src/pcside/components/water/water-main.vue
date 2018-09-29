<template>
  <div class="water-main">

    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        @click="getAddWaterDialog">
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
          v-model="waterDataSearch" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog
      custom-class="add-water-dialog small"
      :key="'addWater' + dialogId"
      :title="awdDialogTitle"
      :visible.sync="addWaterflag"
      :close-on-click-modal="false"
      @closed="onAddWaterDialogClose">
      <el-form
        ref="addWater"
        :model="addWater"
        :rules="addWaterrules">
        <el-form-item
          label="房屋"
          prop="haoId"
          :label-width="awdLabelWidth">
          <el-select
            placeholder="选择房屋"
            v-model="addWater.haoId"
            :filterable="true">
            <el-option
              v-for="item in houseData"
              :label="item.fang + item.hao"
              :value="item._id"
              :key="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="水表数"
          prop="water"
          :label-width="awdLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="输入水表数"
            v-model.number="addWater.water">
            <template slot="append">吨</template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="备注"
          :label-width="awdLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="备注"
            v-model="addWater.remark" />
        </el-form-item>
        <el-form-item
          label="抄表时间"
          prop="addTime"
          :label-width="awdLabelWidth">
          <el-date-picker
            type="datetime"
            placeholder="输入抄表时间"
            v-model="addWater.addTime"
            :editable="false" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingAddWater"
          @click="getAddWaterDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingAddWater"
          @click="getAddWater">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 计费弹窗 -->
    <el-dialog
      top="50px"
      custom-class="cal-water-dialog"
      :key="'calWater' + dialogId"
      :title="calWater.fanghao + cwdDialogTitle"
      :visible.sync="calWaterflag"
      :close-on-click-modal="false"
      @closed="onCalWaterDialogClose">
      <el-form
        ref="calWater"
        :model="calWater"
        :rules="calWaterrules">

        <!-- 房屋信息 -->
        <!-- 水底信息 -->
        <el-alert
          type="info"
          :title="'本抄表数据来源于最新一次抄表，' +
            '可修改作为本次副本保存（不增加抄表数据），' +
          '但建议按照逻辑操作，先抄表再计费'" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="抄表数"
              prop="tnew.water"
              :label-width="cwdLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入抄表数"
                v-model.number="calWater.tnew.water">
                <template slot="append">吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="抄表时间"
              prop="tnew.addTime"
              :label-width="cwdLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入抄表时间"
                style="width: 100%;"
                v-model="calWater.tnew.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="抄表备注"
          :label-width="cwdLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="抄表备注"
            v-model="calWater.tnew.remark" />
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
              prop="old.water"
              :label-width="cwdLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入底表数"
                v-model.number="calWater.old.water">
                <template slot="append">吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="底表时间"
              prop="old.addTime"
              :label-width="cwdLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入底表时间"
                style="width: 100%;"
                v-model="calWater.old.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="底表备注"
          :label-width="cwdLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="底表备注"
            v-model="calWater.old.remark" />
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
              prop="calWater.minPrice"
              :label-width="cwdLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入最低消费"
                v-model.number="calWater.calWater.minPrice">
                <template slot="append">吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费方式"
              :label-width="cwdLabelWidth">
              <el-radio
                label="single"
                v-model="calWater.calWater.calType">
                单一价格
              </el-radio>
              <el-radio
                label="step"
                v-model="calWater.calWater.calType">
                阶梯价格
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 单价计费 -->
        <el-form-item
          label="单价"
          prop="calWater.singlePrice"
          v-if="calWater.calWater.calType == 'single'"
          key="watSingle"
          :label-width="cwdLabelWidth"
          :rules="calWaterrules[`calWater.singlePrice`][0]">
          <el-input
            auto-complete="off"
            placeholder="输入单价"
            v-model.number="calWater.calWater.singlePrice">
            <template slot="prepend">￥</template>
            <template slot="append">元/吨</template>
          </el-input>
        </el-form-item>
        <!-- 阶梯计费 -->
        <div v-if="calWater.calWater.calType == 'step'">
          <el-form-item
            required
            v-for="(step, index) in calWater.calWater.stepPrice"
            :label="'阶梯' + (index + 1)"
            :label-width="cwdLabelWidth"
            :key="'calWater'+ index"
            :ref="'calWater' + index">
            <el-col :span="10">
              <el-form-item
                :prop="'calWater.stepPrice.' + index + '.step'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  auto-complete="off"
                  placeholder="本阶梯最大值"
                  v-model.number="step.step">
                  <template slot="append">吨</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col
              class="line"
              :span="1" />
            <el-col :span="9">
              <el-form-item
                :prop="'calWater.stepPrice.' + index + '.price'"
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
          v-if="calWater.calWater.calType == 'step'"
          key="watStep"
          :label-width="cwdLabelWidth">
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
              prop="calWaterResult"
              :label="calWater.fix ? '修正结果' : '计算结果'"
              :label-width="cwdLabelWidth">
              <el-input
                auto-complete="off"
                placeholder="输入金额"
                v-model.number="calWater.calWaterResult">
                <template slot="prepend">￥</template>
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费时间"
              prop="addTime"
              :label-width="cwdLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入计费时间"
                style="width: 100%;"
                v-model="calWater.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="计费备注"
          :label-width="cwdLabelWidth">
          <el-input
            auto-complete="off"
            placeholder="计费备注"
            v-model="calWater.remark" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingCalWater"
          @click="getCalWaterDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingCalWater"
          @click="getCalWater">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 水费数据表 -->
    <el-table
      v-loading.body="gettingListRefresh"
      class="water-table"
      stripe
      border
      ref="waterTable"
      :max-height="tableMaxHeight"
      :data="filterWaterData">
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120" />
      <el-table-column
        prop="waterId.water"
        label="最新抄表数(吨)"
        width="160">
        <template slot-scope="scope">
          <span
            :class="
              scope.row.waterId.water > 0
                ? 'main-txt-highline' : ''
            ">
            {{ scope.row.waterId.water }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="waterId.addTime"
        label="最新抄表时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.waterId
          && scope.row.waterId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="calWaterId.water"
        label="上计底表数(吨)"
        width="160">
        <template slot-scope="scope">
          <span
            :class="
              scope.row.calWaterId.water > 0
                ? 'main-txt-highline' : ''
            ">
            {{ scope.row.calWaterId.water }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="calWaterId.addTime"
        label="上次计费/初始时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.calWaterId
          && scope.row.calWaterId.addTime) }}
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
            @click="getWaterHistory(scope.$index, scope.row)">
            历史
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="getCalWaterDialog(scope.$index, scope.row)">
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
    name: 'WaterMain',
    components: {
      TableEandwCalPriceViewItem,
    },
    mixins: [mixinDef],
    data() {
      return {
        addWaterflag: false,
        calWaterflag: false,
        gettingAddWater: false,
        gettingListRefresh: false,
        gettingCalWater: false,

        houseData: [],
        dialogId: Date.now(),
        // 抄表弹窗
        awdDialogTitle: '抄水表',
        awdLabelWidth: '90px',
        // 抄表数据对象
        addWater: {},
        addWaterClear: {
          haoId: '',
          water: '',
          remark: '',
          addTime: '',
        },
        addWaterrules: {
          haoId: [{
            required: true, message: '请选择', trigger: 'change',
          }],
          water: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
        },

        tableMaxHeight: 200,
        waterData: [],
        waterDataSearch: '',
        // 计费弹窗
        cwdDialogTitle: '水表计费',
        cwdLabelWidth: '90px',
        // 计费数据对象
        calWater: {},
        calWaterClear: {
          haoId: '',
          fanghao: '',
          tnew: {
            water: 0,
            remark: '',
            addTime: '',
          },
          old: {
            water: 0,
            remark: '',
            addTime: '',
          },
          calWater: {
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
          calWaterResult: 0,
        },

        calWaterrules: {
          'tnew.water': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'tnew.addTime': [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          'old.water': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'old.addTime': [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          'calWater.minPrice': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          'calWater.singlePrice': [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
          calWaterResult: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
        },
      }
    },
    computed: {
      filterWaterData() {
        if (!this.waterDataSearch) {
          return this.waterData
        }
        const searchKeys = ['fanghao']

        const _waterDataSearch = new RegExp(this.waterDataSearch, 'i')
        return this.waterData.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _waterDataSearch.test(testItem)
        })
      },
      calWaterResult() {
        // 水表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
        let result = 0
        if (!this.calWater.tnew || !this.calWater.old) return result
        let theGap = this.calWater.tnew.water - this.calWater.old.water
        theGap = Math.max(theGap, this.calWater.calWater.minPrice || 0)
        if (this.calWater.calWater.calType === 'single') {
          result = theGap * this.calWater.calWater.singlePrice
        } else {
          this.calWater.calWater.stepPrice.forEach((item, i, arr) => {
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
        defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
        defaultStep: state => state.config.defaultStep,
      }),
    },
    watch: {
      calWaterResult(n) {
        this.calWater.calWaterResult = n
      },
      /* eslint object-shorthand: 0 */
      'calWater.calWaterResult'(n) {
        this.calWater.fix = n !== this.calWaterResult
      },
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/water/index')
    },
    created() {
      this.getHouseList()
      this.getListRefresh()
      this.getResetAddWater()
      this.getResetCalWater()
    },
    mounted() {
      window.onresize = () => {
        const height = window.innerHeight || document.body.clientHeight
        const offsetTop = this.$refs.waterTable.$el.getBoundingClientRect().top
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
      async getAddWaterDialog() {
        this.addWaterflag = !this.addWaterflag
        if (this.leaseInflag) this.addWater.addTime = new Date()
        await new Promise(r => setTimeout(r, 300))
      },
      // 弹窗数据初始化
      getResetAddWater() {
        this.addWater = Object.assign({}, this.addWater, this.addWaterClear)
        this.addWater.addTime = new Date()
        this.dialogId = Date.now()
      },
      // 关闭弹窗回调
      onAddWaterDialogClose() {
        this.$refs.addWater.resetFields()
        this.getResetAddWater()
      },
      // 抄表
      async getAddWater() {
        if (this.gettingAddWater) return

        // 表单校验
        try {
          await this.$refs.addWater.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingAddWater = true

        const _data = Object.assign({}, this.addWater)
        await this.Ajax('/inner/water/add', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '抄表成功',
              duration: 2000,
            })
          })
          .then(this.getAddWaterDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingAddWater = false
      },
      // 拉取水费信息列表
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/water/mainList')
          .then(res => {
            this.waterData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      // 打开关闭计费弹窗
      async getCalWaterDialog(index, row) {
        this.calWaterflag = !this.calWaterflag
        if (this.calWaterflag && row) {
          // 基本信息
          this.calWater.haoId = row._id
          this.calWater.fanghao = row.fanghao
          this.calWater.addTime = new Date()
          // tnew
          if (row.waterId.water) this.calWater.tnew.water = row.waterId.water
          if (row.waterId.remark) this.calWater.tnew.remark = row.waterId.remark
          if (row.waterId.addTime) {
            this.calWater.tnew.addTime = new Date(row.waterId.addTime)
          } else {
            this.calWater.tnew.addTime = new Date()
          }
          // old
          if (row.calWaterId.water) this.calWater.old.water = row.calWaterId.water
          if (row.calWaterId.remark) this.calWater.old.remark = row.calWaterId.remark
          if (row.calWaterId.addTime) {
            this.calWater.old.addTime = new Date(row.calWaterId.addTime)
          } else {
            this.calWater.old.addTime = new Date()
          }

          // 水费初始化
          if (!row.leaseId || !row.leaseId.calType) {
            this.calWater.calWater = Object.assign(
              {},
              JSON.parse(JSON.stringify(this.defaultCalWaterPrice))
            )
            return
          }

          // 水费
          Object.keys(this.calWater.calWater).forEach(key => {
            if (
              this.calWater.calWater[key].constructor === Array
              && row.leaseId[key]
            ) {
              this.calWater.calWater[key] = JSON.parse(JSON.stringify(row.leaseId[key]))
            } else if (row.leaseId[key]) {
              this.calWater.calWater[key] = row.leaseId[key]
            }
          })
          if (!this.calWater.calWater.stepPrice.length) this.addStep()
        }
        await new Promise(r => setTimeout(r, 300))
      },
      // 计费弹窗数据初始化
      getResetCalWater() {
        this.calWater = Object.assign({}, JSON.parse(JSON.stringify(this.calWaterClear)))
        this.dialogId = Date.now()
      },
      // 关闭计费弹窗回调
      onCalWaterDialogClose() {
        this.$refs.calWater.resetFields()
        this.getResetCalWater()
      },
      // 添加步骤
      addStep() {
        const step = Object.assign({}, JSON.parse(JSON.stringify(this.defaultStep)))
        this.calWater.calWater.stepPrice.push(step)
      },
      // 删除步骤
      removeStep(step) {
        const index = this.calWater.calWater.stepPrice.indexOf(step)
        if (index !== -1) {
          this.calWater.calWater.stepPrice.splice(index, 1)
        }
      },
      // 计费
      async getCalWater() {
        if (this.gettingCalWater) return

        // 表单校验
        try {
          await this.$refs.calWater.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingCalWater = true
        const _data = Object.assign({}, this.calWater)
        await this.Ajax('/inner/water/cal', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '计费成功',
              duration: 2000,
            })
          })
          .then(this.getCalWaterDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingCalWater = false
      },
      // 进入历史
      getWaterHistory(index, row) {
        this.$router.push(`/inner/water/history?haoid=${row._id}`)
      },
    },
  }
</script>
