<template>
  <div class="bubble-layer">
    <transition-group name="bubble">
      <div
        v-for="bubble in bubbles"
        :key="bubble.id"
        class="bubble"
        :class="{ 'user-bubble': bubble.sender === 'user', 'agent-bubble': bubble.sender === 'agent' }"
        @click="removeBubble(bubble.id)"
      >
        <p class="bubble-text">{{ bubble.text }}</p>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'

const store = useAppStore()
const bubbles = store.bubbles

function removeBubble(id: string) {
  const idx = bubbles.findIndex(b => b.id === id)
  if (idx !== -1) bubbles.splice(idx, 1)
}
</script>

<style scoped lang="scss">
.bubble-layer {
  position: fixed;
  top: 12%;
  left: 0;
  right: 0;
  z-index: 30;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
}

.bubble {
  max-width: 75%;
  padding: 10px 16px;
  border-radius: 16px;
  pointer-events: auto;
  cursor: pointer;
  animation: bubbleIn 0.3s ease-out;
  word-break: break-word;
  line-height: 1.5;
  font-size: 14px;
}

.bubble-text {
  margin: 0;
}

.user-bubble {
  align-self: flex-end;
  background: rgba(74, 144, 217, 0.85);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.agent-bubble {
  align-self: flex-start;
  background: rgba(245, 166, 35, 0.85);
  color: #333;
  border-bottom-left-radius: 4px;
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.bubble-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (min-width: 768px) {
  .bubble-layer {
    max-width: 480px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
