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
        @click="getListRefresh"
        :loading="gettingListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="waterDataSearch"
          placeholder="搜索">
        </el-input>
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog custom-class="add-water-dialog"
      :key="'addWater' + dialogId"
      :title="awdDialogTitle"
      :visible.sync="addWaterflag"
      size="small"
      :close-on-click-modal="false"
      @close="onAddWaterDialogClose">
      <el-form
        :model="addWater"
        ref="addWater"
        :rules="addWaterrules">
        <el-form-item
          label="房屋"
          :label-width="awdLabelWidth"
          prop="haoId">
          <el-select
            v-model="addWater.haoId"
            placeholder="选择房屋"
            :filterable="true">
            <el-option
              v-for="item in houseData"
              :label="item.fang + item.hao"
              :value="item._id"
              :key="item._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="水表数"
          :label-width="awdLabelWidth"
          prop="water">
          <el-input
            v-model.number="addWater.water"
            auto-complete="off"
            placeholder="输入水表数">
            <template slot="append">吨</template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="备注"
          :label-width="awdLabelWidth">
          <el-input
            v-model="addWater.remark"
            auto-complete="off"
            placeholder="备注">
          </el-input>
        </el-form-item>
        <el-form-item
          label="抄表时间"
          :label-width="awdLabelWidth"
          prop="addTime">
          <el-date-picker
            v-model="addWater.addTime"
            type="datetime"
            placeholder="输入抄表时间"
            :editable="false">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div class="dialog-footer"
        slot="footer">
        <el-button
          @click="getAddWaterDialog"
          :loading="gettingAddWater">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="getAddWater"
          :loading="gettingAddWater">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 计费弹窗 -->
    <el-dialog custom-class="cal-water-dialog"
      :key="'calWater' + dialogId"
      :title="calWater.fanghao + cwdDialogTitle"
      :visible.sync="calWaterflag"
      size="large"
      top="50px"
      :close-on-click-modal="false"
      @close="onCalWaterDialogClose">
      <el-form
        :model="calWater"
        ref="calWater"
        :rules="calWaterrules">

        <!-- 房屋信息 -->
        <!-- 水底信息 -->
        <el-form-item>
          <el-alert
            title="本抄表数据来源于最新一次抄表，可修改作为本次副本保存（不增加抄表数据），但建议按照逻辑操作，先抄表再计费"
            type="info">
          </el-alert>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="抄表数"
              :label-width="cwdLabelWidth"
              prop="tnew.water">
              <el-input
                v-model.number="calWater.tnew.water"
                auto-complete="off"
                placeholder="输入抄表数">
                <template slot="append">吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="抄表时间"
              :label-width="cwdLabelWidth"
              prop="tnew.addTime">
              <el-date-picker
                v-model="calWater.tnew.addTime"
                type="datetime"
                placeholder="输入抄表时间"
                style="width: 100%;"
                :editable="false">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="抄表备注"
          :label-width="cwdLabelWidth">
          <el-input
          v-model="calWater.tnew.remark"
          auto-complete="off"
          placeholder="抄表备注">
        </el-input>
        </el-form-item>
        <el-form-item>
          <el-alert
            title="本底表数来源于上一次计费数据，可修改作为本次副本保存（不创建底表计费信息），但建议按照逻辑操作，分次计费"
            type="info">
          </el-alert>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="底表数"
              :label-width="cwdLabelWidth"
              prop="old.water">
              <el-input
                v-model.number="calWater.old.water"
                auto-complete="off"
                placeholder="输入底表数">
                <template slot="append">吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="底表时间"
              :label-width="cwdLabelWidth"
              prop="old.addTime">
              <el-date-picker
                v-model="calWater.old.addTime"
                type="datetime"
                placeholder="输入底表时间"
                style="width: 100%;"
                :editable="false">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="底表备注"
          :label-width="cwdLabelWidth">
          <el-input
            v-model="calWater.old.remark"
            auto-complete="off"
            placeholder="底表备注">
          </el-input>
        </el-form-item>

        <!-- 计费方式 -->
        <el-form-item>
          <el-alert
            title="本计费方式及结果来源于租户信息，临时调整可修改作为本次副本保存（不更新租户信息），但建议按照逻辑操作，修改租住管理的租户信息"
            type="info">
          </el-alert>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="低消"
              :label-width="cwdLabelWidth"
              prop="calWater.minPrice">
              <el-input
                v-model.number="calWater.calWater.minPrice"
                auto-complete="off"
                placeholder="输入最低消费">
                <template slot="append">吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费方式"
              :label-width="cwdLabelWidth">
              <el-radio
                v-model="calWater.calWater.calType"
                label="single">
                单一价格
              </el-radio>
              <el-radio
                v-model="calWater.calWater.calType"
                label="step">
                阶梯价格
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 单价计费 -->
        <el-form-item
          label="单价"
          key="watSingle"
          :label-width="cwdLabelWidth"
          v-if="calWater.calWater.calType == 'single'"
          prop="calWater.singlePrice"
          :rules="calWaterrules[`calWater.singlePrice`][0]">
          <el-input
            v-model.number="calWater.calWater.singlePrice"
            auto-complete="off"
            placeholder="输入单价">
            <template slot="prepend">￥</template>
            <template slot="append">元/吨</template>
          </el-input>
        </el-form-item>
        <!-- 阶梯计费 -->
        <div v-if="calWater.calWater.calType == 'step'">
          <el-form-item
            v-for="(step, index) in calWater.calWater.stepPrice"
            :label="'阶梯' + (index + 1)"
            :label-width="cwdLabelWidth"
            :key="'calWater'+ index"
            :ref="'calWater' + index"
            required>
            <el-col :span="5">
              <el-form-item
                :prop="'calWater.stepPrice.' + index + '.step'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  v-model.number="step.step"
                  auto-complete="off"
                  placeholder="本阶梯最大值">
                  <template slot="append">吨</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="1"></el-col>
            <el-col :span="7">
              <el-form-item
                :prop="'calWater.stepPrice.' + index + '.price'"
                :rules="{
                  type: 'number', required: true, message: '请填写', trigger: 'blur'
                }">
                <el-input
                  v-model.number="step.price"
                  auto-complete="off"
                  placeholder="本阶梯单价">
                  <template slot="prepend">￥</template>
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="1"></el-col>
            <el-col :span="5">
              <el-button
                @click.prevent="removeStep(step)">
                删除
              </el-button>
            </el-col>
          </el-form-item>
        </div>
        <el-form-item
          key="watStep"
          v-if="calWater.calWater.calType == 'step'"
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
              :label="calWater.fix ? '修正结果' : '计算结果'"
              :label-width="cwdLabelWidth"
              prop="calWaterResult">
              <el-input
                v-model.number="calWater.calWaterResult"
                auto-complete="off"
                placeholder="输入金额">
                <template slot="prepend">￥</template>
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计费时间"
              :label-width="cwdLabelWidth"
              prop="addTime">
              <el-date-picker
                v-model="calWater.addTime"
                type="datetime"
                placeholder="输入计费时间"
                style="width: 100%;"
                :editable="false">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="计费备注"
          :label-width="cwdLabelWidth">
          <el-input
            v-model="calWater.remark"
            auto-complete="off"
            placeholder="计费备注">
          </el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer"
        slot="footer">
        <el-button
          @click="getCalWaterDialog"
          :loading="gettingCalWater">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="getCalWater"
          :loading="gettingCalWater">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 水费数据表 -->
    <el-table class="water-table"
      :data="filterWaterData"
      v-loading.body="gettingListRefresh"
      stripe
      border>
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120">
      </el-table-column>
      <el-table-column
        prop="waterId.water"
        label="最新抄表数(吨)"
        width="160">
        <template slot-scope="scope">
          <span class="main-txt-highline"
            v-if="scope.row.waterId.water > 0">
            {{scope.row.waterId.water}}
          </span>
          <span v-else>
            {{scope.row.waterId.water}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="waterId.addTime"
        label="最新抄表时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.waterId && scope.row.waterId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="calWaterId.water"
        label="上计底表数(吨)"
        width="160">
        <template slot-scope="scope">
          <span class="main-txt-highline"
            v-if="scope.row.calWaterId.water > 0">
            {{scope.row.calWaterId.water}}
          </span>
          <span v-else>
            {{scope.row.calWaterId.water}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="calWaterId.addTime"
        label="上次计费/初始时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.calWaterId && scope.row.calWaterId.addTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="gap"
        label="本期实用数(吨)"
        width="160">
        <template slot-scope="scope">
          <span class="main-txt-highline"
            v-if="scope.row.gap > 0">
            {{scope.row.gap}}
          </span>
          <span v-else>
            {{scope.row.gap}}
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
          <div v-if="scope.row.leaseId.calType">
            <div>
              低消：
              {{ scope.row.leaseId.minPrice }}
              吨
            </div>
            <div v-if="scope.row.leaseId.calType == 'single'">
              单价：￥
              {{ scope.row.leaseId.singlePrice }}
              元/吨
            </div>
            <div v-else>
              <el-popover
                placement="right"
                trigger="hover">
                <div
                  v-for="(item, index) in scope.row.leaseId.stepPrice"
                  :key="index">
                  {{item.step}}吨及以下￥{{item.price}}元/吨；
                  </div>
                  超出按最后阶梯计算。
                <div class="show-tag"
                  slot="reference">
                  <el-tag>阶梯</el-tag>
                </div>
              </el-popover>
            </div>
          </div>
          <div v-else>暂无</div>
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

  export default {
    name: 'water-main',
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/water/index')
    },
    created() {
      this.getHouseList()
      this.getListRefresh()
      this.getResetAddWater()
      this.getResetCalWater()
    },
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
          haoId: [{ required: true, message: '请选择', trigger: 'change' }],
          water: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          addTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
        },

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
        const searchKeys = ['fanghao', 'remark']

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
              (theGap > (prevPrices || 0) && theGap <= item.step) ||
              (i === (arr.length - 1) && theGap >= item.step)) {
              result = theGap * item.price
            }
          })
          result = Math.round(result * 100) / 100
        }
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
    methods: {
      // 时间格式化
      getTime(t) {
        return t ? this.GetTimeFormat(t) : '--'
      },
      // 获取弹窗房屋列表
      async getHouseList() {
        await this.Ajax('/inner/house/list', {})
          .then(res => {
            this.houseData = res
          })
          .catch(() => {})
      },
      // 打开关闭添加弹窗
      getAddWaterDialog() {
        this.addWaterflag = !this.addWaterflag
        if (this.leaseInflag) this.addWater.addTime = new Date()
      },
      // 弹窗数据初始化
      getResetAddWater() {
        this.addWater = Object.assign({}, this.addWater, this.addWaterClear)
        this.addWater.addTime = new Date()
        this.dialogId = Date.now()
      },
      // 关闭弹窗回调
      onAddWaterDialogClose() {
        setTimeout(() => {
          this.$refs.addWater.resetFields()
          this.getResetAddWater()
        }, 500)
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
            this.getAddWaterDialog()
            this.getListRefresh()
          })
          .catch(() => {})

        this.gettingAddWater = false
      },
      // 拉取水费信息列表
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/water/mainList', {})
          .then(res => {
            this.waterData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      // 打开关闭计费弹窗
      getCalWaterDialog(index, row) {
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
            this.calWater.calWater =
              Object.assign({}, JSON.parse(JSON.stringify(this.defaultCalWaterPrice)))
            return
          }

          // 水费
          Object.keys(this.calWater.calWater).forEach(key => {
            if (
              this.calWater.calWater[key].constructor === Array &&
              row.leaseId[key]
            ) {
              this.calWater.calWater[key] =
                JSON.parse(JSON.stringify(row.leaseId[key]))
            } else if (row.leaseId[key]) {
              this.calWater.calWater[key] = row.leaseId[key]
            }
          })
          if (!this.calWater.calWater.stepPrice.length) this.addStep()
        }
      },
      // 计费弹窗数据初始化
      getResetCalWater() {
        this.calWater = Object.assign({}, JSON.parse(JSON.stringify(this.calWaterClear)))
        this.dialogId = Date.now()
      },
      // 关闭计费弹窗回调
      onCalWaterDialogClose() {
        setTimeout(() => {
          this.$refs.calWater.resetFields()
          this.getResetCalWater()
        }, 500)
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
            this.getCalWaterDialog()
            this.getListRefresh()
          })
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

<style lang="scss">
.water-main {
  // 弹窗样式
  .add-water-dialog {
    max-width: 400px;
    .el-input {
      max-width: 300px;
      width: 100%;
    }
    .el-select {
      width: 100%;
      max-width: 300px;
    }
  }
  // 弹窗样式
  .cal-water-dialog {
    max-width: 800px;
    .line {
      height: 14px;
    }
  }
}
</style>
