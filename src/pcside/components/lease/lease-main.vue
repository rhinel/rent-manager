<style lang="scss">
  .lease-main{
    .table-btn{
      margin-bottom: 20px;
    }
    .table-btn-input{
      max-width: 300px;
      display: inline-block;
      margin-left: 10px;
    }
    .lease-in-dialog{
      max-width: 800px;
      .el-date-editor--daterange.el-input{
        width: 100%;
      }
      .el-select{
        width: 100%;
      }
      .line{
        height: 14px;
      }
    }
    .lease-show-tag{
      display: inline-block;
      cursor: pointer;
      &.pop{
        margin-left: 10px;
      }
    }
    .lease-remark-tag{
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .lease-out-dialog{
      max-width: 400px;
    }
    .lease-count-title:not(:first-child){
      padding-top: 20px;
    }
  }
  .lease-list-lease-o-pop-cont{
    text-align: right;
    margin: 0;
  }
  .lease-remark{
    max-width: 300px;
  }
</style>

<template>
  <div class="lease-main">

  <el-tabs v-model="activeName">
      <el-tab-pane label="租住列表" name="leaseList">

        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
          <div class="table-btn-input">
            <el-input v-model="leaseDataSearch" placeholder="搜索"></el-input>
          </div>
        </div>

        <!-- 入住弹窗 -->
        <el-dialog :title="lease.fanghao + lidDialogTitle" v-model="leaseInflag" size="large" top="50px" custom-class="lease-in-dialog" :close-on-click-modal="false" @before-close="onLeaseInDialogClose">
          <el-form :model="lease" ref="leaseIn" :rules="leaserules">
            <el-form-item>
              <el-alert title="搬出入住/修改：计费信息初始化，必须为上次收租结束/空置处理结束/本次计费之前，用户自行确认" type="info"></el-alert>
            </el-form-item>
            <!-- 基本信息 -->
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="租户姓名" :label-width="lidLabelWidth" prop="name">
                  <el-input v-model="lease.name" auto-complete="off" placeholder="输入租户姓名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系方式" :label-width="lidLabelWidth" prop="call">
                  <el-input v-model="lease.call" auto-complete="off" placeholder="输入租户联系方式"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="租住周期" :label-width="lidLabelWidth" prop="leaserange">
                  <el-date-picker v-model="lease.leaserange" type="daterange" placeholder="选择日期范围" :picker-options="leasePickerOptions" align="right" :editable="false"></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="交租时间" :label-width="lidLabelWidth" prop="payDay">
                  <el-select v-model="lease.payDay" placeholder="选择交租时间" prop="payDay">
                    <el-option v-for="n in 31" :label="n + '日'" :value="n" :key="n"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="交租方式" :label-width="lidLabelWidth" prop="payType">
                  <el-select v-model="lease.payType" placeholder="选择交租方式">
                    <el-option v-for="(item, index) in payTypeVal" :label="item" :value="index" :key="index"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="备注" :label-width="lidLabelWidth">
                  <el-input v-model="lease.remark" auto-complete="off" placeholder="备注"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 水费 -->
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="水费低消" :label-width="lidLabelWidth" prop="calWaterPrice.minPrice">
                  <el-input v-model.number="lease.calWaterPrice.minPrice" auto-complete="off" placeholder="输入最低消费"><template slot="append">吨</template></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item label="水费方式" :label-width="lidLabelWidth">
                  <el-radio v-model="lease.calWaterPrice.calType" label="single">单一价格</el-radio>
                  <el-radio v-model="lease.calWaterPrice.calType" label="step">阶梯价格</el-radio>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 单价计费 -->
            <el-form-item label="水费单价" :label-width="lidLabelWidth" v-if="lease.calWaterPrice.calType == 'single'" prop="calWaterPrice.singlePrice">
              <el-col :span="13">
                <el-input v-model.number="lease.calWaterPrice.singlePrice" auto-complete="off" placeholder="输入单价"><template slot="prepend">￥</template><template slot="append">元/吨</template></el-input>
              </el-col>
            </el-form-item>
            <!-- 阶梯计费 -->
            <el-form-item
              v-if="lease.calWaterPrice.calType == 'step'"
              v-for="(step, index) in lease.calWaterPrice.stepPrice"
              :label="'阶梯' + (index + 1)"
              :label-width="lidLabelWidth"
              :key="'calWaterPrice' + index"
              :ref="'calWaterPrice' + index"
              required>
              <el-col :span="5">
                <el-form-item :prop="'calWaterPrice.stepPrice.' + index + '.step'"
                  :rules="{
                    type: 'number', required: true, message: '请填写', trigger: 'blur'
                  }">
                  <el-input v-model.number="step.step" auto-complete="off" placeholder="本阶梯最大值"><template slot="append">吨</template></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="1"></el-col>
              <el-col :span="5">
                <el-form-item :prop="'calWaterPrice.stepPrice.' + index + '.price'"
                  :rules="{
                    type: 'number', required: true, message: '请填写', trigger: 'blur'
                  }">
                  <el-input v-model.number="step.price" auto-complete="off" placeholder="本阶梯单价"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="1"></el-col>
              <el-col :span="5">
                <el-button  @click.prevent="removeStep(lease.calWaterPrice, step)">删除</el-button>
              </el-col>
            </el-form-item>
            <el-form-item v-if="lease.calWaterPrice.calType == 'step'" :label-width="lidLabelWidth">
              <el-button type="primary" @click="addStep(lease.calWaterPrice)">新增阶梯</el-button>
            </el-form-item>

            <!-- 电费 -->
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="电费低消" :label-width="lidLabelWidth" prop="calElePrice.minPrice">
                  <el-input v-model.number="lease.calElePrice.minPrice" auto-complete="off" placeholder="输入最低消费"><template slot="append">度</template></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item label="电费方式" :label-width="lidLabelWidth">
                  <el-radio v-model="lease.calElePrice.calType" label="single">单一价格</el-radio>
                  <el-radio v-model="lease.calElePrice.calType" label="step">阶梯价格</el-radio>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 单价计费 -->
            <el-form-item label="电费单价" :label-width="lidLabelWidth" v-if="lease.calElePrice.calType == 'single'" prop="calElePrice.singlePrice">
              <el-col :span="13">
                <el-input v-model.number="lease.calElePrice.singlePrice" auto-complete="off" placeholder="输入单价"><template slot="prepend">￥</template><template slot="append">元/度</template></el-input>
              </el-col>
            </el-form-item>
            <!-- 阶梯计费 -->
            <el-form-item
              v-if="lease.calElePrice.calType == 'step'"
              v-for="(step, index) in lease.calElePrice.stepPrice"
              :label="'阶梯' + (index + 1)"
              :label-width="lidLabelWidth"
              :key="'calElePrice' + index"
              :ref="'calElePrice' + index"
              required>
              <el-col :span="5">
                <el-form-item :prop="'calElePrice.stepPrice.' + index + '.step'"
                  :rules="{
                    type: 'number', required: true, message: '请填写', trigger: 'blur'
                  }">
                  <el-input v-model.number="step.step" auto-complete="off" placeholder="本阶梯最大值"><template slot="append">度</template></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="1"></el-col>
              <el-col :span="5">
                <el-form-item :prop="'calElePrice.stepPrice.' + index + '.price'"
                  :rules="{
                    type: 'number', required: true, message: '请填写', trigger: 'blur'
                  }">
                  <el-input v-model.number="step.price" auto-complete="off" placeholder="本阶梯单价"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="1"></el-col>
              <el-col :span="5">
                <el-button  @click.prevent="removeStep(lease.calElePrice, step)">删除</el-button>
              </el-col>
            </el-form-item>
            <el-form-item v-if="lease.calElePrice.calType == 'step'" :label-width="lidLabelWidth">
              <el-button type="primary" @click="addStep(lease.calElePrice)">新增阶梯</el-button>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="押金" :label-width="lidLabelWidth" prop="deposit">
                  <el-input v-model.number="lease.deposit" auto-complete="off" placeholder="输入押金"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="租金(月)" :label-width="lidLabelWidth" prop="rent">
                  <el-input v-model.number="lease.rent" auto-complete="off" placeholder="输入租金"><template slot="prepend">￥</template><template slot="append">元/月</template></el-input>
                </el-form-item>
              </el-col>         <el-col :span="9">
                <el-form-item label="入住时间" :label-width="lidLabelWidth" prop="addTime">
                  <el-date-picker v-model="lease.addTime" type="datetime" placeholder="输入入住时间" style="width: 100%;" :editable="false"></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="getLeaseInDialog" :loading="gettingLeaseIn">取消</el-button>
            <el-button type="primary" @click="getLeaseIn" :loading="gettingLeaseIn">确定</el-button>
          </div>
        </el-dialog>

        <!-- 搬出弹窗 -->
        <el-dialog :title="out.fanghao + lodDialogTitle" v-model="leaseOutflag" size="small" custom-class="lease-out-dialog" :close-on-click-modal="false" @close="onLeaseOutDialogClose">
          <el-form :model="out" ref="leaseOut" :rules="outrules">
            <el-form-item>
              <el-alert title="确认已经结清所有费用？此行为不可撤销" type="info"></el-alert>
            </el-form-item>
            <el-form-item label="搬出时间" :label-width="lodLabelWidth" prop="outTime">
              <el-date-picker v-model="out.outTime" type="datetime" placeholder="输入搬出时间" style="width: 100%; max-width: 300px;" :editable="false"></el-date-picker>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="getLeaseOutDialog" :loading="gettingLeaseOut">取消</el-button>
            <el-button type="primary" @click="getLeaseOut" :loading="gettingLeaseOut">确定</el-button>
          </div>
        </el-dialog>
        
        <!-- 租住数据表 -->
        <el-table
          class="lease-table"
          :data="filterLeaseData"
          v-loading.body="gettingListRefresh"
          stripe
          border>
          <el-table-column type="expand">
            <template scope="props">
              <el-form label-position="left" inline class="table-expand">
                <el-form-item
                  prop="leaseId.name"
                  label="姓名/联系方式"
                  width="150">
                  <template>
                    <div>{{ props.row.leaseId.name || '--' }} / {{ props.row.leaseId.call || '--' }}</div>
                  </template>
                </el-form-item>
                <el-form-item
                  prop="leaseId.addTime"
                  label="入住时间"
                  width="180">
                  <template>
                    <div>{{ getTime(props.row.leaseId.addTime) }}</div>
                  </template>
                </el-form-item>
                <el-form-item
                  style="width: 100%;"
                  prop="leaseId.leaserange"
                  label="租住周期"
                  width="180">
                  <template>
                    <div>{{ getTime(props.row.leaseId.leaserange && props.row.leaseId.leaserange[0]) }} ~ {{ getTime(props.row.leaseId.leaserange && props.row.leaseId.leaserange[1]) }}</div>
                  </template>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="120"
            sortable>
          </el-table-column>
          <el-table-column
            label="计费信息">
            <el-table-column
              label="水费"
              width="150">
              <template scope="scope">
                <div v-if="scope.row.leaseId.calWaterPrice">
                  <div>低消：{{ scope.row.leaseId.calWaterPrice.minPrice }}吨</div>
                  <div v-if="scope.row.leaseId.calWaterPrice.calType == 'single'">
                    单价：￥{{ scope.row.leaseId.calWaterPrice.singlePrice }}元/吨
                  </div>
                  <div v-else>
                    <el-popover
                      placement="right"
                      trigger="hover">
                      <div v-for="item in scope.row.leaseId.calWaterPrice.stepPrice">{{item.step}}吨及以下￥{{item.price}}元/吨；</div>超出按最后阶梯计算。
                      <div slot="reference" class="lease-show-tag">
                        <el-tag>阶梯</el-tag>
                      </div>
                    </el-popover>
                  </div>
                </div>
                <div v-else>暂无</div>
              </template>
            </el-table-column>
            <el-table-column
              label="电费"
              width="150">
              <template scope="scope">
                <div v-if="scope.row.leaseId.calElePrice">
                  <div>低消：{{ scope.row.leaseId.calElePrice.minPrice }}度</div>
                  <div v-if="scope.row.leaseId.calElePrice.calType == 'single'">
                    单价：￥{{ scope.row.leaseId.calElePrice.singlePrice }}元/度
                  </div>
                  <div v-else>
                    <el-popover
                      placement="right"
                      trigger="hover">
                      <div v-for="item in scope.row.leaseId.calElePrice.stepPrice">{{item.step}}度及以下￥{{item.price}}元/度；</div>超出按最后阶梯计算。
                      <div slot="reference" class="lease-show-tag">
                        <el-tag>阶梯</el-tag>
                      </div>
                    </el-popover>
                  </div>
                </div>
                <div v-else>暂无</div>
              </template>
            </el-table-column>
            <el-table-column
              label="当前租金/押金"
              width="170">
              <template scope="scope">
              <div>{{ '租金：￥' }}<span class="main-txt-highline">{{(scope.row.leaseId.rent || 0)}}</span>{{ '元/月' }}</div>
                <div>{{ '押金：￥' + (scope.row.leaseId.deposit || 0) + '元' }}</div>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="租户信息">
            <el-table-column
              prop="leaseId.payDay"
              label="交租时间/交租方式"
              width="180">
              <template scope="scope">
                <div>{{ scope.row.leaseId.payDay ? ('每月' + scope.row.leaseId.payDay + '日') : '--' }}</div>
                <div>{{ payTypeVal[scope.row.leaseId.payType] || '--' }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="leaseId.remark"
              label="备注">
              <template scope="scope">
                <el-popover
                  placement="top"
                  trigger="hover">
                  <div class="lease-remark">{{ scope.row.leaseId.remark }}</div>
                  <div slot="reference" class="lease-show-tag">
                    <div class="lease-remark-tag">{{ scope.row.leaseId.remark }}</div>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="操作"
            width="230">
            <template scope="scope">
              <el-button
                size="small"
                type="primary"
                @click="getLeaseHistory(scope.$index, scope.row)">历史</el-button>
              <el-button
                size="small"
                type="primary"
                @click="getLeaseInDialog(scope.$index, scope.row)">{{ scope.row.leaseId._id ? '修改' : '入住' }}</el-button>
              <el-button
                size="small"
                type="danger"
                v-if="scope.row.leaseId._id"
                @click="getLeaseOutDialog(scope.$index, scope.row)">搬出</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>
      <el-tab-pane label="当前租金统计" name="leaseCount">

        <template v-for="(fang, fangi) in leaseCount">
          <div class="lease-count-title">
            <el-alert type="info" title="" class="table-btn" :closable="false">
              {{fangi}} 合计：￥{{fang.count}}元
            </el-alert>           
          </div>
          <el-collapse v-model="activeLeaseCount[fangi]">
            <el-collapse-item v-for="(floor, floori) in fang.list" :name="floori" :key="floori">
              <template slot="title">
                  {{floori}}楼 <span class="count-title">合计：￥{{floor.count}}元</span>
                </template>
                <div v-for="(hao, haoi) in floor.list">
                  <router-link class="tag-bf-span" :to="{ path: '/inner/rent/history', query: { id: hao.haoId }}">
                  <el-button type="text">[{{fangi + hao.hao}}]</el-button>
                </router-link>
                <span>租金：￥{{hao.rent}}元</span>
                </div>
            </el-collapse-item>
          </el-collapse>
        </template>
        <el-alert v-if="!checkObject(leaseCount)" title="暂无数据！请先处理单据状态" type="info" :closable="false"></el-alert>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    name: 'lease-main',
    beforeCreate () {
      this.$store.dispatch('updateMenu', '/inner/lease/index')
    },
    created () {
      this.activeName === 'leaseList' && this.leaseListActive()
      this.activeName === 'leaseCount' && this.leaseCountActive()
    },
    data () {
      let validatePass = (rule, value, callback) => {
        if (value[0] == null || value[1] == null) {
          callback(new Error('请选择'))
        } else {
          callback()
        }
      }

      return {
        activeName: 'leaseList',

        gettingListRefresh: false,
        leaseData: [],
        leaseDataSearch: '',

        lidDialogTitle: '入住',
        lidLabelWidth: '90px',
        leaseInflag: false,
        lease: {
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
              price: 0
            }]
          },
          calElePrice: {
            minPrice: 0,
            calType: 'single',
            singlePrice: 0,
            stepPrice: [{
              step: 0,
              price: 0
            }]
          },

          rent: 0,
          deposit: 0,
          addTime: ''
        },
        leaserules: {
          'name': [{ required: true, message: '请填写', trigger: 'blur' }],
          'call': [{ required: true, message: '请填写', trigger: 'blur' }],
          'leaserange': [{ required: true, validator: validatePass, trigger: 'change' }],
          'payDay': [{ type: 'number', required: true, message: '请选择', trigger: 'change' }],
          'payType': [{ type: 'number', required: true, message: '请选择', trigger: 'change' }],
          'calWaterPrice.minPrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
          'calWaterPrice.singlePrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
          'calElePrice.minPrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
          'calElePrice.singlePrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
          'rent': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
          'deposit': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
          'addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }]
        },
        leasePickerOptions: {
          shortcuts: [
            {
              text: '三个月',
              onClick (picker) {
                const end = new Date()
                const start = new Date()
                end.setTime(end.getTime() + 3600 * 1000 * 24 * 90)
                picker.$emit('pick', [start, end])
              }
            },
            {
              text: '半年',
              onClick (picker) {
                const end = new Date()
                const start = new Date()
                end.setTime(end.getTime() + 3600 * 1000 * 24 * 180)
                picker.$emit('pick', [start, end])
              }
            },
            {
              text: '一年',
              onClick (picker) {
                const end = new Date()
                const start = new Date()
                end.setTime(end.getTime() + 3600 * 1000 * 24 * 365)
                picker.$emit('pick', [start, end])
              }
            }
          ]
        },
        defaultCalWaterPrice: {
          minPrice: 6,
          calType: 'single',
          singlePrice: 6,
          stepPrice: [{
            step: 0,
            price: 0
          }]
        },
        defaultCalElePrice: {
          minPrice: 30,
          calType: 'step',
          singlePrice: 1,
          stepPrice: [{
            step: 100,
            price: 1
          },
          {
            step: 200,
            price: 1.2
          },
          {
            step: 201,
            price: 1.4
          }]
        },
        gettingLeaseIn: false,
        editLeaseId: '',

        lodDialogTitle: '搬出',
        lodLabelWidth: '90px',
        leaseOutflag: false,
        out: {
          _id: '',
          haoId: '',
          fanghao: '',
          outTime: ''
        },
        outrules: {
          'outTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }]
        },
        gettingLeaseOut: false,

        leaseCount: {},
        activeLeaseCount: {}
      }
    },
    watch: {
      activeName (n, o) {
        n === 'leaseList' && this.leaseListActive()
        n === 'leaseCount' && this.leaseCountActive()
      }
    },
    computed: {
      filterLeaseData () {
        if (!this.leaseDataSearch) {
          return this.leaseData
        } else {
          let _leaseDataSearch = new RegExp(this.leaseDataSearch, 'i')
          return this.leaseData.filter((item) => {
            for (var i in item) {
              if (i !== 'fanghao' && i !== 'remark') {
                continue
              } else if (String(item[i]).match(_leaseDataSearch)) {
                return true
              }
            }
            return false
          })
        }
      },
      payTypeVal () {
        return this.$store.state.default.payTypeVal
      },
      typesVal () {
        return this.$store.state.default.typesVal
      }
    },
    methods: {
      leaseListActive () {
        this.getListRefresh()
      },
      leaseCountActive () {
        this.getCalLeaseCount()
      },
      // 拉取入住信息列表
      getListRefresh () {
        if (this.gettingListRefresh) {
          return true
        }
        this.gettingListRefresh = true
        this.Ajax('/inner/lease/mainList', {}, (res) => {
          this.leaseData = res.body.data
          this.gettingListRefresh = false
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
          this.gettingListRefresh = false
        })
      },
      // 时间格式化
      getTime (t) {
        return t ? this.GetTimeFormat(t) : '--'
      },
      getLeaseHistory (index, row) {
        this.$router.push('/inner/lease/history?haoid=' + row._id)
      },
      getLeaseInDialog (index, row) {
        let setDefault = (leng, def) => {
          let lengs = leng.split('.')
          let check = row
          for (var i in lengs) {
            if (check[lengs[i]] === undefined || check[lengs[i]] === null) {
              return def
            } else {
              check = check[lengs[i]]
            }
          }
          return check
        }
        this.leaseInflag = !this.leaseInflag
        setTimeout(() => {
          if (this.leaseInflag && row) {
            this.lidDialogTitle = row.leaseId && row.leaseId._id ? '修改' : '入住'
            this.editLeaseId = (row.leaseId && row.leaseId._id) || ''

            this.lease.haoId = row._id
            this.lease.fanghao = row.fanghao

            this.lease.name = setDefault('leaseId.name', '')
            this.lease.call = setDefault('leaseId.call', '')
            this.lease.leaserange = setDefault('leaseId.leaserange', ['', ''])
            this.lease.payDay = setDefault('leaseId.payDay', new Date().getDate())
            this.lease.payType = setDefault('leaseId.payType', 3)
            this.lease.remark = setDefault('leaseId.remark', '')
            this.lease.rent = setDefault('leaseId.rent', 0)
            this.lease.deposit = setDefault('leaseId.deposit', 0)
            this.lease.addTime = (row.leaseId.addTime && new Date(row.leaseId.addTime)) || new Date()
            // calWater
            this.lease.calWaterPrice.minPrice = setDefault('leaseId.calWaterPrice.minPrice', this.defaultCalWaterPrice.minPrice)
            this.lease.calWaterPrice.calType = setDefault('leaseId.calWaterPrice.calType', this.defaultCalWaterPrice.calType)
            this.lease.calWaterPrice.singlePrice = setDefault('leaseId.calWaterPrice.singlePrice', this.defaultCalWaterPrice.singlePrice)
            this.lease.calWaterPrice.stepPrice = setDefault('leaseId.calWaterPrice.stepPrice', JSON.parse(JSON.stringify(this.defaultCalWaterPrice.stepPrice)))
            !this.lease.calWaterPrice.stepPrice.length && this.addStep(this.lease.calWaterPrice)
            // calEle
            this.lease.calElePrice.minPrice = setDefault('leaseId.calElePrice.minPrice', this.defaultCalElePrice.minPrice)
            this.lease.calElePrice.calType = setDefault('leaseId.calElePrice.calType', this.defaultCalElePrice.calType)
            this.lease.calElePrice.singlePrice = setDefault('leaseId.calElePrice.singlePrice', this.defaultCalElePrice.singlePrice)
            this.lease.calElePrice.stepPrice = setDefault('leaseId.calElePrice.stepPrice', JSON.parse(JSON.stringify(this.defaultCalElePrice.stepPrice)))
            !this.lease.calElePrice.stepPrice.length && this.addStep(this.lease.calElePrice)
          }
        }, 0)
      },
      onLeaseInDialogClose () {
        this.$refs.leaseIn.resetFields()
      },
      // 添加步骤
      addStep (wrap) {
        wrap.stepPrice.push({
          step: 0,
          price: 0
        })
      },
      // 删除步骤
      removeStep (wrap, step) {
        let index = wrap.stepPrice.indexOf(step)
        if (index !== -1) {
          wrap.stepPrice.splice(index, 1)
        }
      },
      // 入住，修改
      getLeaseIn () {
        if (this.gettingLeaseIn) {
          return true
        }
        this.gettingLeaseIn = true
        this.$refs.leaseIn.validate((valid) => {
          if (valid) {
            let _data = Object.assign({}, this.lease)
            this.editLeaseId && (_data._id = this.editLeaseId)
            this.Ajax('/inner/lease/in', _data, (res) => {
              this.$message({
                type: 'success',
                message: this.editLeaseId ? '修改成功' : '添加成功',
                duration: 2000
              })
              this.getLeaseInDialog()
              this.gettingLeaseIn = false
              this.getListRefresh()
            }, (res) => {
              this.$message({
                type: 'error',
                message: '编号：' + res.body.code + '，' + res.body.msg,
                duration: 2000
              })
              this.gettingLeaseIn = false
            })
          } else {
            this.gettingLeaseIn = false
          }
        })
      },
      getLeaseOutDialog (index, row) {
        this.leaseOutflag = !this.leaseOutflag
        if (this.leaseOutflag && row) {
          this.out.haoId = row._id
          this.out.fanghao = row.fanghao
          this.out._id = row.leaseId._id
          this.out.outTime = new Date()
        }
      },
      onLeaseOutDialogClose () {
        this.$refs.leaseOut.resetFields()
      },
      getLeaseOut () {
        if (this.gettingLeaseOut) {
          return true
        }
        this.gettingLeaseOut = true
        this.Ajax('/inner/lease/out', this.out, (res) => {
          this.$message({
            type: 'success',
            message: '退租成功',
            duration: 2000
          })
          this.getLeaseOutDialog()
          this.gettingLeaseOut = false
          this.getListRefresh()
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
          this.gettingLeaseOut = false
        })
      },
      getCalLeaseCount () {
        this.leaseCount = {}
        this.activeLeaseCount = {}
        this.leaseData.forEach((i) => {
          let floor = i.hao.substr(0, 1)
          let rent = i.leaseId.rent || 0
          !this.leaseCount[i.fang] && (this.leaseCount[i.fang] = {
            count: 0,
            list: {}
          }) && (this.activeLeaseCount[i.fang] = [])
          !this.leaseCount[i.fang].list[floor] && (this.leaseCount[i.fang].list[floor] = {
            count: 0,
            list: []
          })
          this.leaseCount[i.fang].count += rent
          this.leaseCount[i.fang].list[floor].count += rent
          this.leaseCount[i.fang].list[floor].list.push({
            haoId: i._id,
            hao: i.hao,
            rent: rent
          })
        })
      },
      checkObject (val) {
        if (typeof val !== 'object') {
          return false
        }
        for (var i in val) {
          return true
        }
        return false
      }
    }
  }
</script>
