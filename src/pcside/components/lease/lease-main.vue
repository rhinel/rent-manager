<template>
  <div class="lease-main">

    <el-tabs
      v-model="activeName">
      <el-tab-pane
        label="租住列表"
        name="leaseList">

        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            type="primary"
            @click="getListRefresh"
            :loading="gettingListRefresh">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="leaseDataSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 入住弹窗 -->
        <el-dialog
          custom-class="lease-in-dialog"
          :key="'leaseIn' + dialogId"
          :title="lease.fanghao + lidDialogTitle"
          :visible.sync="leaseInflag"
          top="50px"
          :close-on-click-modal="false"
          @close="onLeaseInDialogClose">
          <el-form
            :model="lease"
            ref="leaseIn"
            :rules="leaserules">
            <el-alert
              title="搬出入住/修改：计费信息初始化，必须为上次收租结束/空置处理结束/本次计费之前，用户自行确认"
              type="info" />
            <!-- 基本信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="租户姓名"
                  :label-width="lidLabelWidth"
                  prop="name">
                  <el-input
                    v-model="lease.name"
                    auto-complete="off"
                    placeholder="输入租户姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="联系方式"
                  :label-width="lidLabelWidth"
                  prop="call">
                  <el-input
                    v-model="lease.call"
                    auto-complete="off"
                    placeholder="输入租户联系方式" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="入住时间"
                  :label-width="lidLabelWidth"
                  prop="addTime">
                  <el-date-picker
                    v-model="lease.addTime"
                    type="datetime"
                    placeholder="输入入住时间"
                    style="width: 100%;"
                    :editable="false" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="租住周期"
                  :label-width="lidLabelWidth"
                  prop="leaserange">
                  <el-date-picker
                    v-model="lease.leaserange"
                    type="daterange"
                    placeholder="选择日期范围"
                    :picker-options="leasePickerOptions"
                    align="right"
                    :editable="false" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="交租时间"
                  :label-width="lidLabelWidth"
                  prop="payDay">
                  <el-select
                    v-model="lease.payDay"
                    placeholder="选择交租时间"
                    prop="payDay">
                    <el-option
                      v-for="n in 31"
                      :label="n + '日'"
                      :value="n"
                      :key="n" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="交租方式"
                  :label-width="lidLabelWidth"
                  prop="payType">
                  <el-select
                    v-model="lease.payType"
                    placeholder="选择交租方式">
                    <el-option
                      v-for="(item, index) in payTypeVal"
                      :label="item"
                      :value="index"
                      :key="index" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item
                  label="备注"
                  :label-width="lidLabelWidth">
                  <el-input
                    v-model="lease.remark"
                    auto-complete="off"
                    placeholder="备注" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 水费 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="水费低消"
                  :label-width="lidLabelWidth"
                  prop="calWaterPrice.minPrice">
                  <el-input
                    v-model.number="lease.calWaterPrice.minPrice"
                    auto-complete="off"
                    placeholder="输入最低消费">
                    <template slot="append">吨</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="水费方式"
                  :label-width="lidLabelWidth">
                  <el-radio
                    v-model="lease.calWaterPrice.calType"
                    label="single">
                    单一价格
                  </el-radio>
                  <el-radio
                    v-model="lease.calWaterPrice.calType"
                    label="step">
                    阶梯价格
                  </el-radio>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 单价水费计费 -->
            <el-form-item
              label="水费单价"
              key="watSingle"
              :label-width="lidLabelWidth"
              v-if="lease.calWaterPrice.calType == 'single'"
              prop="calWaterPrice.singlePrice"
              :rules="leaserules[`calWaterPrice.singlePrice`][0]">
              <el-col :span="24">
                <el-input
                  v-model.number="lease.calWaterPrice.singlePrice"
                  auto-complete="off"
                  placeholder="输入单价">
                  <template slot="prepend">￥</template>
                  <template slot="append">元/吨</template>
                </el-input>
              </el-col>
            </el-form-item>

            <!-- 水费阶梯计费 -->
            <div v-if="lease.calWaterPrice.calType == 'step'">
              <el-form-item
                v-for="(step, index) in lease.calWaterPrice.stepPrice"
                :label="'阶梯' + (index + 1)"
                :label-width="lidLabelWidth"
                :key="'calWaterPrice' + index"
                :ref="'calWaterPrice' + index"
                required>
                <el-col :span="10">
                  <el-form-item
                    :prop="'calWaterPrice.stepPrice.' + index + '.step'"
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
                <el-col
                  class="line"
                  :span="1" />
                <el-col :span="9">
                  <el-form-item
                    :prop="'calWaterPrice.stepPrice.' + index + '.price'"
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
                <el-col
                  class="line"
                  :span="1" />
                <el-col
                  class="step-btn"
                  :span="3">
                  <el-button
                    @click.prevent="removeStep(lease.calWaterPrice, step)">
                    删除
                  </el-button>
                </el-col>
              </el-form-item>
            </div>
            <el-form-item
              key="watStep"
              v-if="lease.calWaterPrice.calType == 'step'"
              :label-width="lidLabelWidth">
              <el-button
                type="primary"
                @click="addStep(lease.calWaterPrice)">
                新增阶梯
              </el-button>
            </el-form-item>

            <!-- 电费 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="电费低消"
                  :label-width="lidLabelWidth"
                  prop="calElePrice.minPrice">
                  <el-input
                    v-model.number="lease.calElePrice.minPrice"
                    auto-complete="off"
                    placeholder="输入最低消费">
                    <template slot="append">度</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="电费方式"
                  :label-width="lidLabelWidth">
                  <el-radio
                    v-model="lease.calElePrice.calType"
                    label="single">
                    单一价格
                  </el-radio>
                  <el-radio
                    v-model="lease.calElePrice.calType"
                    label="step">
                    阶梯价格
                  </el-radio>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 电费单价计费 -->
            <el-form-item
              label="电费单价"
              key="eleSingle"
              :label-width="lidLabelWidth"
              v-if="lease.calElePrice.calType == 'single'"
              prop="calElePrice.singlePrice"
              :rules="leaserules[`calElePrice.singlePrice`][0]">
              <el-col :span="24">
                <el-input
                  v-model.number="lease.calElePrice.singlePrice"
                  auto-complete="off"
                  placeholder="输入单价">
                  <template slot="prepend">￥</template>
                  <template slot="append">元/度</template>
                </el-input>
              </el-col>
            </el-form-item>

            <!-- 电费阶梯计费 -->
            <div v-if="lease.calElePrice.calType == 'step'">
              <el-form-item
                v-for="(step, index) in lease.calElePrice.stepPrice"
                :label="'阶梯' + (index + 1)"
                :label-width="lidLabelWidth"
                :key="'calElePrice' + index"
                :ref="'calElePrice' + index"
                required>
                <el-col :span="10">
                  <el-form-item
                    :prop="'calElePrice.stepPrice.' + index + '.step'"
                    :rules="{
                      type: 'number', required: true, message: '请填写', trigger: 'blur'
                    }">
                    <el-input
                      v-model.number="step.step"
                      auto-complete="off"
                      placeholder="本阶梯最大值">
                      <template slot="append">度</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col
                  class="line"
                  :span="1" />
                <el-col :span="9">
                  <el-form-item
                    :prop="'calElePrice.stepPrice.' + index + '.price'"
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
                <el-col
                  class="line"
                  :span="1" />
                <el-col
                  class="step-btn"
                  :span="3">
                  <el-button
                    @click.prevent="removeStep(lease.calElePrice, step)">
                    删除
                  </el-button>
                </el-col>
              </el-form-item>
            </div>
            <el-form-item
              key="eleStep"
              v-if="lease.calElePrice.calType == 'step'"
              :label-width="lidLabelWidth">
              <el-button
                type="primary"
                @click="addStep(lease.calElePrice)">
                新增阶梯
              </el-button>
            </el-form-item>

            <!-- 押金租金 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="押金"
                  :label-width="lidLabelWidth"
                  prop="deposit">
                  <el-input
                    v-model.number="lease.deposit"
                    auto-complete="off"
                    placeholder="输入押金">
                    <template slot="prepend">￥</template>
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item
                  label="租金(月)"
                  :label-width="lidLabelWidth"
                  prop="rent">
                  <el-input
                    v-model.number="lease.rent"
                    auto-complete="off"
                    placeholder="输入租金">
                    <template slot="prepend">￥</template>
                    <template slot="append">元/月</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div
            class="dialog-footer"
            slot="footer">
            <el-button
              @click="getLeaseInDialog"
              :loading="gettingLeaseIn">
              取消
            </el-button>
            <el-button
              type="primary"
              @click="getLeaseIn"
              :loading="gettingLeaseIn">
              确定
            </el-button>
          </div>
        </el-dialog>

        <!-- 搬出弹窗 -->
        <el-dialog
          custom-class="lease-out-dialog small"
          :key="'leaseOut' + dialogId"
          :title="out.fanghao + lodDialogTitle"
          :visible.sync="leaseOutflag"
          :close-on-click-modal="false"
          @close="onLeaseOutDialogClose">
          <el-form
            :model="out"
            ref="leaseOut"
            :rules="outrules">
            <el-alert
              title="确认已经结清所有费用？此行为不可撤销"
              type="info" />
            <el-form-item
              label="搬出时间"
              :label-width="lodLabelWidth"
              prop="outTime">
              <el-date-picker
                v-model="out.outTime"
                type="datetime"
                placeholder="输入搬出时间"
                style="width: 100%;"
                :editable="false" />
            </el-form-item>
          </el-form>
          <div
            class="dialog-footer"
            slot="footer">
            <el-button
              @click="getLeaseOutDialog"
              :loading="gettingLeaseOut">
              取消
            </el-button>
            <el-button
              type="primary"
              @click="getLeaseOut"
              :loading="gettingLeaseOut">
              确定
            </el-button>
          </div>
        </el-dialog>

        <!-- 租住数据表 -->
        <el-table
          class="lease-table"
          ref="leaseTable"
          :max-height="tableMaxHeight"
          :data="filterLeaseData"
          v-loading.body="gettingListRefresh"
          stripe
          border>
          <el-table-column
            type="expand">
            <template slot-scope="props">
              <el-form
                class="table-expand"
                label-position="left"
                inline>
                <el-form-item
                  prop="leaseId.name"
                  label="姓名/联系方式"
                  width="150">
                  <template>
                    {{ props.row.leaseId.name || '--' }}
                    /
                    {{ props.row.leaseId.call || '--' }}
                  </template>
                </el-form-item>
                <el-form-item
                  prop="leaseId.addTime"
                  label="入住时间"
                  width="180">
                  <template>
                    {{ getTime(props.row.leaseId.addTime) }}
                  </template>
                </el-form-item>
                <el-form-item
                  style="width: 100%;"
                  prop="leaseId.leaserange"
                  label="租住周期"
                  width="180">
                  <template>
                    {{ getTime(props.row.leaseId.leaserange && props.row.leaseId.leaserange[0]) }}
                    ~
                    {{ getTime(props.row.leaseId.leaserange && props.row.leaseId.leaserange[1]) }}
                  </template>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="120" />
          <el-table-column
            label="计费信息">
            <el-table-column
              label="水费"
              width="150">
              <template slot-scope="scope">

                <table-eandw-cal-price-view-item
                  :lease="scope.row.leaseId"
                  type="calWaterPrice" />

              </template>
            </el-table-column>
            <el-table-column
              label="电费"
              width="150">
              <template slot-scope="scope">

                <table-eandw-cal-price-view-item
                  :lease="scope.row.leaseId"
                  type="calElePrice" />

              </template>
            </el-table-column>
            <el-table-column
              label="当前租金/押金"
              width="170">
              <template slot-scope="scope">
                <div>
                  租金：￥
                  <span class="main-txt-highline">
                    {{ (scope.row.leaseId.rent || 0) }}
                  </span>
                  元/月
                </div>
                <div>
                  押金：￥
                  {{ scope.row.leaseId.deposit || 0 }}
                  元
                </div>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="租户信息">
            <el-table-column
              prop="leaseId.payDay"
              label="交租时间/交租方式"
              width="180">
              <template slot-scope="scope">
                <div>
                  {{
                    scope.row.leaseId.payDay
                      ? `每月${scope.row.leaseId.payDay}日`
                      : '--'
                  }}
                </div>
                <div>
                  {{ payTypeVal[scope.row.leaseId.payType] || '--' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="leaseId.remark"
              label="备注">
              <template slot-scope="scope">

                <table-rent-remark-item
                  :rent="scope.row.leaseId" />

              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="操作"
            width="235">
            <template slot-scope="scope">
              <el-button
                size="small"
                type="primary"
                @click="getLeaseHistory(scope.$index, scope.row)">
                历史
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="getLeaseInDialog(scope.$index, scope.row)">
                {{ scope.row.leaseId._id ? '修改' : '入住' }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                v-if="scope.row.leaseId._id"
                @click="getLeaseOutDialog(scope.$index, scope.row)">
                搬出
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="当前租金统计"
        name="leaseCount">

        <collapse-rent-count-item
          v-for="(fang, fangi) in leaseCount"
          :key="fangi"
          :fang="fang"
          :fangi="fangi"
          :active-rent-count="activeLeaseCount" />

        <el-alert
          v-if="!leaseData.length"
          title="暂无数据！请先处理入住状态"
          type="info"
          :closable="false" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mixinDef } from 'pcside/js/mixins'
import TableEandwCalPriceViewItem from 'pcside/common/table-eandw-cal-price-view-item'
import TableRentRemarkItem from 'pcside/common/table-rent-remark-item'
import CollapseRentCountItem from 'pcside/common/collapse-rent-count-item'

export default {
  name: 'LeaseMain',
  components: {
    TableEandwCalPriceViewItem,
    TableRentRemarkItem,
    CollapseRentCountItem,
  },
  mixins: [mixinDef],
  data() {
    // 校验周期时间选择器
    const validatePass = (rule, value, callback) => {
      if (value == null || value[0] == null || value[1] == null) {
        callback(new Error('请选择'))
      } else {
        callback()
      }
    }

    return {
      // tab index
      activeName: 'leaseList',

      // 列表数据
      gettingListRefresh: false,
      tableMaxHeight: 0,
      leaseData: [],
      leaseDataSearch: '',

      dialogId: Date.now(),
      // 入住弹窗
      lidDialogTitle: '入住',
      lidLabelWidth: '90px',
      leaseInflag: false,
      // 入住数据对象
      lease: {},
      leaseClear: {
        _id: '',
        haoId: '',
        fanghao: '',
        name: '',
        call: '',
        leaserange: [],
        payDay: new Date().getDate(),
        payType: 3,
        remark: '',

        calWaterPrice: {
          minPrice: 0,
          calType: 'single',
          singlePrice: 0,
          stepPrice: [{
            step: 0,
            price: 0,
          }],
        },

        calElePrice: {
          minPrice: 0,
          calType: 'single',
          singlePrice: 0,
          stepPrice: [{
            step: 0,
            price: 0,
          }],
        },

        rent: 0,
        deposit: 0,
        addTime: '',
      },
      leaserules: {
        name: [{ required: true, message: '请填写', trigger: 'blur' }],
        call: [{ required: true, message: '请填写', trigger: 'blur' }],
        leaserange: [{ required: true, validator: validatePass, trigger: 'change' }],
        payDay: [{
          required: true, message: '请选择', trigger: 'change', type: 'number',
        }],
        payType: [{
          type: 'number', required: true, message: '请选择', trigger: 'change',
        }],
        'calWaterPrice.minPrice': [{
          type: 'number', required: true, message: '请填写', trigger: 'blur',
        }],
        'calWaterPrice.singlePrice': [{
          type: 'number', required: true, message: '请填写', trigger: 'blur',
        }],
        'calElePrice.minPrice': [{
          type: 'number', required: true, message: '请填写', trigger: 'blur',
        }],
        'calElePrice.singlePrice': [{
          type: 'number', required: true, message: '请填写', trigger: 'blur',
        }],
        rent: [{
          type: 'number', required: true, message: '请填写', trigger: 'blur',
        }],
        deposit: [{
          type: 'number', required: true, message: '请填写', trigger: 'blur',
        }],
        addTime: [{
          type: 'date', required: true, message: '请填写', trigger: 'change',
        }],
      },

      leasePickerOptions: {
        shortcuts: [
          {
            text: '三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(end.getTime() + (3600 * 1000 * 24 * 90))
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '半年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(end.getTime() + (3600 * 1000 * 24 * 180))
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(end.getTime() + (3600 * 1000 * 24 * 365))
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },

      gettingLeaseIn: false,

      // 搬出弹窗
      lodDialogTitle: '搬出',
      lodLabelWidth: '90px',
      leaseOutflag: false,
      out: {
        _id: '',
        haoId: '',
        fanghao: '',
        outTime: '',
      },
      outrules: {
        outTime: [{
          type: 'date', required: true, message: '请填写', trigger: 'change',
        }],
      },
      gettingLeaseOut: false,

      leaseCount: {},
      activeLeaseCount: {},
    }
  },
  computed: {
    filterLeaseData() {
      if (!this.leaseDataSearch) {
        return this.leaseData
      }
      const searchKeys = ['fanghao', 'remark']

      const _leaseDataSearch = new RegExp(this.leaseDataSearch, 'i')
      return this.leaseData.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _leaseDataSearch.test(testItem)
      })
    },
    ...mapState({
      payTypeVal: state => state.config.payTypeVal,
      typesVal: state => state.config.typesVal,
      defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
      defaultCalElePrice: state => state.config.defaultCalElePrice,
      defaultStep: state => state.config.defaultStep,
    }),
  },
  watch: {
    activeName(n) {
      if (n === 'leaseList') {
        this.$nextTick(() => {
          window.onresize()
          this.leaseListActive()
        })
      }
      if (n === 'leaseCount') this.leaseCountActive()
    },
  },
  beforeCreate() {
    this.$store.dispatch('updateMenu', '/inner/lease/index')
  },
  created() {
    this.getLeaseInReset()
    if (this.activeName === 'leaseList') this.leaseListActive()
    if (this.activeName === 'leaseCount') this.leaseCountActive()
  },
  mounted() {
    window.onresize = () => {
      const height = window.innerHeight || document.body.clientHeight
      const offsetTop = this.$refs.leaseTable.$el.getBoundingClientRect().top
      this.tableMaxHeight = height - offsetTop - 20 - 0.5
    }
    this.$nextTick(() => window.onresize())
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    // 列表tab
    leaseListActive() {
      this.getListRefresh()
    },
    // 统计tab
    leaseCountActive() {
      this.getCalLeaseCount()
    },
    // 拉取入住信息列表
    async getListRefresh() {
      if (this.gettingListRefresh) return

      // 请求数据
      this.gettingListRefresh = true

      await this.Ajax('/inner/lease/mainList', {})
        .then(res => {
          this.leaseData = res
        })
        .catch(() => {})

      this.gettingListRefresh = false
    },
    // 去历史
    getLeaseHistory(index, row) {
      this.$router.push(`/inner/lease/history?haoid=${row._id}`)
    },
    // 入住弹窗
    getLeaseInDialog(index, row) {
      this.leaseInflag = !this.leaseInflag
      if (this.leaseInflag && row) {
        // 赋值信息字段
        if (!row.leaseId || !row.leaseId._id) {
          this.lidDialogTitle = '入住'
          this.lease._id = ''
        } else {
          this.lidDialogTitle = '修改'
          this.lease._id = row.leaseId._id
        }
        this.lease.haoId = row._id
        this.lease.fanghao = row.fanghao

        // 赋值简单字段
        const keys = [
          'name', 'call', 'leaserange', 'payDay',
          'payType', 'remark', 'rent', 'deposit',
        ]
        keys.forEach(key => {
          if (this.lease[key].constructor === Array && row.leaseId[key]) {
            this.lease[key] = JSON.parse(JSON.stringify(row.leaseId[key]))
          } else if (row.leaseId[key]) {
            this.lease[key] = row.leaseId[key]
          }
        })

        // 时间
        this.lease.addTime = (row.leaseId.addTime && new Date(row.leaseId.addTime)) || new Date()

        // 水费电费初始化
        if (!row.leaseId || !row.leaseId._id) {
          this.lease.calWaterPrice =
            Object.assign({}, JSON.parse(JSON.stringify(this.defaultCalWaterPrice)))
          this.lease.calElePrice =
            Object.assign({}, JSON.parse(JSON.stringify(this.defaultCalElePrice)))
          return
        }

        // 水费
        Object.keys(this.lease.calWaterPrice).forEach(key => {
          if (
            this.lease.calWaterPrice[key].constructor === Array &&
            row.leaseId.calWaterPrice[key]
          ) {
            this.lease.calWaterPrice[key] =
              JSON.parse(JSON.stringify(row.leaseId.calWaterPrice[key]))
          } else if (row.leaseId.calWaterPrice[key]) {
            this.lease.calWaterPrice[key] = row.leaseId.calWaterPrice[key]
          }
        })
        if (!this.lease.calWaterPrice.stepPrice.length) this.addStep(this.lease.calWaterPrice)

        // 电费
        Object.keys(this.lease.calElePrice).forEach(key => {
          if (
            this.lease.calElePrice[key].constructor === Array &&
            row.leaseId.calElePrice[key]
          ) {
            this.lease.calElePrice[key] =
              JSON.parse(JSON.stringify(row.leaseId.calElePrice[key]))
          } else if (row.leaseId.calElePrice[key]) {
            this.lease.calElePrice[key] = row.leaseId.calElePrice[key]
          }
        })
        if (!this.lease.calElePrice.stepPrice.length) this.addStep(this.lease.calElePrice)
      }
    },
    // 数据初始化
    getLeaseInReset() {
      this.lease = Object.assign({}, JSON.parse(JSON.stringify(this.leaseClear)))
      this.dialogId = Date.now()
    },
    // 关闭弹窗
    onLeaseInDialogClose() {
      setTimeout(() => {
        this.$refs.leaseIn.resetFields()
        this.getLeaseInReset()
      }, 500)
    },
    // 添加步骤
    addStep(wrap) {
      const step = Object.assign({}, JSON.parse(JSON.stringify(this.defaultStep)))
      wrap.stepPrice.push(step)
    },
    // 删除步骤
    removeStep(wrap, step) {
      const index = wrap.stepPrice.indexOf(step)
      if (index !== -1) {
        wrap.stepPrice.splice(index, 1)
      }
    },
    // 入住，修改
    async getLeaseIn() {
      if (this.gettingLeaseIn) return

      // 表单校验
      try {
        await this.$refs.leaseIn.validate()
      } catch (err) {
        return
      }

      // 提交接口
      this.gettingLeaseIn = true

      const _data = Object.assign({}, this.lease)
      await this.Ajax('/inner/lease/in', _data)
        .then(() => {
          this.$message({
            type: 'success',
            message: this.lease._id ? '修改成功' : '添加成功',
            duration: 2000,
          })
          this.getLeaseInDialog()
          this.getListRefresh()
        })
        .catch(() => {})

      this.gettingLeaseIn = false
    },
    getLeaseOutDialog(index, row) {
      this.leaseOutflag = !this.leaseOutflag
      if (this.leaseOutflag && row) {
        this.out.haoId = row._id
        this.out.fanghao = row.fanghao
        this.out._id = row.leaseId._id
        this.out.outTime = new Date()
      }
    },
    onLeaseOutDialogClose() {
      setTimeout(() => {
        this.$refs.leaseOut.resetFields()
        this.dialogId = Date.now()
      }, 500)
    },
    async getLeaseOut() {
      if (this.gettingLeaseOut) return

      // 表单校验
      try {
        await this.$refs.leaseOut.validate()
      } catch (err) {
        return
      }

      // 提交接口
      this.gettingLeaseOut = true

      await this.Ajax('/inner/lease/out', this.out)
        .then(() => {
          this.$message({
            type: 'success',
            message: '退租成功',
            duration: 2000,
          })
          this.getLeaseOutDialog()
          this.getListRefresh()
        })

      this.gettingLeaseOut = false
    },
    // 计算月租统计
    getCalLeaseCount() {
      this.leaseCount = {}
      this.activeLeaseCount = {}
      this.leaseData.forEach((lease) => {
        const floor = lease.hao.substr(0, 1)
        const rent = lease.leaseId.rent || 0
        if (!this.leaseCount[lease.fang]) {
          this.leaseCount[lease.fang] = {
            count: 0,
            list: {},
          }
          this.activeLeaseCount[lease.fang] = []
        }

        if (!this.leaseCount[lease.fang].list[floor]) {
          this.leaseCount[lease.fang].list[floor] = {
            count: 0,
            list: [],
          }
        }

        this.leaseCount[lease.fang].count += rent
        this.leaseCount[lease.fang].list[floor].count += rent
        this.leaseCount[lease.fang].list[floor].list.push({
          haoId: lease._id,
          hao: lease.hao,
          rent,
        })
      })
    },
  },
}
</script>

<style lang="scss">
.lease-main {
  /* 弹窗样式 */
  .lease-in-dialog {
    .el-date-editor--daterange.el-input__inner {
      width: 100%;
    }

    .el-select {
      width: 100%;
    }
  }
}
</style>
