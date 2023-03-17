import { requestInstance } from '.'

export function createSignup(data: {
  competitionId: number
  mode: number
  teamName?: string
  leader: string
  member?: string[]
  instructors?: string[]
  competitionName: string
  work?: string
  video?: string
}) {
  return requestInstance.post({
    url: '/signup/create',
    data,
  })
}

export function confirmSignUp(signUpId: number) {
  return requestInstance.post({
    url: '/signup/confirm',
    data: {
      signUpId,
    },
  })
}

export function getSignUpListByCompetitionId(
  competitionId: number,
  alreadyProcess: number,
) {
  return requestInstance.get({
    url: `/signup/${competitionId}?alreadyProcess=${alreadyProcess}`,
  })
}

export function updateSignUpInfo(data: {
  id: number
  member?: string[]
  instructors?: string[]
  teamName?: string
  work?: string
  video?: string
}) {
  return requestInstance.post({
    url: '/signup/update',
    data,
  })
}

export function promoteSignUpBySignUpId(
  signUpId: number,
  currentRound: string,
) {
  return requestInstance.post({
    url: '/signup/promote',
    data: {
      signUpId,
      currentRound,
    },
  })
}

export function awardSignUpBySignUpId(signUpId: number, award: string) {
  return requestInstance.post({
    url: '/signup/award',
    data: {
      signUpId,
      award,
    },
  })
}
