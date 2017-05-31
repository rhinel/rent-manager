<style lang="scss">
  .rent-month{
    // 顶部按钮样式
    .table-btn{
      margin-bottom: 20px;
    }
    .table-btn-input{
      max-width: 300px;
      display: inline-block;
      margin-left: 10px;
    }
    // 弹窗表单样式
    .add-month-det-dialog, .change-type-dialog{
      max-width: 800px;
      .el-input{
        width: 100%;
        vertical-align: top;
        // max-width: 300px;
      }
      .el-select{
        width: 100%;
        max-width: 300px;
      }
      .el-checkbox-group{
        overflow: hidden;
      }
      .el-row-margin{
        margin-bottom: 20px;
      }
    }
    .change-type-dialog{
      .el-input{
        max-width: 300px;
      }
    }
    // 删除pop样式
    .month-det-show-pop{
      display: inline-block;
      margin-left: 10px;
    }
    // 信息悬浮窗样式
    .tag-bf-span{
      display: inline-block;
      vertical-align: middle;
    }
    .tag-bf-span + *{
      display: inline-block;
      vertical-align: middle;
    }
    .rent-show-tag{
      cursor: pointer;
      &.pop {
        margin-left: 10px;
      }
    }
    .rent-show-tag2{
      display: inline-block;
      vertical-align: middle;
    }
    .rent-show-tag3{
      margin-right: 4px;
      display: inline-block;
      vertical-align: middle;
    }
    .rent-remark-tag{
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .landord-title{
      display: inline-block;
      margin-right: 20px;
      .el-button{
        font-size: 13px;
      }
    }
    .landord-content{
      font-size: 14px;
      & > span {
        display: inline-block;
        line-height: 1;
        padding: 10px 0;
        width: 180px;
        vertical-align: top;
      }
      & > span:last-child{
        min-width: 180px;
        width: auto;
      }
      .landord-content-type{
        position: relative;
        .el-tag{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
    .rent-count-title:not(:first-child){
      padding-top: 20px;
    }
  }
  // 信息悬浮窗弹窗样式
  .rent-remark{
    max-width: 200px;
  }
  // 删除pop弹窗样式
  .month-det-d-rent-pop-cont{
    text-align: right;
    margin: 0;
  }
</style>

<template>
  <div class="rent-month">
    <el-tabs v-model="activeName">
      <el-tab-pane label="计租信息" name="rentHistory">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
          <div class="table-btn-input">
            <el-input v-model="monthDetSearch" placeholder="搜索"></el-input>
          </div>
        </div>

        <!-- 计租表单 -->
        <el-dialog :title="addRent.fanghao + ardDialogTitle" v-model="addRentflag" size="large" top="50px" custom-class="add-month-det-dialog" :close-on-click-modal="false" @close="onAddRentDialogClose">
          <el-form :model="addRent" ref="addRent" :rules="addRentrules">
            <el-form-item>
              <el-alert title="请确认计租信息" type="info"></el-alert>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="水费信息" :label-width="ardLabelWidth">
                  <div v-if="addRent.calWater.calWater">
                    计费方式：{{addRent.calWater.calWater.calType == 'single' ? '单一价格' : '阶梯价格'}}<br>
                    最低消费：{{addRent.calWater.calWater.minPrice}}吨<br>
                    本次表数：{{addRent.calWater.tnew.water}}吨<br>（{{getTime(addRent.calWater.tnew.addTime)}}）<br>
                    上次表数：{{addRent.calWater.old.water}}吨<br>（{{getTime(addRent.calWater.old.addTime)}}）<br>
                    计费单价：￥{{addRent.calWater.calWater.calType == 'single' ? addRent.calWater.calWater.singlePrice : getPrice(addRent.calWater.calWater.stepPrice, addRent.calWater.tnew.water - addRent.calWater.old.water)}}元/吨<br>
                    水费：￥{{addRent.calWater.calWaterResult}}元（{{addRent.calWater.fix ? '修' : '计'}}）<br>
                    计费时间：{{getTime(addRent.calWater.addTime)}}
                  </div>
                  <div v-else>
                    暂无
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电费信息" :label-width="ardLabelWidth">
                  <div v-if="addRent.calElectric.calElectric">
                    计费方式：{{addRent.calElectric.calElectric.calType == 'single' ? '单一价格' : '阶梯价格'}}<br>
                    最低消费：{{addRent.calElectric.calElectric.minPrice}}度<br>
                    本次表数：{{addRent.calElectric.tnew.electric}}度<br>（{{getTime(addRent.calElectric.tnew.addTime)}}）<br>
                    上次表数：{{addRent.calElectric.old.electric}}度<br>（{{getTime(addRent.calElectric.old.addTime)}}）<br>
                    计费单价：￥{{addRent.calElectric.calElectric.calType == 'single' ? addRent.calElectric.calElectric.singlePrice : getPrice(addRent.calElectric.calElectric.stepPrice, addRent.calElectric.tnew.electric - addRent.calElectric.old.electric)}}元/度<br>
                    电费：￥{{addRent.calElectric.calElectricResult}}元（{{addRent.calElectric.fix ? '修' : '计'}}）<br>
                    计费时间：{{getTime(addRent.calElectric.addTime)}}
                  </div>
                  <div v-else>
                    暂无
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-alert title="租金及结果可做修正，但建议租金调整先修改租户信息" type="info"></el-alert>
            </el-form-item>
            <el-form-item label="租住周期" :label-width="ardLabelWidth">
              <div v-if="addRent.lease.leaserange">{{getTime(addRent.lease.leaserange[0])}} ~ {{getTime(addRent.lease.leaserange[1])}}</div>
              <div v-else>暂无</div>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="本月租金" :label-width="ardLabelWidth" prop="lease.rent">
                  <el-input v-model.number="addRent.lease.rent" auto-complete="off" placeholder="输入本月租金"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="addRent.fix ? '租金修正' : '租金合计'" :label-width="ardLabelWidth" prop="calRentResult">
                  <el-input v-model.number="addRent.calRentResult" auto-complete="off" placeholder="输入本月租金合计"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="计租时间" :label-width="ardLabelWidth" prop="addTime">
                  <el-date-picker v-model="addRent.addTime" type="datetime" placeholder="输入计租时间" :editable="false"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计租备注" :label-width="ardLabelWidth">
                  <el-input v-model="addRent.remark" auto-complete="off" placeholder="计租备注"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="getAddRentDialog" :loading="gettingAddRent">取消</el-button>
            <el-button type="primary" @click="getAddRent" :loading="gettingAddRent">确定</el-button>
          </div>
        </el-dialog>

        <!-- 状态修改表单 -->
        <el-dialog :title="changeType.fanghao + ctdDialogTitle" v-model="changeTypeflag" size="large" custom-class="change-type-dialog" :close-on-click-modal="false" @close="onChangeTypeDialogClose">
          <el-form :model="changeType" ref="changeType">
            <el-form-item>
              <el-alert title="多选状态信息" type="info"></el-alert>
            </el-form-item>
            <el-form-item label="交租方式" :label-width="ctdLabelWidth">
              <div style="overflow: hidden;">
                <el-row :gutter="20">
                  <el-col :span="4" style="height:1px;"></el-col>
                  <el-col :span="20">
                    <el-select v-model="changeType.payType" placeholder="选择交租方式">
                      <el-option v-for="(item, index) in payTypeVal" :label="item" :value="index" :key="index"></el-option>
                    </el-select>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
            <el-form-item label="备注" :label-width="ctdLabelWidth">
              <div style="overflow: hidden;">
                <el-row :gutter="20">
                  <el-col :span="4" style="height:1px;"></el-col>
                  <el-col :span="20">
                    <el-input v-model.number="changeType.remark" auto-complete="off" placeholder="备注"></el-input>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
            <el-form-item label="状态" :label-width="ctdLabelWidth">
              <div>
                <el-checkbox-group v-model="changeType.type" @change="onChangeType">
                  <el-row :gutter="20" v-for="type in types" class="el-row-margin" :key="type">
                    <el-col :span="4">
                      <el-checkbox :label="type.value">{{type.label}}</el-checkbox>
                    </el-col>
                    <el-col :span="20">
                      <el-date-picker v-if="changeType.type.indexOf(type.value) > -1" v-model="changeType.typeTime[type.value]" type="datetime" placeholder="输入状态时间" :editable="false"></el-date-picker>
                    </el-col>
                  </el-row>
                </el-checkbox-group>
              </div>
              <div>
                <el-checkbox :indeterminate="changeType.isIndeterminate" v-model="changeType.checkAll" @change="onCheckAllChange">全选</el-checkbox>
              </div>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="getChangeTypeDialog" :loading="gettingChangeType">取消</el-button>
            <el-button type="primary" @click="getChangeType" :loading="gettingChangeType">确定</el-button>
          </div>
        </el-dialog>

        <!-- 月周期图表 -->
        <el-table
          class="month-table"
          :data="filterMonthDetData"
          v-loading.body="gettingListRefresh"
          stripe
          border>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="180"
            sortable>
            <template scope="scope">
              <router-link class="tag-bf-span" :to="{ path: '/inner/rent/history', query: { id: scope.row._id }}">
                <el-button type="text">{{scope.row.fanghao}}</el-button>
              </router-link>
              <el-tag v-if="scope.row.rents.length > 1">多次</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="计租信息">
            <el-table-column
              label="水费信息">
              <el-table-column
                label="本次用数/单价"
                min-width="150">
                <template scope="scope">
                  <div v-if="scope.row.rents.length && getRent(scope).calWater">
                    <span class="tag-bf-span">{{getRent(scope).calWater.tnew.water - getRent(scope).calWater.old.water}}吨</span>
                    <el-popover
                      placement="top"
                      trigger="hover">
                      <div>本次抄表数：{{getRent(scope).calWater.tnew.water}}吨</div>
                      <div>抄表时间：{{getTime(getRent(scope).calWater.tnew.addTime)}}</div>
                      <div>上次表底数：{{getRent(scope).calWater.old.water}}吨</div>
                      <div>表底时间：{{getTime(getRent(scope).calWater.old.addTime)}}</div>
                      <div slot="reference" class="rent-show-tag">
                        <el-tag>计数</el-tag>
                      </div>
                    </el-popover>
                  </div>
                  <div v-if="scope.row.rents.length && getRent(scope).calWater">
                    <span>￥{{getRent(scope).calWater.calWater.calType == 'single' ? getRent(scope).calWater.calWater.singlePrice : getPrice(getRent(scope).calWater.calWater.stepPrice, getRent(scope).calWater.tnew.water - getRent(scope).calWater.old.water)}}元/吨</span>
                  </div>
                  <div v-if="scope.row.rents.length && !getRent(scope).calWater">
                    暂无
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="本次计费/时间"
                width="170">
                <template scope="scope">
                  <div v-if="scope.row.rents.length && getRent(scope).calWater">
                    <el-tag>{{getRent(scope).calWater.fix ? '修' : '计'}}</el-tag>
                    <span>￥{{getRent(scope).calWater.calWaterResult}}元</span>
                  </div>
                  <div v-if="scope.row.rents.length && getRent(scope).calWater">
                    <span>{{getTime(getRent(scope).calWater.addTime)}}</span>
                  </div>
                  <div v-if="scope.row.rents.length && !getRent(scope).calWater">
                    暂无
                  </div>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column
              label="电费信息">
              <el-table-column
                label="本次用数/单价"
                min-width="150">
                <template scope="scope">
                  <div v-if="scope.row.rents.length && getRent(scope).calElectric">
                    <span class="tag-bf-span">{{getRent(scope).calElectric.tnew.electric - getRent(scope).calElectric.old.electric}}度</span>
                    <el-popover
                      placement="top"
                      trigger="hover">
                      <div>本次抄表数：{{getRent(scope).calElectric.tnew.electric}}度</div>
                      <div>抄表时间：{{getTime(getRent(scope).calElectric.tnew.addTime)}}</div>
                      <div>上次表底数：{{getRent(scope).calElectric.old.electric}}度</div>
                      <div>表底时间：{{getTime(getRent(scope).calElectric.old.addTime)}}</div>
                      <div slot="reference" class="rent-show-tag">
                        <el-tag>计数</el-tag>
                      </div>
                    </el-popover>
                  </div>
                  <div v-if="scope.row.rents.length && getRent(scope).calElectric">
                    <span>￥{{getRent(scope).calElectric.calElectric.calType == 'single' ? getRent(scope).calElectric.calElectric.singlePrice : getPrice(getRent(scope).calElectric.calElectric.stepPrice, getRent(scope).calElectric.tnew.electric - getRent(scope).calElectric.old.electric)}}元/度</span>
                  </div>
                  <div v-if="scope.row.rents.length && !getRent(scope).calElectric">
                    暂无
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="本次计费/时间"
                width="170">
                <template scope="scope">
                  <div v-if="scope.row.rents.length && getRent(scope).calElectric">
                    <el-tag>{{getRent(scope).calElectric.fix ? '修' : '计'}}</el-tag>
                    <span>￥{{getRent(scope).calElectric.calElectricResult}}元</span>
                  </div>
                  <div v-if="scope.row.rents.length && getRent(scope).calElectric">
                    <span>{{getTime(getRent(scope).calElectric.addTime)}}</span>
                  </div>
                  <div v-if="scope.row.rents.length && !getRent(scope).calElectric">
                    暂无
                  </div>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column
              label="房租信息"
              min-width="150">
              <template scope="scope">
                <div v-if="scope.row.rents.length && getRent(scope).lease.name">
                  <el-tag class="tag-bf-span">{{getRent(scope).lease.payDay}}日</el-tag>
                  <el-popover
                    placement="top"
                    trigger="hover">
                    <div>姓名：{{getRent(scope).lease.name}}</div>
                    <div>联系方式：{{getRent(scope).lease.call}}</div>
                    <div>租住起始：{{getTime(getRent(scope).lease.leaserange[0])}}</div>
                    <div>租住结束：{{getTime(getRent(scope).lease.leaserange[1])}}</div>
                    <div>入住时间：{{getTime(getRent(scope).lease.addTime)}}</div>
                    <div>备注：{{getRent(scope).lease.remark || '--'}}</div>
                    <div slot="reference" class="rent-show-tag">
                      <el-tag>{{payTypeVal[getRent(scope).lease.payType]}}</el-tag>
                    </div>
                  </el-popover>
                </div>
                <div v-if="scope.row.rents.length && getRent(scope).lease.name">
                  <span>￥{{getRent(scope).lease.rent}}元</span>
                </div>
                <div v-if="scope.row.rents.length && !getRent(scope).lease.name">
                  暂无
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="合计/计费时间"
              width="170">
              <template scope="scope">
                <div v-if="scope.row.rents.length">
                  <el-tag>{{getRent(scope).fix ? '修' : '计'}}</el-tag>
                  <span>￥{{getRent(scope).calRentResult}}元</span>
                </div>
                <div v-if="scope.row.rents.length">{{getTime(getRent(scope).addTime)}}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="状态/更新时间"
              width="170">
              <template scope="scope">
                <div v-if="scope.row.rents.length && getRent(scope).type">
                  <el-popover
                    placement="top"
                    trigger="hover"
                     v-for="item in getRent(scope).type.type"
                     :key="item">
                    <div class="rent-remark">{{ getTime(getRent(scope).type.typeTime[item]) }}</div>
                    <div slot="reference" class="rent-show-tag rent-show-tag3">
                      <el-tag :type="item != 2? 'primary' : ''">{{typesVal[item]}}</el-tag>
                    </div>
                  </el-popover>
                </div>
                <el-tag v-if="scope.row.rents.length && (getRent(scope).type && !getRent(scope).type.type.length || !getRent(scope).type)">新建</el-tag>
                <div v-if="scope.row.rents.length">{{getTime(getRent(scope).updateTime)}}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="备注"
              min-width="140">
              <template scope="scope">
                <el-popover
                  placement="top"
                  trigger="hover"
                   v-if="scope.row.rents.length">
                  <div class="rent-remark">{{ getRent(scope).remark }}</div>
                  <div slot="reference" class="rent-show-tag rent-show-tag2">
                    <div class="rent-remark-tag">{{ getRent(scope).remark }}</div>
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
                v-if="monthDet.newest"
                @click="getAddRentDialog(scope.$index, scope.row)">计租</el-button>
              <el-button
                size="small"
                type="primary"
                v-if="scope.row.rents.length"
                @click="getChangeTypeDialog(scope.$index, scope.row)">状态</el-button>
              <el-popover
                placement="top"
                width="150"
                trigger="click"
                v-if="scope.row.rents.length && monthDet.newest"
                v-model="scope.row.dRentPopFlag">
                <p>确认删除该计租信息吗？其他数据不受影响，但无法恢复关联信息</p>
                <div class="month-det-d-rent-pop-cont">
                  <el-button size="mini" type="text" @click="scope.row.dRentPopFlag = false">取消</el-button>
                  <el-button type="danger" size="mini" @click="(scope.row.dRentPopFlag = false) || getDelRent(scope.$index, scope.row)">确定</el-button>
                </div>
                <div slot="reference" class="month-det-show-pop">
                  <el-button
                    size="small"
                    type="danger"
                    :loading="scope.row.gettingdelRent">删除</el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="待交房东统计" name="landordHistoryTemp">
        <el-collapse v-model="activeLandordHistoryTemp" v-loading.body="gettingLandordRentTemp" v-if="landordHistoryTemp.list && landordHistoryTemp.list.length">
          <el-collapse-item name="temp">
            <template slot="title">
                <span class="landord-title">合计：￥{{landordHistoryTemp.all}}元</span><span class="landord-title" v-for="(j, indexj) in payTypeVal" :key="indexj">{{j}}：{{landordHistoryTemp[indexj]}}元</span>
              </template>
              <div v-for="i in landordHistoryTemp.list" class="landord-content">
              <router-link class="tag-bf-span" :to="{ path: '/inner/rent/history', query: { id: i.haoId }}">
                <el-button type="text">[{{i.fanghao}}]</el-button>
              </router-link>
              <span>[￥{{i.calRentResult}}元]</span><span class="landord-content-type">交租方式：<el-tag>{{payTypeVal[i.lease.payType]}}</el-tag></span><span>备注：{{i.remark}}</span>
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-alert v-if="!gettingLandordRentTemp && (!landordHistoryTemp.list || !landordHistoryTemp.list.length)" title="暂无数据！请先处理单据状态" type="info" :closable="false"></el-alert>
      </el-tab-pane>
      <el-tab-pane label="交房东历史" name="landordHistory">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button type="primary" @click="getLandordRent" :loading="gettingLandordRent">刷新</el-button>
          <div class="table-btn-input">
            <el-date-picker v-model="landordHistorySearch" type="date" placeholder="选择日期" :editable="false" @change="getfilterLandordData"></el-date-picker>
          </div>
        </div>
        <el-collapse v-model="activeDate" v-loading.body="gettingLandordRent" v-if="checkObject(landordData)">
          <el-collapse-item v-for="(item, index) in landordData" :name="new Date(Number(index)).toLocaleDateString()" :key="index">
              <template slot="title">
                {{new Date(Number(index)).toLocaleDateString()}} 
                <span class="landord-title">
                <el-popover
                  placement="right"
                  trigger="hover">
                  <div class="landord-title" v-for="(j, indexj) in payTypeVal">{{j}}：{{item[indexj]}}元</div>
                  <div slot="reference">
                    <el-button type="text">合计：￥{{item.all}}元</el-button>
                  </div>
                </el-popover>
              </span>
              </template>
            <div v-for="i in item.list" class="landord-content">
              <router-link class="tag-bf-span" :to="{ path: '/inner/rent/history', query: { id: i.haoId }}">
                <el-button type="text">[{{i.fanghao}}]</el-button>
              </router-link>
              <span>[￥{{i.calRentResult}}元]</span><span class="landord-content-type">交租方式：<el-tag>{{payTypeVal[i.lease.payType]}}</el-tag></span><span>备注：{{i.remark}}</span>
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-alert v-if="!gettingLandordRent && !checkObject(landordData)" title="暂无数据！请先处理单据状态" type="info" :closable="false"></el-alert>
      </el-tab-pane>
      <el-tab-pane label="月租统计" name="rentCount">
        <template v-for="(fang, fangi) in rentCount">
          <div class="rent-count-title">
            <el-alert type="info" title="" class="table-btn" :closable="false">
              {{fangi}} 合计：￥{{fang.count}}元
            </el-alert>           
          </div>
          <el-collapse v-model="activeRentCount[fangi]">
            <el-collapse-item v-for="(floor, floori) in fang.list" :name="floori" :key="floori">
              <template slot="title">
                  {{floori}}楼 <span class="landord-title">合计：￥{{floor.count}}元</span>
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
        <el-alert v-if="!checkObject(rentCount)" title="暂无数据！请先处理单据状态" type="info" :closable="false"></el-alert>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    name: 'rent-month',
    beforeCreate () {
      this.$store.dispatch('updateMenu', '/inner/rent/index')
    },
    created () {
      this.getMonthDet()
      this.activeName === 'rentHistory' && this.rentHistoryActive()
      this.activeName === 'landordHistoryTemp' && this.landordHistoryTempActive()
      this.activeName === 'landordHistory' && this.landordHistoryActive()
      this.activeName === 'rentCount' && this.rentCountActive()
    },
    data () {
      return {
        activeName: 'rentHistory',
        // 状态
        addRentflag: false,
        gettingAddRent: false,
        changeTypeflag: false,
        gettingChangeType: false,
        gettingListRefresh: false,

        // 周期对象
        monthDet: {},

        // 计租
        ardDialogTitle: '计租',
        ardLabelWidth: '90px',
        addRent: {
          calWater: {}, // 水费计费信息
          calElectric: {}, // 电费计费信息
          lease: {}, // 租户信息
          fanghao: '',
          haoId: '',
          monthId: '',
          calRentResult: 0,
          fix: false,
          remark: '',
          addTime: ''
        },
        addRentrules: {
          'lease.rent': [{ type: 'number', required: true, message: '请填写', trigger: 'blur change' }],
          'calRentResult': [{ type: 'number', required: true, message: '请填写', trigger: 'blur change' }],
          'addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'blur change' }]
        },

        // 修改状态
        ctdDialogTitle: '状态修改',
        ctdLabelWidth: '90px',
        types: [
          {label: '已交', value: 1},
          {label: '给单', value: 2},
          {label: '房东', value: 3}
        ],
        changeType: {
          fanghao: '',
          rentId: '',
          type: [],
          typeTime: {
            1: '',
            2: '',
            3: ''
          },
          isIndeterminate: false,
          checkAll: false,

          payType: 0,
          remark: ''
        },

        // 列表渲染
        monthDetData: [],
        monthDetSearch: '',

        // 未交统计
        landordHistoryTemp: {},
        activeLandordHistoryTemp: ['temp'],
        gettingLandordRentTemp: false,

        // 房东列表
        activeDate: [],
        landordHistorySearch: '',
        gettingLandordRent: false,
        landordData: {},

        // rentCount列表
        rentCount: {},
        activeRentCount: []
      }
    },
    computed: {
      filterMonthDetData () {
        if (!this.monthDetSearch) {
          return this.monthDetData
        } else {
          let _monthDetSearch = new RegExp(this.monthDetSearch, 'i')
          return this.monthDetData.filter((item) => {
            for (var i in item) {
              if (i !== 'fanghao' && i !== 'remark') {
                continue
              } else if (String(item[i]).match(_monthDetSearch)) {
                return true
              }
            }
            return false
          })
        }
      },
      calRentResult () {
        let result = 0
        let add = this.addRent
        result = (add.calWater.calWaterResult || 0) + (add.calElectric.calElectricResult || 0) + (add.lease.rent || 0) // 房租计算
        return result
      },
      payTypeVal () {
        return this.$store.state.default.payTypeVal
      },
      typesVal () {
        return this.$store.state.default.typesVal
      }
    },
    watch: {
      calRentResult (n, o) {
        this.addRent.calRentResult = n
      },
      'addRent.calRentResult' (n, o) {
        n === this.calRentResult && (this.addRent.fix = false)
        n !== this.calRentResult && (this.addRent.fix = true)
      },
      activeName (n, o) {
        n === 'rentHistory' && this.rentHistoryActive()
        n === 'landordHistoryTemp' && this.landordHistoryTempActive()
        n === 'landordHistory' && this.landordHistoryActive()
        n === 'rentCount' && this.rentCountActive()
      }
    },
    methods: {
      rentHistoryActive () {
        this.getListRefresh()
        this.getResetAddRent()
        this.getResetChangeType()
      },
      landordHistoryTempActive () {
        this.getLandordRentTemp()
      },
      landordHistoryActive () {
        this.getLandordRent()
      },
      rentCountActive () {
        this.getCalRentCount()
      },
      getMonthDet () {
        this.Ajax('/inner/month/find', {
          _id: this.$route.query.id
        }, (res) => {
          this.monthDet = res.body.data
          this.$store.dispatch('titleAdd', this.monthDet.month)
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
        })
      },
      getListRefresh () {
        if (this.gettingListRefresh) {
          return true
        }
        this.gettingListRefresh = true
        this.Ajax('/inner/rent/listByMonth', {
          monthId: this.$route.query.id
        }, (res) => {
          this.monthDetData = res.body.data
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
      getAddRentDialog (index, row) {
        this.addRentflag = !this.addRentflag
        this.addRent.fix = false
        if (this.addRentflag && row) {
          this.addRent.calWater = row.calWaterId
          this.addRent.calElectric = row.calElectricId
          this.addRent.lease = row.leaseId.hasOwnProperty('rent') ? JSON.parse(JSON.stringify(row.leaseId)) : {
            rent: 0
          }
          this.addRent.fanghao = row.fanghao
          this.addRent.haoId = row._id
          this.addRent.remark = row.leaseId.remark || ''
          this.addRent.addTime = new Date()
        }
      },
      getResetAddRent () {
        this.addRent.calWater = {}
        this.addRent.calElectric = {}
        this.addRent.lease = {
          rent: 0
        }
        this.addRent.fanghao = ''
        this.addRent.haoId = ''
        this.addRent.monthId = this.$route.query.id || ''
        this.addRent.calRentResult = 0
        this.addRent.remark = ''
        this.addRent.addTime = new Date()
      },
      onAddRentDialogClose () {
        this.$refs.addRent.resetFields()
        this.getResetAddRent()
      },
      getPrice (arr, p) {
        let price = 0
        arr.forEach((item, i, iarr) => {
          if (p > (iarr[i - 1] ? iarr[i - 1].step : 0) && p <= item.step && item.step !== 0) {
            price = item.price
          } else if ((i + 1) === iarr.length && p > item.step && item.step !== 0) {
            price = item.price
          }
        })
        return price
      },
      getTime (t) {
        return t ? this.GetTimeFormat(t) : '--'
      },
      getRent (scope) {
        return (scope.row.rents[scope.row.rents.length - 1])
      },
      getAddRent () {
        if (this.gettingAddRent) {
          return true
        }
        this.gettingAddRent = true
        this.$refs.addRent.validate((valid) => {
          if (valid) {
            let _data = Object.assign({}, this.addRent)
            this.Ajax('/inner/rent/add', _data, (res) => {
              this.$message({
                type: 'success',
                message: '计租成功',
                duration: 2000
              })
              this.getAddRentDialog()
              this.gettingAddRent = false
              this.getListRefresh()
            }, (res) => {
              this.$message({
                type: 'error',
                message: '编号：' + res.body.code + '，' + res.body.msg,
                duration: 2000
              })
              this.gettingAddRent = false
            })
          } else {
            this.gettingAddRent = false
          }
        })
      },
      getChangeTypeDialog (index, row) {
        this.changeTypeflag = !this.changeTypeflag
        if (this.changeTypeflag && row) {
          this.changeType.fanghao = row.rents[row.rents.length - 1].fanghao
          this.changeType.rentId = row.rents[row.rents.length - 1]._id
          // type
          this.changeType.type = (row.rents[row.rents.length - 1].type && row.rents[row.rents.length - 1].type.type) || []
          this.changeType.typeTime = (row.rents[row.rents.length - 1].type && row.rents[row.rents.length - 1].type.typeTime) || {
            1: '',
            2: '',
            3: ''
          }
          this.changeType.isIndeterminate = (row.rents[row.rents.length - 1].type && row.rents[row.rents.length - 1].type.isIndeterminate) || false
          this.changeType.checkAll = (row.rents[row.rents.length - 1].type && row.rents[row.rents.length - 1].type.checkAll) || false

          this.changeType.payType = row.rents[row.rents.length - 1].lease.payType || 0
          this.changeType.remark = row.rents[row.rents.length - 1].remark || ''
        }
      },
      getResetChangeType () {
        this.changeType.fanghao = ''
        this.changeType.rentId = ''
        this.changeType.type = []
        this.changeType.typeTime = {
          1: '',
          2: '',
          3: ''
        }
        this.changeType.isIndeterminate = false
        this.changeType.checkAll = false

        this.changeType.payType = 0
        this.changeType.remark = ''
      },
      onChangeTypeDialogClose () {
        this.getResetChangeType()
      },
      onChangeType (value) {
        let checkedCount = value.length
        value[checkedCount - 1] && !this.changeType.typeTime[value[checkedCount - 1]] && (this.changeType.typeTime[value[checkedCount - 1]] = new Date())
        this.types.forEach((i) => {
          value.indexOf(i.value) === -1 && (this.changeType.typeTime[i.value] = '')
        })
        this.changeType.checkAll = checkedCount === this.types.length
        this.changeType.isIndeterminate = checkedCount > 0 && checkedCount < this.types.length
      },
      onCheckAllChange (event) {
        this.changeType.type = event.target.checked ? [1, 2, 3] : []
        for (var i in this.changeType.typeTime) {
          this.changeType.typeTime[i] = !this.changeType.typeTime[i] && event.target.checked ? new Date() : (!event.target.checked ? '' : this.changeType.typeTime[i])
        }
        this.changeType.isIndeterminate = false
      },
      getChangeType () {
        if (this.gettingChangeType) {
          return true
        }
        this.gettingChangeType = true
        let _data = Object.assign({}, this.changeType)
        this.Ajax('/inner/rent/type', _data, (res) => {
          this.$message({
            type: 'success',
            message: '状态更新成功',
            duration: 2000
          })
          this.getChangeTypeDialog()
          this.gettingChangeType = false
          this.getListRefresh()
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
          this.gettingChangeType = false
        })
      },
      getDelRent (index, row) {
        if (row.gettingdelRent) {
          return true
        }
        row.gettingdelRent = true
        this.Ajax('/inner/rent/del', {
          _id: row.rents[row.rents.length - 1]._id,
          haoId: row._id
        }, (res) => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 2000
          })
          row.gettingdelRent = false
          this.getListRefresh()
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
          row.gettingdelRent = false
        })
      },
      getLandordRent () {
        if (this.gettingLandordRent) {
          return true
        }
        this.gettingLandordRent = true
        this.Ajax('/inner/rent/listByLandord', {
          monthId: this.$route.query.id
        }, (res) => {
          this.landordData = res.body.data
          for (var i in res.body.data) {
            this.activeDate.push(new Date(Number(i)).toLocaleDateString())
            this.landordHistorySearch = new Date(Number(i)).toLocaleDateString()
            break
          }
          this.gettingLandordRent = false
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
          this.gettingLandordRent = false
        })
      },
      getfilterLandordData (v) {
        if (!v) {
          return false
        } else {
          this.activeDate = [new Date(v).toLocaleDateString()]
        }
      },
      getLandordRentTemp () {
        if (this.gettingLandordRentTemp) {
          return true
        }
        this.gettingLandordRentTemp = true
        this.Ajax('/inner/rent/listByLandordTemp', {
          monthId: this.$route.query.id
        }, (res) => {
          this.landordHistoryTemp = res.body.data
          this.gettingLandordRentTemp = false
        }, (res) => {
          this.$message({
            type: 'error',
            message: '编号：' + res.body.code + '，' + res.body.msg,
            duration: 2000
          })
          this.gettingLandordRentTemp = false
        })
      },
      getCalRentCount () {
        this.rentCount = {}
        this.monthDetData.forEach((i) => {
          if (i.rents[0]) {
            let floor = i.hao.substr(0, 1)
            let rent = i.rents[0].lease.rent
            !this.rentCount[i.fang] && (this.rentCount[i.fang] = {
              count: 0,
              list: {}
            }) && (this.activeRentCount[i.fang] = [])
            !this.rentCount[i.fang].list[floor] && (this.rentCount[i.fang].list[floor] = {
              count: 0,
              list: []
            })
            this.rentCount[i.fang].count += rent
            this.rentCount[i.fang].list[floor].count += rent
            this.rentCount[i.fang].list[floor].list.push({
              haoId: i._id,
              hao: i.hao,
              rent: rent
            })
          }
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
