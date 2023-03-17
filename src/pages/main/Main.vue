<template>
  <div class="main">
    <Header />

    <RouterView v-slot="{ Component }">
      <KeepAlive include="CompetitionList,ReleaseCompetition,MyCompetition">
        <component :is="Component"></component>
      </KeepAlive>
    </RouterView>
  </div>
</template>
<script setup lang="ts">
import Header from './components/Header.vue'
</script>
<style scoped lang="less">
.main {
  box-sizing: border-box;
  padding: 70px 20% 0 20%;
  ::-webkit-scrollbar {
    display: none;
  }
}
</style>
