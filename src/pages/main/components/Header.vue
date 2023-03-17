<template>
  <div class="header">
    <div class="header-left">
      <div
        class="competition header-item"
        :class="activeIndex === 0 ? 'active' : ''"
        @click="changePage(0, '/competition')"
      >
        竞赛列表
      </div>
      <div
        class="my-competition header-item"
        :class="activeIndex === 1 ? 'active' : ''"
        @click="changePage(1, '/my-competition')"
      >
        我的竞赛
      </div>
      <div
        class="release header-item"
        :class="activeIndex === 2 ? 'active' : ''"
        @click="changePage(2, '/release')"
      >
        发布竞赛
      </div>
    </div>
    <div class="login header-item" @click="exist">
      {{ userStore.userInfo.phone }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/store/user.store'
const router = useRouter()
const route = useRoute()

const userStore = useUserStore()

const pathToActiveIndexMap = {
  '/competition': 0,
  '/my-competition': 1,
  '/release': 2,
}

const activeIndex = ref(
  pathToActiveIndexMap[route.fullPath as keyof typeof pathToActiveIndexMap] ??
    1,
)
const changePage = (index: number, path?: string) => {
  activeIndex.value = index
  if (path) {
    router.push({
      path,
    })
  }
}

const exist = () => {
  userStore.clear(['role', 'token'])
  // userStore.
  location.assign('/login')
  // router.push({
  //   path: '/login',
  // })
}
</script>
<style scoped lang="less">
.header {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  color: #fff;
  font-size: 14px;
  line-height: 70px;
  background-color: #212121;
  padding: 0 20%;

  .header-item {
    height: 70px;
    padding: 0 20px;
    position: relative;
    &:hover {
      background-color: #000;
      cursor: pointer;
    }
  }

  .header-left {
    display: flex;
  }

  .login {
    &:hover {
      text-decoration: underline;
    }
  }

  .active {
    background-color: #000;
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 0);
      border: 5px solid transparent;
      border-bottom-color: white;
    }
  }
}
</style>
