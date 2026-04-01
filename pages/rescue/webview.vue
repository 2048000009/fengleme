<script setup lang="ts">
import { ref, onMounted } from 'vue'

const url = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any
  if (options.url) {
    url.value = decodeURIComponent(options.url)
  }
})
</script>

<template>
  <view class="container">
    <web-view :src="url"></web-view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
}
</style>
