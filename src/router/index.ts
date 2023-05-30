import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user.store'

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    component: () => import('@/pages/main/Main.vue'),
    redirect: () => ({ path: '/home-page' }),
    name: 'main',
    children: [
      {
        path: '/home-page',
        name: 'homePage',
        component: () => import('@/pages/main/pages/home-page/HomePage.vue'),
      },
      {
        path: '/competition',
        name: 'competition',
        component: () =>
          import('@/pages/main/pages/competition-list/CompetitionList.vue'),
      },
      {
        path: '/competition/detail/:id',
        name: 'detail',
        component: () =>
          import('@/pages/main/pages/competition-detail/CompetitionDetail.vue'),
      },
      {
        path: '/judge/:id',
        name: 'judge',
        component: () => import('@/pages/main/pages/judge/Judge.vue'),
      },
      {
        path: '/my-competition',
        name: 'my-competition',
        component: () =>
          import('@/pages/main/pages/my-competition/MyCompetition.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/Login.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const releaseRoute = {
  path: '/release',
  name: 'release',
  component: () =>
    import('@/pages/main/pages/release-competition/ReleaseCompetition.vue'),
}

export const userListRoute = {
  path: '/user-list',
  name: 'userList',
  component: () => import('@/pages/main/pages/user-list/UserList.vue'),
}

export const selfRoute = {
  path: '/self',
  name: 'self',
  component: () => import('@/pages/main/pages/personal/Personal.vue'),
}
router.beforeEach((to) => {
  const userStore = useUserStore()
  const { token } = userStore.userInfo

  if (token === '' && to.name !== 'login') {
    return '/login'
  }

  return true
})

export default router
