import axios from 'axios'
import { useUserStore } from '../store/user.store'
import { storage } from './localstorage'
import { BASE_URL } from '@/constant'
import { UserRole } from '@/constant/index'
import router, { releaseRoute, userListRoute } from '@/router'

export async function downloadFile(filename: string, originalname: string) {
  const userStore = useUserStore()
  try {
    const { data } = await axios.get(`${BASE_URL}/file/${filename}`, {
      headers: {
        Authorization: `Bearer ${userStore.userInfo.token}`,
      },
      responseType: 'blob',
    })
    const blob = new Blob([data])
    const a = document.createElement('a') as HTMLAnchorElement
    a.href = URL.createObjectURL(blob)
    a.download = originalname
    a.click()
  } catch (e) {
    console.error(e)
  }
}

export function processReleaseRouter() {
  const userStore = storage.get('userStore') || {}
  const role = userStore.userInfo?.role
  if ([UserRole.teacher, UserRole.admin].includes(role)) {
    router.addRoute('main', releaseRoute)
  }

  if (role === UserRole.admin) {
    router.addRoute('main', userListRoute)
  }
}
