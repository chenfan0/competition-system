import { requestInstance } from '.'

export async function login(phone: string, password: string) {
  return requestInstance.post({
    url: '/login',
    data: {
      password,
      phone,
    },
  })
}

export async function register(phone: string, password: string, role: number) {
  return requestInstance.post({
    url: '/register',
    data: {
      password,
      phone,
      role,
    },
  })
}
