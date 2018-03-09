<template>
  <div class="electric-history">

    <el-tabs
      v-model="activeName">
      <el-tab-pane
        label="抄表历史"
        name="electric">

        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            :loading="gettingListRefresh"
            type="primary"
            @click="getElectricList">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="electricDataSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 电费数据表 -->
        <el-table
          v-loading.body="gettingListRefresh"
          ref="electricTable"
          :max-height="tableMaxHeight"
          :data="filterElectricData"
          class="electric-table"
          stripe
          border>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="180" />
          <el-table-column
            prop="electric"
            label="抄表数(度)"
            width="180" />
          <el-table-column
            prop="addTime"
            label="抄表时间"
            width="180">
            <template slot-scope="scope">
              {{ getTime(scope.row.addTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注" />
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-popover
                v-model="scope.row.dElectricPopFlag"
                placement="top"
                width="150"
                trigger="click">
                <p>确认删除抄表记录吗？计费历史收费历史等将不受影响，仅影响当前数据</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dElectricPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="delElectric(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <div
                  slot="reference">
                  <el-button
                    :loading="scope.row.gettingdelElectric"
                    size="small"
                    type="danger">
                    删除
                  </el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="计费历史"
        name="electricCal">

        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            :loading="gettingListRefresh2"
            type="primary"
            @click="getElectricCalList">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="electricCalDataSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 电费数据表 -->
        <el-table
          v-loading.body="gettingListRefresh2"
          ref="electricCalTable"
          :max-height="tableMaxHeight"
          :data="filterElectricCalData"
          class="electric-table"
          stripe
          border>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="180" />
          <el-table-column
            label="今次(度)">
            <el-table-column
              prop="tnew.electric"
              label="抄表数"
              width="100" />
            <el-table-column
              prop="tnew.addTime"
              label="抄表时间"
              width="180">
              <template slot-scope="scope">
                {{ getTime(scope.row.tnew.addTime) }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="前次(度)">
            <el-table-column
              prop="old.electric"
              label="底表数"
              width="100" />
            <el-table-column
              prop="old.addTime"
              label="底表时间"
              width="180">
              <template slot-scope="scope">
                {{ getTime(scope.row.old.addTime) }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            prop="gap"
            label="小计(度)"
            width="110" />
          <el-table-column
            label="计费">
            <el-table-column
              prop="calElectricResult"
              label="计费"
              width="180">
              <template slot-scope="scope">
                <el-tag>
                  {{ scope.row.fix ? '修' : '计' }}
                </el-tag>
                ￥{{ scope.row.calElectricResult }}元
              </template>
            </el-table-column>
            <el-table-column
              prop="addTime"
              label="计费时间"
              width="180">
              <template slot-scope="scope">
                {{ getTime(scope.row.addTime) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="remark"
              label="计费备注"
              min-width="180">
              <template slot-scope="scope">
                <el-popover
                  placement="right"
                  trigger="hover">
                  <div>
                    低消：
                    {{ scope.row.calElectric.minPrice }}
                    度
                  </div>
                  <div v-if="scope.row.calElectric.calType == 'single'">
                    单价：￥
                    {{ scope.row.calElectric.singlePrice }}
                    元/度
                  </div>
                  <div
                    v-if="scope.row.calElectric.calType == 'step'"
                    class="history-step-p-wrap">
                    <div class="step-p-title">
                      阶梯：
                    </div>
                    <div class="step-p-val">
                      <div
                        v-for="(item, index) in scope.row.calElectric.stepPrice"
                        :key="index">
                        阶梯{{ item.step }}度及以下￥{{ item.price }}元/度
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="scope.row.calElectric.calType == 'step'">
                    超过最后一个阶梯的部分将按照最后一个阶梯计费
                  </div>
                  <div
                    v-if="scope.row.fix">
                    本计费结果已被修正，计算方式仅供参考
                  </div>
                  <div
                    slot="reference"
                    class="show-tag">
                    <el-tag>计费方式</el-tag>
                  </div>
                </el-popover>
                {{ scope.row.remark }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-popover
                v-model="scope.row.dCalElectricPopFlag"
                placement="top"
                width="150"
                trigger="click">
                <p>确认删除计费记录吗？抄表历史收费历史等将不受影响，仅影响当前数据</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dCalElectricPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="delCalElectric(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <div
                  slot="reference">
                  <el-button
                    :loading="scope.row.gettingdelCalElectric"
                    size="small"
                    type="danger">
                    删除
                  </el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'ElectricHistory',
  mixins: [mixinDef],
  data() {
    return {
      gettingListRefresh: false,
      gettingListRefresh2: false,
      activeName: 'electric',
      houseData: {},

      tableMaxHeight: 200,
      electricList: [],
      electricDataSearch: '',
      electricCalList: [],
      electricCalDataSearch: '',
    }
  },
  computed: {
    filterElectricData() {
      if (!this.electricDataSearch) {
        return this.electricList
      }
      const searchKeys = ['fanghao', 'electric', 'remark']

      const _electricDataSearch = new RegExp(this.electricDataSearch, 'i')
      return this.electricList.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _electricDataSearch.test(testItem)
      })
    },
    filterElectricCalData() {
      if (!this.electricCalDataSearch) {
        return this.electricCalList
      }
      const searchKeys = ['fanghao', 'remark']

      const _electricCalDataSearch = new RegExp(this.electricCalDataSearch, 'i')
      return this.electricCalList.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _electricCalDataSearch.test(testItem)
      })
    },
  },
  watch: {
    activeName(n) {
      if (n === 'electric') this.getElectricList()
      if (n === 'electricCal') this.getElectricCalList()
    },
  },
  beforeCreate() {
    this.$store.dispatch('updateMenu', '/inner/electric/index')
  },
  created() {
    if (this.activeName === 'electric') this.getElectricList()
    if (this.activeName === 'electricCal') this.getElectricCalList()
  },
  mounted() {
    window.onresize = () => {
      const height = window.innerHeight || document.body.clientHeight
      const offsetTop = this.$refs.electricTable.$el.getBoundingClientRect().top
      const offsetTopCal = this.$refs.electricCalTable.$el.getBoundingClientRect().top
      this.tableMaxHeight = height - Math.max(offsetTop, offsetTopCal) - 20 - 0.5
    }
    this.$nextTick(() => window.onresize())
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    async getElectricList() {
      if (this.gettingListRefresh) return

      // 请求接口
      this.gettingListRefresh = true

      await this.Ajax('/inner/electric/list', { haoId: this.$route.query.haoid })
        .then(res => {
          this.electricList = res
        })
        .catch(() => {})

      this.gettingListRefresh = false
    },
    async getElectricCalList() {
      if (this.gettingListRefresh2) return

      // 请求接口
      this.gettingListRefresh2 = true

      await this.Ajax('/inner/electric/calList', { haoId: this.$route.query.haoid })
        .then(res => {
          this.electricCalList = res
        })
        .catch(() => {})

      this.gettingListRefresh2 = false
    },
    async delElectric(index, row) {
      row.dElectricPopFlag = false
      if (row.gettingdelElectric) return

      // 请求接口
      row.gettingdelElectric = true

      await this.Ajax('/inner/electric/del', {
        _id: row._id,
        haoId: row.haoId._id,
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 2000,
          })
          this.getElectricList()
        })
        .catch(() => {})

      row.gettingdelElectric = false
    },
    async delCalElectric(index, row) {
      row.dCalElectricPopFlag = false
      if (row.gettingdelCalElectric) return

      // 请求接口
      row.gettingdelCalElectric = true

      await this.Ajax('/inner/electric/delCal', {
        _id: row._id,
        haoId: row.haoId._id,
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 2000,
          })
          this.getElectricCalList()
        })
        .catch(() => {})

      row.gettingdelCalElectric = false
    },
  },
}
</script>
