<template>
  <div class="auth-login"
    id="large-header"
    @keyup.enter="getLogin">
    <!--  :style="{backgroundImage:'url('+ bingBg +')'}" -->
    <canvas id="index-canvas"></canvas>
    <el-card class="login-wrap">
      <div class="login-hello">
        Hello {{logininfo.name}} <i></i>
      </div>
      <el-form
        ref="logininfo"
        :model="logininfo"
        :rules="loginrules">
        <el-form-item
          prop="name">
          <el-input
            placeholder="Name"
            icon="star-on"
            :maxlength="10"
            v-model="logininfo.name">
          </el-input>
        </el-form-item>
        <el-form-item
          prop="pwd">
          <el-input
            type="password"
            placeholder="Pwd"
            icon="star-on"
            v-model="logininfo.pwd">
          </el-input>
        </el-form-item>
        <el-button class="login-go"
          type="primary"
          :loading="logininfo.loading"
          @click="getLogin">
          登陆
        </el-button>
      </el-form>
      <div class="beian">
        <a
          href="http://www.miitbeian.gov.cn/"
          target="_blank">
          粤ICP备17164727号-1<br>
          粤ICP备17164727号-2
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

  export default {
    name: 'auth-login',
    created() {
      // this.getBingBg()
    },
    mounted() {
      indexCanvas()
    },
    data() {
      return {
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
    methods: {
      // bing背景
      async getBingBg() {
        await this.Ajax('/outer/log/bingBg', {})
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
              message: '登陆成功',
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
      bottom: -35px;
      left: 0;
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
