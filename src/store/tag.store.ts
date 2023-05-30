import { defineStore } from 'pinia'
import { getTagList } from '@/network/tag'

export const useTagStore = defineStore('tag', () => {
  const tagList = ref<{ label: string; value: string }[]>([])

  function getTagListAction() {
    if (tagList.value.length) {
      return
    }
    getTagList().then((res) => {
      tagList.value = res.data
    })
  }

  return { tagList, getTagListAction }
})
