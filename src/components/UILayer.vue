<template>
  <div class="ui-layer">
    <!-- 左上角登录/用户信息 -->
    <div class="ui-top-left">
      <button v-if="!store.isLoggedIn" class="login-btn" @click="store.showLoginModal = true">
        登录
      </button>
      <div v-else class="user-info" @click="toggleMenu">
        <span class="domain">{{ store.userInfo?.domainName }}</span>
        <span class="score">🌾 {{ store.riceScore }}</span>
      </div>

      <!-- 用户菜单 -->
      <div v-if="store.showMenu && store.isLoggedIn" class="user-menu">
        <button class="menu-item" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <!-- 右上角年龄确认提示 -->
    <div v-if="showAgeCheck" class="age-check-modal" @click.self="showAgeCheck = false">
      <div class="age-check-content">
        <h3>年龄确认</h3>
        <p>本应用涉及饮酒内容，请确认您已年满 18 周岁。</p>
        <div class="age-check-buttons">
          <button class="age-confirm" @click="confirmAge">已满 18 岁</button>
          <button class="age-deny" @click="denyAge">未满 18 岁</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const store = useAppStore()
const showAgeCheck = ref(false)

onMounted(() => {
  // 首次访问检查年龄
  const ageConfirmed = localStorage.getItem('age_confirmed')
  if (!ageConfirmed) {
    showAgeCheck.value = true
  }
})

function toggleMenu() {
  store.showMenu = !store.showMenu
}

function handleLogout() {
  store.logout()
  store.showMenu = false
}

function confirmAge() {
  localStorage.setItem('age_confirmed', 'true')
  showAgeCheck.value = false
}

function denyAge() {
  alert('抱歉，未满18周岁无法使用本应用。')
  // 可以重定向或关闭
  showAgeCheck.value = false
}
</script>

<style scoped lang="scss">
.ui-layer {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
}

.ui-layer > * {
  pointer-events: auto;
}

.ui-top-left {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 41;
}

.login-btn {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  font-size: 12px;
}

.domain {
  color: rgba(255, 255, 255, 0.9);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  color: #FFE66D;
  font-weight: bold;
}

.user-menu {
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 年龄确认弹窗 */
.age-check-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  pointer-events: auto;
}

.age-check-content {
  width: 85%;
  max-width: 340px;
  padding: 24px;
  background: #2a2a3e;
  border-radius: 16px;
  text-align: center;
  color: #fff;
}

.age-check-content h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.age-check-content p {
  margin: 0 0 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.age-check-buttons {
  display: flex;
  gap: 12px;
}

.age-check-buttons button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.age-confirm {
  background: linear-gradient(135deg, #FF6B6B, #EE5A6F);
  color: #fff;
}

.age-deny {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.age-check-buttons button:hover {
  opacity: 0.9;
}
</style>
