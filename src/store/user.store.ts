import { defineStore } from 'pinia'
import { login, register } from '@/network/login'

interface UserInfo {
  phone: string
  token: string
  role: number
  password: string
}

const defaultUserInfo = {
  phone: '',
  token: '',
  role: -1,
  password: '',
}

export const useUserStore = defineStore(
  'userStore',
  () => {
    const userInfo = ref<UserInfo>({ ...defaultUserInfo })
    async function loginAction(phone: string, password: string) {
      try {
        const { data, code } = (await login(phone, password)) as unknown as {
          data: any
          code: number
        }
        if (code !== 200) return
        const keys = Object.keys(data) as (keyof UserInfo)[]
        for (const key of keys) {
          const val = data[key]
          userInfo.value[key as 'phone'] = val
        }
        userInfo.value.password = password
      } catch (e) {
        console.error(e)
      }
    }

    function clear(keys?: (keyof UserInfo)[]) {
      if (!keys) {
        userInfo.value = { ...defaultUserInfo }
      } else {
        for (const key of keys) {
          userInfo.value[key] = defaultUserInfo[key] as never
        }
      }
    }

    async function registerAction(
      phone: string,
      password: string,
      role: number,
    ) {
      await register(phone, password, role)
    }

    return {
      userInfo,
      loginAction,
      registerAction,
      clear,
    }
  },
  {
    persist: true,
  },
)