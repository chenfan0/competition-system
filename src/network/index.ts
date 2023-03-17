import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { BASE_URL } from '@/constant'
import { useUserStore } from '@/store/user.store'
import router from '@/router'

interface Interceptors<V, T> {
  requestFullFilled?: ((value: V) => V | Promise<V>) | null
  requestRejected?: ((error: any) => any) | null
  responseFullFilled?: ((value: T) => T | Promise<T>) | null
  responseRejected?: ((error: any) => any) | null
}

class SelfAxios {
  private instance: AxiosInstance
  constructor(
    baseURL: string,
    timeout = 10000,
    interceptors?: Interceptors<InternalAxiosRequestConfig, AxiosResponse>,
  ) {
    this.instance = axios.create({
      baseURL,
      timeout,
    })
    if (interceptors) {
      this.instance.interceptors.request.use(
        interceptors.requestFullFilled,
        interceptors.requestRejected,
      )
      this.instance.interceptors.response.use(
        interceptors.responseFullFilled,
        interceptors.responseRejected,
      )
    }
  }

  request(config: AxiosRequestConfig) {
    return this.instance.request(config)
  }

  get(config: AxiosRequestConfig) {
    const userStore = useUserStore()
    const token = userStore.userInfo.token
    const headers = config.headers || {}
    headers.Authorization = `Bearer ${token}`
    return this.request({
      method: 'get',
      ...config,
      headers,
    })
  }

  post(config: AxiosRequestConfig) {
    const userStore = useUserStore()
    const token = userStore.userInfo.token
    const headers = config.headers || {}
    headers.Authorization = `Bearer ${token}`

    return this.request({
      method: 'post',
      ...config,
      headers,
    })
  }
}

export const requestInstance = new SelfAxios(BASE_URL, 10000, {
  requestFullFilled: (config) => {
    return config
  },
  responseFullFilled: (response) => {
    const data = response.data
    if (data.code === 200 && typeof data.data === 'string') {
      ElMessage.success({
        message: data.data,
      })
    }
    if (data.code !== 200) {
      ElMessage({
        type: 'error',
        message: data.data,
      })
    }

    return data
  },
  responseRejected: (e) => {
    const res = e.response
    if (res.status === 401) {
      const userStore = useUserStore()
      userStore.clear(['token', 'role'])

      router.push({
        path: '/login',
      })
    }
    ElMessage({
      type: 'error',
      message: res.data.data,
    })
  },
})
