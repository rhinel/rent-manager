<template>
  <div>
    <div v-if="rent[calType]">
      <el-tag>
        {{ rent[calType].fix ? '修' : '计' }}
      </el-tag>

      <span>
        {{
          rent[calType].tnew[type]
            - rent[calType].old[type]
        }}
        *
        {{ eandwCalGetPrice(rent) }}
        =￥
        <span class="main-txt-highline">
          {{ rent[calType][resultType] }}
        </span>
        元
      </span>

      <div class="unimportant">
        {{ getTime(rent[calType].addTime) }}
      </div>
    </div>

    <div v-if="!rent[calType]">
      暂无
    </div>
  </div>
</template>

<script>
  import { mixinDef, eandwCalGetPrice } from 'pcside/js/mixins'

  export default {
    name: 'TableRentEandwItem',
    mixins: [mixinDef, eandwCalGetPrice],
    props: {
      rent: {
        type: Object,
        default: () => ({}),
      },
      type: {
        type: String,
        default: '',
      },
      calType: {
        type: String,
        default: '',
      },
      resultType: {
        type: String,
        default: '',
      },
      unit: {
        type: String,
        default: '',
      },
    },
  }
</script>
