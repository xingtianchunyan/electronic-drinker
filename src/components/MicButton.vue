<template>
  <div class="mic-layer">
    <!-- 文字输入模式切换 -->
    <button class="mode-toggle" @click="showTextInput = !showTextInput">
      {{ showTextInput ? '🎙️' : '⌨️' }}
    </button>

    <!-- 文字输入 -->
    <div v-if="showTextInput" class="text-input-area">
      <input
        ref="textInputRef"
        v-model="textInput"
        type="text"
        placeholder="跟小酒说点什么..."
        @keyup.enter="sendText"
      />
      <button class="send-btn" @click="sendText" :disabled="!textInput.trim() || processing">
        发送
      </button>
    </div>

    <!-- 语音按钮 -->
    <button
      v-else
      class="mic-btn"
      :class="{ disabled: processing }"
      @click="triggerVoice"
    >
      <span class="mic-icon">🎙️</span>
      <span class="mic-text">点击语音输入</span>
      <span v-if="processing" class="processing-indicator">处理中...</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores'
import { chatWithKimi, addMessage } from '@/services/kimiApi'
import { speak } from '@/services/ttsApi'
import { DaoAPI } from '@/services/daoApi'
import { triggerVoiceBridge } from '@/services/voiceBridge'
import { isDrinkIntent } from '@/utils/drinkIntent'
import { getRandomWine, generateWineIntro } from '@/utils/wineHelper'

const store = useAppStore()
const showTextInput = ref(false)
const textInput = ref('')
const processing = ref(false)
const textInputRef = ref<HTMLInputElement | null>(null)

function sendText() {
  const text = textInput.value.trim()
  if (!text || processing.value) return
  textInput.value = ''
  handleUserInput(text)
}

async function triggerVoice() {
  if (processing.value) return
  processing.value = true

  try {
    // 先切换到文字输入模式
    showTextInput.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    textInputRef.value?.focus()
    // 直接唤起语音桥接
    await triggerVoiceBridge()
  } catch (e: any) {
    alert('语音桥接失败: ' + e.message)
  } finally {
    processing.value = false
  }
}

async function handleUserInput(text: string) {
  if (processing.value) return
  processing.value = true

  store.addBubble(text, 'user')
  addMessage('user', text)

  store.agentState = 'speaking'

  try {
    // 检查是否是饮酒触发词
    const isDrinkRequest = isDrinkIntent(text)

    // 检查高频饮酒
    const recentDrinkCount = store.getRecentDrinkCount()
    if (isDrinkRequest && recentDrinkCount >= 3) {
      store.addBubble('喝慢点，身体要紧。咱们先聊聊天，缓缓再喝。', 'agent')
      await speak('喝慢点，身体要紧。咱们先聊聊天，缓缓再喝。')
      processing.value = false
      store.agentState = 'idle'
      return
    }

    // 调用 Kimi
    const response = await chatWithKimi(text, recentDrinkCount)

    // 处理 function call
    if (response.startsWith('[FUNC:drink_wine]')) {
      await handleDrinkRequest()
      return
    }

    // 处理 [DRINK] 标记
    let finalResponse = response
    if (finalResponse.includes('[DRINK]')) {
      finalResponse = finalResponse.replace('[DRINK]', '').trim()
      await handleDrinkRequest()
      return
    }

    // 显示回复
    store.addBubble(finalResponse, 'agent')
    addMessage('assistant', finalResponse)

    // 语音播报
    await speak(finalResponse)

  } catch (e: any) {
    console.error('对话处理失败:', e)
    const errorMsg = '哎呀，小酒脑袋有点晕，你再说一遍？'
    store.addBubble(errorMsg, 'agent')
    await speak(errorMsg)
  } finally {
    processing.value = false
    store.agentState = 'idle'
  }
}

async function handleDrinkRequest() {
  // 检查登录状态
  if (!store.isLoggedIn) {
    const msg = '先登录乡建DAO才能一起喝酒哦，点击左上角登录吧～'
    store.addBubble(msg, 'agent')
    await speak(msg)
    processing.value = false
    store.agentState = 'idle'
    return
  }

  // 检查稻米余额
  if (store.riceScore < 2) {
    const msg = `稻米不足啦！当前余额：${store.riceScore} 🌾，至少需要2🌾才能喝一杯。快去赚点稻米吧！`
    store.addBubble(msg, 'agent')
    await speak(msg)
    processing.value = false
    store.agentState = 'idle'
    return
  }

  // 扣费
  try {
    const token = store.token
    const res = await DaoAPI.rewardScore(token, 2)

    if (res.success) {
      store.deductRice(2)
      store.recordDrink()

      // 播放饮酒动画
      store.agentState = 'drinking'
      await delay(2000)

      // 随机选酒
      const wine = getRandomWine()
      const intro = generateWineIntro(wine)

      store.agentState = 'speaking'
      store.addBubble(intro, 'agent')
      addMessage('assistant', intro)
      await speak(intro)
    } else {
      const msg = '扣费失败了，可能是网络问题，稍后再试吧。'
      store.addBubble(msg, 'agent')
      await speak(msg)
    }
  } catch (e) {
    console.error('扣费失败:', e)
    const msg = '扣费出错了，再试一次？'
    store.addBubble(msg, 'agent')
    await speak(msg)
  } finally {
    processing.value = false
    store.agentState = 'idle'
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped lang="scss">
.mic-layer {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.mode-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.text-input-area {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 24px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.text-input-area input {
  width: 200px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.text-input-area input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.send-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #FF6B6B, #EE5A6F);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mic-btn {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #EE5A6F);
  color: #fff;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 4px 24px rgba(238, 90, 111, 0.4);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.mic-btn:active {
  transform: scale(0.92);
  box-shadow: 0 2px 12px rgba(238, 90, 111, 0.3);
}

.mic-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mic-icon {
  font-size: 28px;
}

.mic-text {
  font-size: 13px;
  font-weight: 500;
}

.processing-indicator {
  font-size: 11px;
  opacity: 0.8;
}

@media (min-width: 768px) {
  .mic-layer {
    bottom: 40px;
  }
}
</style>
