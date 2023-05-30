import { requestInstance } from './index'

export function getTagList() {
  return requestInstance.get({
    url: '/tag',
  })
}
