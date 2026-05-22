<template>
  <div class="scene-layer" :style="bgStyle">
    <img
      :src="bgSrc"
      class="scene-bg"
      alt="酒馆背景"
      @load="onBgLoad"
    />
    <!-- 氛围粒子效果 -->
    <div class="particles" v-if="loaded">
      <div
        v-for="i in 8"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores'
import bg0 from '@/assets/scene/background0.png'
import bg1 from '@/assets/scene/background1.png'

const store = useAppStore()
const loaded = ref(false)

const bgSrc = computed(() => store.background === '0' ? bg0 : bg1)

const bgStyle = computed(() => ({
  opacity: loaded.value ? 1 : 0,
  transition: 'opacity 0.8s ease'
}))

function onBgLoad() {
  loaded.value = true
}

function getParticleStyle(i: number) {
  const left = 10 + (i * 11) % 80
  const delay = i * 0.7
  const duration = 3 + (i % 3)
  return {
    left: `${left}%`,
    bottom: `${10 + (i * 5) % 40}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}
</script>

<style scoped lang="scss">
.scene-layer {
  position: fixed;
  inset: 0;
  z-index: 10;
  overflow: hidden;
}

.scene-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 200, 100, 0.6);
  border-radius: 50%;
  animation: floatUp linear infinite;
  filter: blur(1px);
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-120px) scale(0.3);
    opacity: 0;
  }
}

@media (min-width: 768px) {
  .scene-layer {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1a1a2e;
  }
  .scene-bg {
    max-width: 480px;
    height: 100vh;
  }
}
</style>
