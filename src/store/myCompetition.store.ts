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

  const filterCompetitionName = ref('')

  const getMyCompetitionDataAction = async ({
    currentPage,
    pageSize,
    field,
  }: {
    currentPage: number
    pageSize: number
    field: FieldType
  }) => {
    const role = useUserStore().userInfo.role
    let getMyCompetitionDataRequest: (requestData: {
      competitionName: string
      offset: number
      pageSize: number
      field: string
    }) => Promise<AxiosResponse<any, any>>
    switch (role) {
      case UserRole.student:
        getMyCompetitionDataRequest = getSelfCompetition
        break
      case UserRole.teacher:
        break
      case UserRole.admin:
        break
    }
    const { data } = await getMyCompetitionDataRequest!({
      competitionName: filterCompetitionName.value,
      offset: (currentPage - 1) * pageSize,
      pageSize: pageSize,
      field,
    })
    const keys = Object.keys(data)
    for (const key of keys) {
      data[key].rows.forEach((item: any) => {
        item.instructors = JSON.parse(item.instructors || '[]')
        item.member = JSON.parse(item.member || '[]')
        item.rejectMember = JSON.parse(item.rejectMember || '[]')
        item.resolveMember = JSON.parse(item.resolveMember || '[]')
        item.totalMember = [item.leader, ...item.member, ...item.instructors]
      })
    }
    myCompetitionData.value = data
  }

  return {
    myCompetitionData,
    tabPanelData,
    activeName,
    paginationData,
    filterCompetitionName,

    getMyCompetitionDataAction,
  }
})
