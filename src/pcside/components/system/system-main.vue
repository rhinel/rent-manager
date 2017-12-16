<template>
  <div class="system-main">
    <el-card>
      <el-collapse v-model="activeNames">
        <el-collapse-item
          title="坊号类型（不可修改）"
          name="houseFang">
          <el-tag class="show-tag show-tag3"
            type="success"
            v-for="(fang, index) in houseFang"
            :key="index">
            {{fang}}
          </el-tag>
        </el-collapse-item>

        <el-collapse-item
          title="收租类型（不可修改）"
          name="payTypeVal">
          <el-tag class="show-tag show-tag3"
            type="success"
            v-for="(pay, index) in payTypeVal"
            :key="index">
            {{pay}}
          </el-tag>
        </el-collapse-item>

        <el-collapse-item
          title="交租状态（不可修改）"
          name="typesVal">
          <el-tag class="show-tag show-tag3"
            type="success"
            v-for="(type, index) in typesVal"
            :key="index"
            v-if="!!type">
            {{type}}
          </el-tag>
        </el-collapse-item>

        <el-collapse-item
          title="默认水费计费方式（修改后将在下次新建月度/入住时生效）"
          name="defaultCalWaterPrice">
          <el-form
            :model="calWaterPrice"
            ref="calWaterPrice"
            :rules="calrules">

            <!-- 水费 -->
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item
                  label="水费低消"
                  :label-width="labelWidth"
                  prop="minPrice">
                  <el-input
                    v-model.number="calWaterPrice.minPrice"
                    auto-complete="off"
                    placeholder="输入最低消费">
                    <template slot="append">吨</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item
                  label="水费方式"
                  :label-width="labelWidth">
                  <el-radio
                    v-model="calWaterPrice.calType"
                    label="single">
                    单一价格
                  </el-radio>
                  <el-radio
                    v-model="calWaterPrice.calType"
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
              :label-width="labelWidth"
              v-if="calWaterPrice.calType == 'single'"
              prop="singlePrice"
              :rules="calrules.singlePrice[0]">
              <el-col :span="13">
                <el-input
                  v-model.number="calWaterPrice.singlePrice"
                  auto-complete="off"
                  placeholder="输入单价">
                  <template slot="prepend">￥</template>
                  <template slot="append">元/吨</template>
                </el-input>
              </el-col>
            </el-form-item>

            <!-- 水费阶梯计费 -->
            <div v-if="calWaterPrice.calType == 'step'">
              <el-form-item
                v-for="(step, index) in calWaterPrice.stepPrice"
                :label="'阶梯' + (index + 1)"
                :label-width="labelWidth"
                :key="'calWaterPrice' + index"
                :ref="'calWaterPrice' + index"
                required>
                <el-col :span="5">
                  <el-form-item
                    :prop="'stepPrice.' + index + '.step'"
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
                    :prop="'stepPrice.' + index + '.price'"
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
                    @click.prevent="removeStep(calWaterPrice, step)">
                    删除
                  </el-button>
                </el-col>
              </el-form-item>
            </div>
            <el-form-item
              key="watStep"
              v-if="calWaterPrice.calType == 'step'"
              :label-width="labelWidth">
              <el-button
                type="primary"
                @click="addStep(calWaterPrice)">
                新增阶梯
              </el-button>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item
              key="watBtn"
              v-if="calWaterEdit || !defaultKeysHasSet.defaultCalWaterPrice"
              :label-width="labelWidth">
              <el-button
                type="danger"
                @click="submit"
                :loading="submitLoading">
                提交修改
              </el-button>
              <el-button
                @click="cancel('water')"
                :loading="submitLoading">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item
          title="默认电费计费方式（修改后将在下次新建月度/入住时生效）"
          name="defaultCalElePrice">
          <el-form
            :model="calElePrice"
            ref="calElePrice"
            :rules="calrules">

            <!-- 电费 -->
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item
                  label="低消"
                  :label-width="labelWidth"
                  prop="minPrice">
                  <el-input
                    v-model.number="calElePrice.minPrice"
                    auto-complete="off"
                    placeholder="输入最低消费">
                    <template slot="append">度</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item
                  label="计费方式"
                  :label-width="labelWidth">
                  <el-radio
                    v-model="calElePrice.calType"
                    label="single">
                    单一价格
                  </el-radio>
                  <el-radio
                    v-model="calElePrice.calType"
                    label="step">
                    阶梯价格
                  </el-radio>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 单价计费 -->
            <el-form-item
              label="单价"
              key="eleSingle"
              :label-width="labelWidth"
              v-if="calElePrice.calType == 'single'"
              prop="singlePrice"
              :rules="calrules.singlePrice[0]">
              <el-col :span="13">
                <el-input
                  v-model.number="calElePrice.singlePrice"
                  auto-complete="off"
                  placeholder="输入单价">
                  <template slot="prepend">￥</template>
                  <template slot="append">元/度</template>
                </el-input>
              </el-col>
            </el-form-item>
            <!-- 阶梯计费 -->
            <div v-if="calElePrice.calType == 'step'">
              <el-form-item
                v-for="(step, index) in calElePrice.stepPrice"
                :label="'阶梯' + (index + 1)"
                :label-width="labelWidth"
                :key="'calElectric'+ index"
                :ref="'calElectric' + index"
                required>
                <el-col :span="5">
                  <el-form-item
                    :prop="'stepPrice.' + index + '.step'"
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
                <el-col class="line" :span="1"></el-col>
                <el-col :span="7">
                  <el-form-item
                    :prop="'stepPrice.' + index + '.price'"
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
                    @click.prevent="removeStep(calElePrice, step)">
                    删除
                  </el-button>
                </el-col>
              </el-form-item>
            </div>
            <el-form-item
              key="eleStep"
              v-if="calElePrice.calType == 'step'"
              :label-width="labelWidth">
              <el-button
                type="primary"
                @click="addStep(calElePrice)">
                新增阶梯
              </el-button>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item
              key="eleBtn"
              v-if="calEleEdit || !defaultKeysHasSet.defaultCalElePrice"
              :label-width="labelWidth">
              <el-button
                type="danger"
                @click="submit"
                :loading="submitLoading">
                提交修改
              </el-button>
              <el-button
                @click="cancel('ele')"
                :loading="submitLoading">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'system-main',
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/system/index')
    },
    mounted() {
      this.activeNames = Object.keys(this._computedWatchers)
    },
    data() {
      return {
        activeNames: [],
        submitLoading: false,

        labelWidth: '90px',

        // 水费编辑表单
        calWaterPrice: {},

        // 电费编辑表单
        calElePrice: {},

        // 表单校验
        calrules: {
          minPrice: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
          singlePrice: [{
            type: 'number', required: true, message: '请填写', trigger: 'blur',
          }],
        },
      }
    },
    created() {
      this.cancel('water')
      this.cancel('ele')
    },
    computed: {
      ...mapState({
        houseFang: state => state.config.houseFang,
        payTypeVal: state => state.config.payTypeVal,
        typesVal: state => state.config.typesVal,
        defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
        defaultCalElePrice: state => state.config.defaultCalElePrice,
        defaultStep: state => state.config.defaultStep,
        defaultKeysHasSet: state => state.defaultKeysHasSet,
      }),
      calWaterEdit() {
        const local = JSON.stringify(this.calWaterPrice)
        const def = JSON.stringify(this.defaultCalWaterPrice)
        return local !== def
      },
      calEleEdit() {
        const local = JSON.stringify(this.calElePrice)
        const def = JSON.stringify(this.defaultCalElePrice)
        return local !== def
      },
    },
    watch: {
      // 获取数据
      defaultCalWaterPrice() {
        this.cancel('water')
      },
      defaultCalElePrice() {
        this.cancel('ele')
      },
    },
    methods: {
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
      // 取消修改
      cancel(type) {
        if (type === 'water') {
          if (this.$refs.calWaterPrice) this.$refs.calWaterPrice.resetFields()
          this.calWaterPrice =
            Object.assign({}, JSON.parse(JSON.stringify(this.defaultCalWaterPrice)))
        } else {
          if (this.$refs.calElePrice) this.$refs.calElePrice.resetFields()
          this.calElePrice =
            Object.assign({}, JSON.parse(JSON.stringify(this.defaultCalElePrice)))
        }
      },
      // 提交修改
      async submit() {
        if (this.submitLoading) return

        try {
          await this.$refs.calWaterPrice.validate()
          await this.$refs.calElePrice.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.submitLoading = true

        const {
          calWaterPrice,
          calElePrice,
        } = this
        const postData = Object.assign({}, {
          defaultCalWaterPrice: calWaterPrice,
          defaultCalElePrice: calElePrice,
        })

        try {
          await this.Ajax('/inner/auth/updateSysInfo', postData)
        } catch (err) {
          this.submitLoading = false
          return
        }

        await this.$store.dispatch('getDefaults')
        this.$message({
          type: 'success',
          message: '更新 成功',
          duration: 2000,
        })

        this.submitLoading = false
      },
    },
  }
</script>

<style lang="scss">
.system-main {
  .el-form {
    max-width: 1025px;
    margin-bottom: -22px;
  }
}
</style>
