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
          title="默认水费计费方式"
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
                  :label-width="lidLabelWidth"
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
                  :label-width="lidLabelWidth">
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
              :label-width="lidLabelWidth"
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
                :label-width="lidLabelWidth"
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
              :label-width="lidLabelWidth">
              <el-button
                type="primary"
                @click="addStep(calWaterPrice)">
                新增阶梯
              </el-button>
            </el-form-item>

          </el-form>
        </el-collapse-item>

        <el-collapse-item
          title="默认电费计费方式"
          name="defaultCalElePrice">

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

        lidLabelWidth: '90px',

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
      this.calWaterPrice =
          JSON.parse(JSON.stringify(this.defaultCalWaterPrice))
      this.calElePrice =
        JSON.parse(JSON.stringify(this.defaultCalElePrice))
    },
    computed: {
      ...mapState({
        houseFang: state => state.config.houseFang,
        payTypeVal: state => state.config.payTypeVal,
        typesVal: state => state.config.typesVal,
        defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
        defaultCalElePrice: state => state.config.defaultCalElePrice,
        defaultStep: state => state.config.defaultStep,
      }),
    },
    watch: {
      // 获取数据
      defaultCalWaterPrice() {
        this.calWaterPrice =
          JSON.parse(JSON.stringify(this.defaultCalWaterPrice))
      },
      defaultCalElePrice() {
        this.calElePrice =
          JSON.parse(JSON.stringify(this.defaultCalElePrice))
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
    },
  }
</script>

<style lang="scss">
.system-main {
  .el-form {
    max-width: 1025px;
  }
}
</style>
