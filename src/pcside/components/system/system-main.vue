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
      }
    },
    computed: {
      ...mapState({
        houseFang: state => state.config.houseFang,
        payTypeVal: state => state.config.payTypeVal,
        typesVal: state => state.config.typesVal,
        defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
        defaultCalElePrice: state => state.config.defaultCalElePrice,
      }),
    },
  }
</script>
