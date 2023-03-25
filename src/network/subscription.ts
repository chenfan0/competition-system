import { requestInstance } from './index'

export function subscribe(competitionId: number) {
  return requestInstance.post({
    url: '/subscription/subscribe',
    data: {
      competitionId,
    },
  })
}
