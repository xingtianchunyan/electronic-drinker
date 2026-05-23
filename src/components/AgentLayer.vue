<template>
  <div class="agent-layer">
    <!-- 角色主体 -->
    <div class="agent-container" :class="{ drinking: isDrinking, speaking: isSpeaking, listening: isListening }">
      <img
        :src="agentSrc"
        class="agent-body"
        alt="小酒"
        @load="onAgentLoad"
      />
    </div>

    <!-- 状态指示器 -->
    <div class="agent-status" v-if="showStatus">
      <span class="status-dot" :class="statusClass"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores'
import actorImg from '@/assets/agent/actor.jpeg'

const store = useAppStore()
const loaded = ref(false)

const agentSrc = computed(() => actorImg)

const isDrinking = computed(() => store.agentState === 'drinking')
const isSpeaking = computed(() => store.agentState === 'speaking')
const isListening = computed(() => store.agentState === 'listening')

const showStatus = computed(() => store.agentState !== 'idle')

const statusClass = computed(() => {
  switch (store.agentState) {
    case 'drinking': return 'drinking'
    case 'speaking': return 'speaking'
    case 'listening': return 'listening'
    default: return ''
  }
})

const statusText = computed(() => {
  switch (store.agentState) {
    case 'drinking': return '饮酒中...'
    case 'speaking': return '说话中...'
    case 'listening': return '聆听中...'
    default: return ''
  }
})

function onAgentLoad() {
  loaded.value = true
}
</script>

<style scoped lang="scss">
.agent-layer {
  position: fixed;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.agent-container {
  position: relative;
  transition: transform 0.3s ease;
}

.agent-container.drinking {
  animation: drinkBounce 0.6s ease-in-out 3;
}

.agent-container.speaking {
  animation: gentleBounce 1.5s ease-in-out infinite;
}

.agent-body {
  width: 220px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.agent-status {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #aaa;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-dot.drinking {
  background: #FF6B6B;
}

.status-dot.speaking {
  background: #4ECDC4;
}

.status-dot.listening {
  background: #FFE66D;
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes drinkBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(-3deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-4px) rotate(2deg); }
}

@keyframes gentleBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (min-width: 768px) {
  .agent-body {
    width: 260px;
  }
}
</style>
