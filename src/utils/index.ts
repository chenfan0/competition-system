import axios from 'axios'
import { useUserStore } from '../store/user.store'
import { BASE_URL } from '@/constant'

export async function downloadFile(filename: string, originalname: string) {
  const userStore = useUserStore()
  try {
    const { data } = await axios.get(`${BASE_URL}/file/${filename}`, {
      headers: {
        Authorization: `Bearer ${userStore.userInfo.token}`,
      },
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
