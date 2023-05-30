import { requestInstance } from './index'
export function getUserList(pageSize = 10, offset = 0, filter: string) {
  return requestInstance.get({
    url: `/user/list?pageSize=${pageSize}&offset=${offset}&filter=${filter}`,
  })
}
export function updateUserIsDisable(user: string, isDisable: number) {
  return requestInstance.post({
    url: `/user/update/is-disable`,
    data: {
      user,
      isDisable,
    },
  })
}

export function updateUserInterested(interested: number[]) {
  return requestInstance.post({
    url: '/user/update/interested',
    data: {
      interested,
    },
  })
}

export function getUserAwardList() {
  return requestInstance.get({
    url: '/user/award/list',
  })
}
