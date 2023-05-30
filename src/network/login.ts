import { requestInstance } from '.'

export function login(phone: string, password: string) {
  return requestInstance.post({
    url: '/login',
    data: {
      password,
      phone,
    },
  })
}

export function register(
  phone: string,
  password: string,
  role: number,
  sCode: string,
) {
  return requestInstance.post({
    url: '/register',
    data: {
      password,
      phone,
      role,
      sCode,
    },
  })
}

export function getCaptcha() {
  return requestInstance.get({
    url: '/register/captcha',
  })
}

export function getSCaptcha(phone: string) {
  return requestInstance.get({
    url: `/register/s-captcha?phone=${phone}`,
  })
}
