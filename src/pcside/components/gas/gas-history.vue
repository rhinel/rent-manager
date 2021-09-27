<template>
  <div class="gas-history">
    <el-tabs v-model="activeName">
      <!-- 抄表历史 -->
      <el-tab-pane
        label="抄表历史"
        name="gas">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            type="primary"
            :loading="gettingListRefresh"
            @click="getGasList">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="gasDataSearch"
              placeholder="搜索" />
          </div>
        </div>

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
            width="180" />
          <el-table-column
            prop="gas"
            label="抄表数(吨)"
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
            prop="createTime"
            label="创建时间"
            width="180">
            <template slot-scope="scope">
              {{ getTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-popover
                v-model="scope.row.dGasPopFlag"
                placement="top"
                width="150"
                trigger="click">
                <p>确认删除抄表记录吗？计费历史收费历史等将不受影响，仅影响当前数据</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dGasPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="delGas(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <div
                  slot="reference">
                  <el-button
                    size="small"
                    type="danger"
                    :loading="scope.row.gettingdelGas">
                    删除
                  </el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 计费历史 -->
      <el-tab-pane
        label="计费历史"
        name="gasCal">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            type="primary"
            :loading="gettingListRefresh2"
            @click="getGasCalList">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="gasCalDataSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 燃气费数据表 -->
        <el-table
          v-loading.body="gettingListRefresh2"
          class="gas-table"
          stripe
          border
          :max-height="tableMaxHeight"
          :data="filterGasCalData"
          ref="gasCalTable">
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="180" />
          <el-table-column
            label="今次(吨)">
            <el-table-column
              prop="tnew.gas"
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
            label="前次(吨)">
            <el-table-column
              prop="old.gas"
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
            label="小计(吨)"
            width="110" />
          <el-table-column
            label="计费">
            <el-table-column
              prop="calGasResult"
              label="计费"
              width="180">
              <template slot-scope="scope">
                <el-tag>
                  {{ scope.row.fix ? '修' : '计' }}
                </el-tag>
                ￥{{ scope.row.calGasResult }}元
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
                    {{ scope.row.calGas.minPrice }}
                    吨
                  </div>
                  <div v-if="scope.row.calGas.calType == 'single'">
                    单价：￥
                    {{ scope.row.calGas.singlePrice }}
                    元/吨
                  </div>
                  <div
                    class="history-step-p-wrap"
                    v-if="scope.row.calGas.calType == 'step'">
                    <div class="step-p-title">
                      阶梯：
                    </div>
                    <div class="step-p-val">
                      <div
                        v-for="(item, index) in scope.row.calGas.stepPrice"
                        :key="index">
                        阶梯{{ item.step }}吨及以下￥{{ item.price }}元/吨
                      </div>
                    </div>
                  </div>
                  <div v-if="scope.row.calGas.calType == 'step'">
                    超过最后一个阶梯的部分将按照最后一个阶梯计费
                  </div>
                  <div v-if="scope.row.fix">
                    本计费结果已被修正，计算方式仅供参考
                  </div>
                  <div
                    class="show-tag"
                    slot="reference">
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
                v-model="scope.row.dCalGasPopFlag"
                placement="top"
                width="150"
                trigger="click">
                <p>确认删除计费记录吗？抄表历史收费历史等将不受影响，仅影响当前数据</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dCalGasPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="delCalGas(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <div slot="reference">
                  <el-button
                    size="small"
                    type="danger"
                    :loading="scope.row.gettingdelCalGas">
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
    name: 'GasHistory',
    mixins: [mixinDef],
    data() {
      return {
        gettingListRefresh: false,
        gettingListRefresh2: false,
        activeName: 'gas',
        houseData: {},

        tableMaxHeight: 200,
        gasList: [],
        gasDataSearch: '',
        gasCalList: [],
        gasCalDataSearch: '',
      }
    },
    computed: {
      filterGasData() {
        if (!this.gasDataSearch) {
          return this.gasList
        }
        const searchKeys = ['fanghao', 'gas', 'remark']

        const _gasDataSearch = new RegExp(this.gasDataSearch, 'i')
        return this.gasList.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _gasDataSearch.test(testItem)
        })
      },
      filterGasCalData() {
        if (!this.gasCalDataSearch) {
          return this.gasCalList
        }
        const searchKeys = ['fanghao']

        const _gasCalDataSearch = new RegExp(this.gasCalDataSearch, 'i')
        return this.gasCalList.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _gasCalDataSearch.test(testItem)
        })
      },
    },
    watch: {
      activeName(n) {
        if (n === 'gas') this.getGasList()
        if (n === 'gasCal') this.getGasCalList()
      },
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/gas/index')
    },
    created() {
      if (this.activeName === 'gas') this.getGasList()
      if (this.activeName === 'gasCal') this.getGasCalList()
    },
    mounted() {
      window.onresize = () => {
        const height = window.innerHeight || document.body.clientHeight
        const offsetTop = this.$refs.gasTable.$el.getBoundingClientRect().top
        const offsetTopCal = this.$refs.gasCalTable.$el.getBoundingClientRect().top
        this.tableMaxHeight = height - Math.max(offsetTop, offsetTopCal) - 20 - 0.5
      }
      this.$nextTick(() => window.onresize())
    },
    beforeDestroy() {
      window.onresize = null
    },
    methods: {
      async getGasList() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/gas/list', { haoId: this.$route.query.haoid })
          .then(res => {
            this.gasList = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      async getGasCalList() {
        if (this.gettingListRefresh2) return

        // 请求接口
        this.gettingListRefresh2 = true

        await this.Ajax('/inner/gas/calList', { haoId: this.$route.query.haoid })
          .then(res => {
            this.gasCalList = res
          })
          .catch(() => {})

        this.gettingListRefresh2 = false
      },
      async delGas(index, row) {
        row.dGasPopFlag = false
        if (row.gettingdelGas) return

        // 请求接口
        row.gettingdelGas = true

        await this.Ajax('/inner/gas/del', {
          _id: row._id,
          haoId: row.haoId._id,
        })
          .then(() => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 2000,
            })
          })
          .then(this.getGasList)
          .catch(() => {})

        row.gettingdelGas = false
      },
      async delCalGas(index, row) {
        row.dCalGasPopFlag = false
        if (row.gettingdelCalGas) return

        // 请求接口
        row.gettingdelCalGas = true

        await this.Ajax('/inner/gas/delCal', {
          _id: row._id,
          haoId: row.haoId._id,
        })
          .then(() => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 2000,
            })
          })
          .then(this.getGasCalList)
          .catch(() => {})

        row.gettingdelCalGas = false
      },
    },
  }
</script>
