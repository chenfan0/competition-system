<template>
  <div class="login-register-wrapper">
    <div class="login-register">
      <el-card shadow="hover" class="card">
        <div class="title">竞赛管理系统</div>
        <div class="login-form" v-if="isLogin">
          <el-form
            ref="loginRef"
            :status-icon="true"
            :model="loginForm"
            key="login"
            :rules="loginRule"
          >
            <el-form-item prop="phone">
              <el-input
                v-model="loginForm.phone"
                :clearable="true"
                :prefix-icon="UserFilled"
                placeholder="请输入手机号码"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                :show-password="true"
                :prefix-icon="Lock"
                placeholder="请输入密码"
              />
            </el-form-item>
          </el-form>
          <div class="btn">
            <el-button type="primary" class="login-btn" @click="handleLogin">
              登录
            </el-button>
            <span class="register" @click="handleLoginOrRegister('register')">
              注册
            </span>
          </div>
        </div>
        <div class="register-form" v-else>
          <el-form
            ref="registerRef"
            :status-icon="true"
            :model="registerForm"
            key="register"
            :rules="registerRule"
          >
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                :clearable="true"
                :prefix-icon="UserFilled"
                placeholder="请输入手机号码"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                :show-password="true"
                :prefix-icon="Lock"
                placeholder="请输入密码"
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                :show-password="true"
                :prefix-icon="Lock"
                placeholder="请确认密码"
              />
            </el-form-item>
            <el-form-item prop="captcha">
              <div class="captcha">
                <div
                  style="cursor: pointer; margin-right: 10px"
                  v-html="svg"
                  @click="handleChangeCaptcha"
                />
                <el-input
                  placeholder="请输入验证码"
                  style="height: 32px"
                  v-model="registerForm.captcha"
                />
              </div>
            </el-form-item>
            <el-form-item prop="sCode">
              <div class="s-captcha">
                <el-input
                  placeholder="请输入短信验证码"
                  v-model="registerForm.sCode"
                />
                <el-button
                  type="primary"
                  style="margin-left: 10px"
                  :disabled="sendSmsDisable"
                  @click="handleSendMessage"
                >
                  {{ sendSmsBtnMsg }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item prop="role">
              <el-radio-group v-model="registerForm.role" class="radio">
                <el-radio :label="0" size="large">学生</el-radio>
                <el-radio :label="1" size="large">教师</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <div class="btn">
            <el-button
              type="primary"
              class="register-btn"
              @click="handleRegister"
            >
              注册
            </el-button>
            <span class="back" @click="handleLoginOrRegister('login')">
              返回
            </span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserFilled, Lock } from '@element-plus/icons-vue'
import { FormInstance, FormRules } from 'element-plus'

import { useUserStore } from '@/store/user.store'
import { PhoneReg, whiteUserList } from '@/constant'
import { getCaptcha, getSCaptcha } from '@/network/login'

const userStore = useUserStore()
const router = useRouter()

const loginRef = ref<FormInstance>()
const registerRef = ref<FormInstance>()
let isLogin = ref(true)
const loginForm = ref({
  phone: userStore.userInfo.phone,
  password: userStore.userInfo.password,
})

const svg = ref<string>('')
const svgText = ref<string>('')
const sendSmsDisable = ref(true)
const sendSmsBtnMsg = ref<string | number>('发送验证码')
const countdown = ref(60)
const intervalId = ref<number | null>(null)

const loginRule: FormRules = {
  phone: [
    {
      required: true,

      trigger: 'blur',
      message: '手机号不能为空',
    },
    {
      trigger: 'blur',
      validator(_, value) {
        if (whiteUserList.includes(value)) {
          return true
        }
        if (PhoneReg.test(value)) {
          return true
        }
        return false
      },
      message: '手机号格式错误',
    },
  ],
  password: [
    {
      required: true,
      trigger: 'blur',
      message: '密码不能为空',
    },
    {
      min: 6,
      trigger: 'blur',
      message: '密码不能少于6个字符',
    },
  ],
}
const registerForm = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  role: 0,
  captcha: '',
  sCode: '',
})

const registerRule: FormRules = {
  ...loginRule,
  confirmPassword: {
    validator(_, value) {
      if (value === registerForm.value.password) {
        return true
      }
      return false
    },
    message: '密码不一致',
  },
  captcha: {
    trigger: 'change',
    validator(_, value: string) {
      if (value.toLocaleLowerCase() === svgText.value.toLocaleLowerCase()) {
        sendSmsDisable.value = false
        return true
      }
      sendSmsDisable.value = true
      return false
    },
    message: '验证码错误',
  },
  sCode: {
    required: true,
    trigger: 'blur',
    message: '短信验证码不能为空',
  },
}

const handleLoginOrRegister = (type: 'login' | 'register') => {
  type === 'login' && (isLogin.value = true)
  if (type === 'login') {
    isLogin.value = true
    registerForm.value.phone = ''
    registerForm.value.password = ''
    registerForm.value.confirmPassword = ''
    registerForm.value.role = 0
    registerForm.value.captcha = ''
    registerForm.value.sCode = ''
    clearInterval(intervalId.value!)
    countdown.value = 60
    sendSmsBtnMsg.value = '发送验证码'
    sendSmsDisable.value = false
  } else {
    isLogin.value = false
    loginForm.value.phone = ''
    loginForm.value.password = ''
  }
}

const handleLogin = async () => {
  try {
    await loginRef.value!.validate()
    const { phone, password } = loginForm.value
    await userStore.loginAction(phone, password)
    router.push({
      path: '/',
    })
  } catch (e) {
    console.error(e)
  }
}

const handleRegister = async () => {
  try {
    await registerRef.value!.validate()
    const { phone, password, role, sCode } = registerForm.value
    userStore.registerAction(phone, password, role, sCode).then((res: any) => {
      if (res.code === 200) {
        console.log('====')

        handleLoginOrRegister('login')
      }
    })
  } catch (e) {
    console.error(e)
  }
}

const handleSendMessage = () => {
  if (!PhoneReg.test(registerForm.value.phone)) {
    ElMessage.error({
      message: '无效的手机号',
    })
    return
  }
  getSCaptcha(registerForm.value.phone)
  intervalId.value = handleCountdown()
  sendSmsDisable.value = true
}

const requestCaptcha = () => {
  getCaptcha().then((res) => {
    const data = res.data
    svg.value = data.data
    svgText.value = data.text
  })
}
requestCaptcha()
const handleChangeCaptcha = () => {
  requestCaptcha()
}

const handleCountdown = () => {
  const id = setInterval(() => {
    countdown.value -= 1
    sendSmsBtnMsg.value = `${countdown.value}秒后重新发送`
    if (countdown.value === 0) {
      countdown.value = 60
      sendSmsBtnMsg.value = '发送验证码'
      sendSmsDisable.value = false
      clearInterval(id)
    }
  }, 1000)
  return id
}

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped lang="less">
.login-register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .login-register {
    width: 25%;
    .card {
      height: 100%;
      border-radius: 10px;
      .title {
        font-size: 26px;
        color: #9ea1a8;
        font-weight: 400;
        text-align: center;
      }

      .login-form,
      .register-form {
        margin-top: 40px;
      }

      .captcha,
      .s-captcha {
        display: flex;
        margin-bottom: 5px;
        align-items: center;
      }

      .s-captcha {
        width: 100%;
      }

      .radio {
        display: flex;
        justify-content: space-around;
        width: 100%;
      }

      .btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0px 0 5px 0;

        .login-btn,
        .register-btn {
          width: 100%;
          margin-bottom: 10px;
        }

        .register,
        .back {
          font-size: 14px;
          text-decoration: underline;
          cursor: pointer;
          color: #9ea1a8;

          &:hover {
            color: #000;
          }
        }
      }
    }
  }
}
</style>
