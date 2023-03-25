<template>
  <div class="release-wrapper">
    <CompetitionForm type="create" />
  </div>
</template>
<script setup lang="ts">
import CompetitionForm from '@/components/CompetitionForm.vue'
</script>
<style scoped lang="less">
.release-wrapper {
  height: calc(100vh - 70px);
  box-sizing: border-box;
  padding: 30px 0;
}
</style>
