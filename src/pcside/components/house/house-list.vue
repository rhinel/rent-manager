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
        @click="getListRefresh"
        :loading="gettingListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="houseDataSearch"
          placeholder="搜索">
        </el-input>
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog custom-class="add-house-dialog"
      :title="ahdDialogTitle"
      :visible="addHouseFlag"
      size="small"
      :close-on-click-modal="false"
      @close="onAddHouseDialogClose">
      <el-form
        :model="addHouse"
        ref="addHouse"
        :rules="addHouserules">
        <el-form-item
          label="坊号"
          :label-width="ahdLabelWidth"
          prop="fang">
          <el-select
            v-model="addHouse.fang"
            placeholder="选择坊号">
            <el-option
              v-for="item in houseFang"
              :label="item"
              :value="item"
              :key="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="房间号"
          :label-width="ahdLabelWidth"
          prop="hao">
          <el-input
            v-model="addHouse.hao"
            auto-complete="off"
            placeholder="输入房间号">
          </el-input>
        </el-form-item>
        <el-form-item
          label="说明"
          :label-width="ahdLabelWidth">
          <el-input
            v-model="addHouse.detail"
            auto-complete="off"
            placeholder="选填">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="getAddHouseDialog"
          :loading="gettingAddHouse">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="getAddHouse"
          :loading="gettingAddHouse">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 房屋数据表 -->
    <el-table
      class="house-table"
      :data="filterHouseData"
      v-loading.body="gettingListRefresh"
      stripe
      border>
      <el-table-column
        prop="fang"
        label="坊号"
        width="180">
      </el-table-column>
      <el-table-column
        prop="hao"
        label="房间号"
        width="180">
      </el-table-column>
      <el-table-column
        prop="detail"
        label="说明">
      </el-table-column>
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
            placement="top"
            width="150"
            trigger="click"
            v-model="scope.row.dHousePopFlag">
            <p>确认删除房屋信息吗？与之关联的数据将一并删除</p>
            <div class="house-list-d-house-pop-cont">
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
            <div slot="reference" class="house-show-pop">
              <el-button
                size="small"
                type="danger"
                :loading="scope.row.gettingdelHouse">
                删除
              </el-button>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  export default {
    name: 'house-list',
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/house/index')
    },
    created() {
      this.getListRefresh()
      this.getResetHouse()
    },
    data() {
      return {
        addHouseFlag: false,
        gettingAddHouse: false,
        gettingListRefresh: false,

        // 定义坊号，前台写死，后台分类统计用做判断
        houseFang: ['6坊65栋', '8坊68栋', '公司楼'],
        ahdDialogTitle: '',
        ahdLabelWidth: '80px',
        addHouse: {},
        addHouseClear: {
          _id: '',
          fang: '',
          hao: '',
          detail: '',
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
    },
    methods: {
      // 时间格式化
      getTime(t) {
        return t ? this.GetTimeFormat(t) : '--'
      },
      // 打开关闭添加/修改弹窗
      getAddHouseDialog(index, row) {
        this.addHouseFlag = !this.addHouseFlag
        if (this.addHouseFlag && row) {
          this.ahdDialogTitle = '修改房间'
          this.addHouse._id = row._id
          this.addHouse.fang = row.fang
          this.addHouse.hao = row.hao
          this.addHouse.detail = row.detail
        } else if (this.addHouseFlag) {
          this.ahdDialogTitle = '新增房间'
          this.addHouse.fang = this.houseFang[0]
        }
      },
      // 弹窗数据初始化
      getResetHouse() {
        this.addHouse = Object.assign({}, this.addHouse, this.addHouseClear)
      },
      // 关闭弹窗回调
      onAddHouseDialogClose() {
        setTimeout(() => {
          this.getResetHouse()
          this.$refs.addHouse.resetFields()
        }, 500)
      },
      // 添加/修改房屋
      async getAddHouse() {
        if (this.gettingAddHouse) return

        // 表单校验
        try {
          await (() => new Promise((resolve, reject) => {
            this.$refs.addHouse.validate((valid) => {
              if (valid) resolve()
              if (!valid) reject()
            })
          }))()
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
            this.getAddHouseDialog()
            this.getListRefresh()
          })
          .catch(() => {})

        this.gettingAddHouse = false
      },
      // 获取房屋列表
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 接口提交
        this.gettingListRefresh = true

        await this.Ajax('/inner/house/list', {})
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

<style lang="scss">
.house-list {
  .table-btn {
    margin-bottom: 20px;
  }
  .table-btn-input {
    max-width: 300px;
    display: inline-block;
    margin-left: 10px;
  }
  .add-house-dialog {
    max-width: 400px;
    .el-input {
      max-width: 300px;
    }
    .el-select {
      width: 100%;
      max-width: 300px;
    }
  }
  .house-show-pop {
    display: inline-block;
    margin-left: 10px;
  }
}
.house-list-d-house-pop-cont {
  text-align: right;
  margin: 0;
}
</style>
