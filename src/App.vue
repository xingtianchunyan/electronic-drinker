<template>
  <div id="app" class="app-container">
    <!-- 场景层 -->
    <SceneLayer />

    <!-- 角色层 -->
    <AgentLayer />

    <!-- 气泡层 -->
    <BubbleLayer />

    <!-- UI控制层 -->
    <UILayer />

    <!-- 麦克风按钮 -->
    <MicButton />

    <!-- 登录弹窗 -->
    <LoginModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores'
import SceneLayer from '@/components/SceneLayer.vue'
import AgentLayer from '@/components/AgentLayer.vue'
import BubbleLayer from '@/components/BubbleLayer.vue'
import UILayer from '@/components/UILayer.vue'
import MicButton from '@/components/MicButton.vue'
import LoginModal from '@/components/LoginModal.vue'

const store = useAppStore()

onMounted(() => {
  store.initFromStorage()
  // 如果有token，尝试恢复登录状态
  if (store.token) {
    store.background = '1'
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1a1a2e;
}

.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
