import { requestInstance } from '.'

export async function createCompetition(data: any) {
  return requestInstance.post({
    url: '/competition/create',
    data,
  })
}

export function getCompetitionList(
  offset = 0,
  size = 10,
  { name, status, level } = { name: '', status: '', level: '' },
) {
  return requestInstance.get({
    url: `/competition/list?offset=${offset}&size=${size}&name=${name}&status=${status}&level=${level}`,
  })
}

export function getCompetitionDetail(id: string) {
  return requestInstance.get({
    url: `/competition/detail/${id}`,
  })
}

export function getCompetitionUser(prefix: string, role: number) {
  return requestInstance.get({
    url: `/competition/user?prefix=${prefix}&role=${role}`,
  })
}

export function getCompetitionFile(rawFilename: string) {
  const filename = encodeURIComponent(rawFilename)
  return requestInstance.get({
    url: `/file/${filename}`,
  })
}

export function getSelfCompetition({
  competitionName,
  offset,
  pageSize,
  field,
}: {
  competitionName: string
  offset: number
  pageSize: number
  field: string
}) {
  return requestInstance.get({
    url: `/competition/self?competitionName=${competitionName}&offset=${offset}&pageSize=${pageSize}&field=${field}`,
  })
}

export function setCompetitionNextRound(competitionId: number) {
  return requestInstance.post({
    url: '/competition/set/next',
    data: {
      competitionId,
    },
  })
}
