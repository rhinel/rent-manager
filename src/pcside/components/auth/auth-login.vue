<template>
  <div
    class="auth-login"
    id="large-header"
    @keyup.enter="getLogin">
    <!--  :style="{ backgroundImage:'url('+ bingBg +')' }" -->
    <canvas id="index-canvas" />
    <el-card class="login-wrap">
      <div class="login-hello">
        Rent Manager
      </div>
      <div class="login-hello">
        Hello {{ logininfo.name }} <i />
      </div>
      <el-form
        :model="logininfo"
        :rules="loginrules"
        ref="logininfo">
        <el-form-item prop="name">
          <el-input
            v-model="logininfo.name"
            placeholder="Name"
            icon="star-on"
            :maxlength="10" />
        </el-form-item>
        <el-form-item prop="pwd">
          <el-input
            v-model="logininfo.pwd"
            type="password"
            placeholder="Pwd"
            icon="star-on" />
        </el-form-item>
        <el-button
          class="login-go"
          type="primary"
          :loading="logininfo.loading"
          @click="getLogin">
          登录
        </el-button>
      </el-form>
      <div class="beian">
        <div>v{{ version }}</div>
        <div>幻想万国（深圳）科技有限公司，版权所有</div>
        <a
          href="http://beian.miit.gov.cn/"
          target="_blank">
          粤ICP备17164727号
        </a>
      </div>
    </el-card>
  </div>
</template>

<script>
  import Md5 from 'md5'
  /* eslint-disable no-unused-vars */
  import '../../js/indexCanvas/easePack.min'
  import '../../js/indexCanvas/tweenLite.min'
  /* eslint-enable no-unused-vars */
  import indexCanvas from '../../js/indexCanvas/indexCanvas'
  import { version } from '../../../../package.json'

  export default {
    name: 'AuthLogin',
    data() {
      return {
        version,
        bingBg: '',
        logininfo: {
          name: '',
          pwd: '',
          loading: false,
        },
        loginrules: {
          name: [
            { required: true, message: '请填写', trigger: 'blur change' },
          ],
          pwd: [
            { required: true, message: '请填写', trigger: 'blur change' },
            { min: 3, message: '太短了', trigger: 'blur' },
          ],
        },
      }
    },
    created() {
      // this.getBingBg()
    },
    mounted() {
      indexCanvas()
    },
    methods: {
      // bing背景
      async getBingBg() {
        await this.Ajax('/outer/log/bingBg')
          .then(res => {
            this.bingBg = res.fav.murl
          })
          .catch(() => {})
      },
      // 登录
      async getLogin() {
        if (this.logininfo.loading) return

        // 表单校验
        try {
          await this.$refs.logininfo.validate()
        } catch (err) {
          return
        }

        // 接口提交
        this.logininfo.loading = true

        await this.Ajax('/outer/log/login', {
          name: this.logininfo.name,
          pwd: Md5(this.logininfo.pwd),
        })
          .then(res => {
            localStorage.setItem('token', res)
            return this.$store.dispatch('getDefaults')
          })
          .then(() => {
            this.$message({
              type: 'success',
              message: '登录成功',
              duration: 2000,
            })
            if (this.$route.query.backurl) {
              this.$router.push(this.$route.query.backurl)
            } else {
              this.$router.push('/inner')
            }
          })
          .catch(() => {})

        this.logininfo.loading = false
      },
    },
  }
</script>

<style lang="scss">
.auth-login {
  height: 100%;
  width: 100%;
  position: relative;
  background-size: cover;
  background-position: center center;
  background-image: url(../../img/index_intro_bg.jpg);

  .login-wrap {
    width: 500px;
    max-width: 90%;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    overflow: visible;

    .beian {
      width: 100%;
      text-align: center;
      position: absolute;
      bottom: -70px;
      line-height: 30px;
      left: 0;
      color: #fff;

      a {
        color: #fff;
        text-decoration: none;
      }
    }
  }

  .login-hello {
    font-size: 30px;
    text-align: center;
    margin-bottom: 20px;

    @keyframes hello {
      0% {
        opacity: 0;
      }

      50% {
        opacity: 1;
      }

      100% {
        opacity: 0;
      }
    }

    & > i {
      display: inline-block;
      width: 15px;
      height: 5px;
      background-color: #666;
      opacity: 0;
      animation: hello 1.5s infinite;
    }
  }

  .login-go {
    width: 100%;
  }

  #index-canvas {
    width: 100vw;
    height: 100vh;
    display: block;
  }
}
</style>
