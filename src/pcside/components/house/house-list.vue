<template>
  <div class="house-list">
    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        @click="getAddHouseDialog">
        新增
      </el-button>
      <el-button
        type="primary"
        :loading="gettingListRefresh"
        @click="getListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="houseDataSearch"
          placeholder="搜索" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog
      custom-class="add-house-dialog small"
      :title="ahdDialogTitle"
      :visible.sync="addHouseFlag"
      :close-on-click-modal="false"
      :key="dialogId"
      @closed="onAddHouseDialogClose">
      <el-form
        :model="addHouse"
        :rules="addHouserules"
        ref="addHouse">
        <el-form-item
          label="坊号"
          prop="fang"
          :label-width="ahdLabelWidth">
          <el-select
            v-model="addHouse.fang"
            placeholder="选择坊号">
            <el-option
              :label="item"
              :value="item"
              v-for="item in houseFang"
              :key="item" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="房间号"
          prop="hao"
          :label-width="ahdLabelWidth">
          <el-input
            v-model="addHouse.hao"
            auto-complete="off"
            placeholder="输入房间号" />
        </el-form-item>
        <el-form-item
          label="说明"
          :label-width="ahdLabelWidth">
          <el-input
            v-model="addHouse.detail"
            auto-complete="off"
            placeholder="选填" />
        </el-form-item>
        <el-form-item
          label="电表户编号"
          prop="glyhbh"
          :label-width="ahdLabelWidth">
          <el-input
            v-model="addHouse.glyhbh"
            auto-complete="off"
            placeholder="输入电表用户编号" />
        </el-form-item>
        <el-form-item
          label="电表局编号"
          prop="dbjb"
          :label-width="ahdLabelWidth">
          <el-input
            v-model="addHouse.dbjb"
            auto-complete="off"
            placeholder="输入电表电表局编号" />
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingAddHouse"
          @click="getAddHouseDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingAddHouse"
          @click="getAddHouse">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 房屋数据表 -->
    <el-table
      v-loading.body="gettingListRefresh"
      class="house-table"
      stripe
      border
      :max-height="tableMaxHeight"
      :data="filterHouseData"
      ref="houseTable">
      <el-table-column
        prop="fang"
        label="坊号"
        width="180" />
      <el-table-column
        prop="hao"
        label="房间号"
        width="180" />
      <el-table-column
        prop="glyhbh"
        label="电表用户编号"
        width="180" />
      <el-table-column
        prop="detail"
        label="说明" />
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        label="修改时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="getAddHouseDialog(scope.$index, scope.row)">
            修改
          </el-button>
          <el-popover
            v-model="scope.row.dHousePopFlag"
            placement="top"
            width="150"
            trigger="click">
            <p>确认删除房屋信息吗？与之关联的数据将一并删除</p>
            <div class="pop-cont">
              <el-button
                size="mini"
                type="text"
                @click="scope.row.dHousePopFlag = false">
                取消
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="getDelHouse(scope.$index, scope.row)">
                确定
              </el-button>
            </div>
            <span
              class="show-pop"
              slot="reference">
              <el-button
                size="small"
                type="danger"
                :loading="scope.row.gettingdelHouse">
                删除
              </el-button>
            </span>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { mixinDef } from 'pcside/js/mixins'

  export default {
    name: 'HouseList',
    mixins: [mixinDef],
    data() {
      return {
        addHouseFlag: false,
        gettingAddHouse: false,
        gettingListRefresh: false,

        dialogId: Date.now(),

        ahdDialogTitle: '',
        ahdLabelWidth: '90px',
        addHouse: {},
        addHouseClear: {
          _id: '',
          fang: '',
          hao: '',
          detail: '',
          glyhbh: '',
          dbjb: '',
        },
        addHouserules: {
          hao: [
            { required: true, message: '请填写', trigger: 'blur' },
          ],
          fang: [
            { required: true, message: '请选择', trigger: 'change' },
          ],
        },

        // 前端搜索
        tableMaxHeight: 200,
        houseData: [],
        houseDataSearch: '',
      }
    },
    computed: {
      filterHouseData() {
        if (!this.houseDataSearch) {
          return this.houseData
        }
        const searchKeys = ['fang', 'hao', 'detail']

        const _houseDataSearch = new RegExp(this.houseDataSearch, 'i')
        return this.houseData.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _houseDataSearch.test(testItem)
        })
      },
      ...mapState({
        houseFang: state => state.config.houseFang,
      }),
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/house/index')
    },
    created() {
      this.getListRefresh()
      this.getResetHouse()
    },
    mounted() {
      window.onresize = () => {
        const height = window.innerHeight || document.body.clientHeight
        const offsetTop = this.$refs.houseTable.$el.getBoundingClientRect().top
        this.tableMaxHeight = height - offsetTop - 20 - 0.5
      }
      this.$nextTick(() => window.onresize())
    },
    beforeDestroy() {
      window.onresize = null
    },
    methods: {
      // 打开关闭添加/修改弹窗
      async getAddHouseDialog(index, row) {
        this.addHouseFlag = !this.addHouseFlag
        if (this.addHouseFlag && row) {
          this.ahdDialogTitle = '修改房间'
          this.addHouse._id = row._id
          this.addHouse.fang = row.fang
          this.addHouse.hao = row.hao
          this.addHouse.detail = row.detail
          this.addHouse.glyhbh = row.glyhbh
          this.addHouse.dbjb = row.dbjb
        } else if (this.addHouseFlag) {
          this.ahdDialogTitle = '新增房间'
          this.addHouse.fang = this.houseFang[0]
        }
        await new Promise(r => setTimeout(r, 300))
      },
      // 弹窗数据初始化
      getResetHouse() {
        this.addHouse = Object.assign({}, this.addHouse, this.addHouseClear)
        this.dialogId = Date.now()
      },
      // 关闭弹窗回调
      onAddHouseDialogClose() {
        this.$refs.addHouse.resetFields()
        this.getResetHouse()
      },
      // 添加/修改房屋
      async getAddHouse() {
        if (this.gettingAddHouse) return

        // 表单校验
        try {
          await this.$refs.addHouse.validate()
        } catch (err) {
          return
        }

        // 接口提交
        this.gettingAddHouse = true

        const _data = Object.assign({}, this.addHouse)
        await this.Ajax('/inner/house/add', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: this.addHouse._id ? '修改成功' : '添加成功',
              duration: 2000,
            })
          })
          .then(this.getAddHouseDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingAddHouse = false
      },
      // 获取房屋列表
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 接口提交
        this.gettingListRefresh = true

        await this.Ajax('/inner/house/list')
          .then(res => {
            this.houseData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      // 删除房屋
      async getDelHouse(index, row) {
        row.dHousePopFlag = false
        if (row.gettingdelHouse) return

        // 接口提交
        row.gettingdelHouse = true

        await this.Ajax('/inner/house/del', { _id: row._id })
          .then(() => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 2000,
            })
          })
          .catch(() => {})

        row.gettingdelHouse = false
      },
    },
  }
</script>
