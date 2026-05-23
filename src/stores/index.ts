import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, BubbleMessage } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 登录状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const riceScore = computed(() => userInfo.value?.score ?? 0)

  // UI 状态
  const showLoginModal = ref(false)
  const showMenu = ref(false)
  const isRecording = ref(false)
  const agentState = ref<'idle' | 'drinking' | 'speaking' | 'listening'>('idle')
  const bubbles = ref<BubbleMessage[]>([])
  const background = ref<'0' | '1'>('0') // 0=开屏背景, 1=酒馆背景

  // 饮酒记录
  const drinkTimestamps = ref<number[]>([])

  // 方法
  function setToken(t: string) {
    token.value = t
    sessionStorage.setItem('dao_token', t)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    sessionStorage.removeItem('dao_token')
    background.value = '0'
  }

  function addBubble(text: string, sender: 'user' | 'agent') {
    const bubble: BubbleMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      text,
      sender,
      timestamp: Date.now(),
    }
    bubbles.value.push(bubble)
  }

  function clearBubbles() {
    bubbles.value = []
  }

  function recordDrink() {
    const now = Date.now()
    drinkTimestamps.value.push(now)
    // 只保留最近5分钟的记录
    drinkTimestamps.value = drinkTimestamps.value.filter(t => now - t < 5 * 60 * 1000)
  }

  function getRecentDrinkCount(): number {
    const now = Date.now()
    return drinkTimestamps.value.filter(t => now - t < 5 * 60 * 1000).length
  }

  function deductRice(amount: number): boolean {
    if (!userInfo.value) return false
    if (userInfo.value.score < amount) return false
    userInfo.value.score -= amount
    return true
  }

  function initFromStorage() {
    const storedToken = sessionStorage.getItem('dao_token')
    if (storedToken) {
      token.value = storedToken
    }
  }

  async function restoreLoginState() {
    const storedToken = sessionStorage.getItem('dao_token')
    if (!storedToken) return

    token.value = storedToken
    try {
      const detail = await import('@/services/daoApi').then(m => m.DaoAPI.getUserDetail(storedToken))
      if (detail.success && detail.data) {
        userInfo.value = detail.data
      } else {
        throw new Error('恢复登录失败')
      }
    } catch (e) {
      console.error('恢复登录状态失败:', e)
      token.value = ''
      userInfo.value = null
      sessionStorage.removeItem('dao_token')
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    riceScore,
    showLoginModal,
    showMenu,
    isRecording,
    agentState,
    bubbles,
    background,
    drinkTimestamps,
    setToken,
    setUserInfo,
    logout,
    addBubble,
    clearBubbles,
    recordDrink,
    getRecentDrinkCount,
    deductRice,
    initFromStorage,
    restoreLoginState
  }
})
