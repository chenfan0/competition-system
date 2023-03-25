import { defineStore } from 'pinia'
import { AxiosResponse } from 'axios'
import { UserRole } from '../constant/index'
import { getSelfCompetition } from '../network/competition'
import { useUserStore } from './user.store'

type FieldType =
  | 'signUpedList'
  | 'signUpingList'
  | 'confirmList'
  | 'instructoredList'
  | 'instructoringList'
  | 'judgementList'
  | 'releaseList'

const RoleToTabPanelDataMap = {
  0: ['signUpedList', 'signUpingList', 'confirmList'],
  1: [
    'instructoredList',
    'instructoringList',
    'confirmList',
    'judgementList',
    'releaseList',
  ],
  2: ['releaseList'],
} as { [key: number]: FieldType[] }

export const useMyCompetitionStore = defineStore('myCompetitionStore', () => {
  const myCompetitionData = ref<Record<string, any>>({})
  const tabPanelData = ref(RoleToTabPanelDataMap[useUserStore().userInfo.role])
  const activeName = ref<string>(tabPanelData.value[0])
  const paginationData = ref<{
    currentPage: number
    pageSize: number
  }>({
    currentPage: 1,
    pageSize: 5,
  })

  return {
    myCompetitionData,
    tabPanelData,
    activeName,
    paginationData,
  }
})
