import { defineStore } from 'pinia'
import { getCompetitionUser, getCompetitionList } from '@/network/competition'
import { UserRole } from '@/constant'

export const useCompetitionListStore = defineStore(
  'competitionListStore',
  () => {
    const competitionList = ref<any[]>([])
    const total = ref<number>(0)
    const filterData = ref<{
      name: string
      status: string
      level: string
    }>({ name: '', status: '', level: '' })

    const paginationData = ref<{
      currentPage: number
      pageSize: number
    }>({
      currentPage: 1,
      pageSize: 5,
    })

    async function getCompetitionListDataAction(
      type: 'page' | 'size' | 'init' | 'name' | 'level' | 'status',
      newValue?: number,
    ) {
      switch (type) {
        case 'page':
          paginationData.value.currentPage = newValue!
          break
        case 'size':
          paginationData.value.pageSize = newValue!
          break
        case 'init':
        case 'level':
        case 'name':
        case 'status':
          break
        default:
          return
      }
      const currentPage = paginationData.value.currentPage
      const pageSize = paginationData.value.pageSize
      try {
        const { data } = await getCompetitionList(
          (currentPage - 1) * pageSize,
          pageSize,
          {
            name: filterData.value.name,
            level: filterData.value.level,
            status: filterData.value.status,
          },
        )
        total.value = data.total as number
        data.list.forEach((item: any) => {
          item.registrationTime = [
            item.registrationStartTime,
            item.registrationEndTime,
          ]
          item.workSubmissionTime = [
            item.workSubmissionStartTime,
            item.workSubmissionEndTime,
          ]
          item.instructorsNums = JSON.parse(item.instructorsNums || '[]')
          item.signUpNums = JSON.parse(item.signUpNums || '[]')
          item.judges = JSON.parse(item.judges || '[]')
          item.files = JSON.parse(item.files || '[]')
          item.imgs = JSON.parse(item.imgs || '[]')
        })
        competitionList.value = data.list
      } catch (e) {
        console.error(e)
      }
    }

    async function getCompetitionJudgesAction(prefix: string) {
      const { data } = await getCompetitionUser(prefix, UserRole.teacher)
      return data
    }

    return {
      competitionList,
      total,
      filterData,
      paginationData,

      getCompetitionListDataAction,
      getCompetitionJudgesAction,
    }
  },
)
