<template>
  <div v-if="store.showLoginModal" class="login-modal-overlay" @click.self="closeModal">
    <div class="login-modal">
      <button class="close-btn" @click="closeModal">×</button>
      <h2 class="modal-title">登录乡建 DAO</h2>

      <div class="form-group">
        <label>手机号或邮箱</label>
        <input
          v-model="form.phoneOrEmail"
          type="text"
          placeholder="手机号或邮箱"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="form-group">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="密码"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="form-group">
        <label>域名</label>
        <input
          v-model="form.domainName"
          type="text"
          placeholder="如 david.web5.xjdao.net"
          @keyup.enter="handleLogin"
        />
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button
        class="login-submit-btn"
        :disabled="loading"
        @click="handleLogin"
      >
        <span v-if="loading" class="spinner"></span>
        <span v-else>登录</span>
      </button>

      <!-- Demo 账户快捷登录 -->
      <div class="demo-section">
        <p class="demo-hint">或试用 Demo 账户</p>
        <div class="demo-buttons">
          <button class="demo-btn" @click="demoLogin('demo')">Demo 账户</button>
          <button class="demo-btn" @click="demoLogin('test')">Test 账户</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAppStore } from '@/stores'
import { DaoAPI } from '@/services/daoApi'

const store = useAppStore()
const loading = ref(false)
const error = ref('')

const form = reactive({
  phoneOrEmail: '',
  password: '',
  domainName: ''
})

function closeModal() {
  store.showLoginModal = false
  error.value = ''
}

async function handleLogin() {
  if (!form.phoneOrEmail || !form.password || !form.domainName) {
    error.value = '请填写所有字段'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const isPhone = /^1\d{10}$/.test(form.phoneOrEmail)
    const params = {
      phone: isPhone ? form.phoneOrEmail : '',
      email: isPhone ? '' : form.phoneOrEmail,
      password: form.password,
      domainName: form.domainName
    }

    const res = await DaoAPI.login(params)

    if (res.success && res.data?.token) {
      store.setToken(res.data.token)
      // 获取用户信息
      const detailRes = await DaoAPI.getUserDetail(res.data.token)
      if (detailRes.success && detailRes.data) {
        store.setUserInfo(detailRes.data)
        store.background = '1'
        store.showLoginModal = false
        store.addBubble(`欢迎回来，${detailRes.data.domainName}！今日🌾余额：${detailRes.data.score}`, 'agent')
      }
    } else {
      error.value = res.message || '登录失败'
    }
  } catch (e: any) {
    error.value = e.message || '网络错误，请重试'
    console.error('登录失败:', e)
  } finally {
    loading.value = false
  }
}

async function demoLogin(type: 'demo' | 'test') {
  loading.value = true
  error.value = ''

  const demoAccounts = {
    demo: { phone: '13800138000', password: 'demo1234', domainName: 'demo.web5.xjdao.net' },
    test: { phone: '13900139000', password: 'test5678', domainName: 'test.web5.xjdao.net' }
  }

  const account = demoAccounts[type]
  form.phoneOrEmail = account.phone
  form.password = account.password
  form.domainName = account.domainName

  await handleLogin()
}
</script>

<style scoped lang="scss">
.login-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  backdrop-filter: blur(4px);
}

.login-modal {
  width: 85%;
  max-width: 360px;
  padding: 24px;
  background: #2a2a3e;
  border-radius: 16px;
  position: relative;
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-title {
  margin: 0 0 20px;
  font-size: 18px;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: rgba(255, 107, 107, 0.6);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.error-msg {
  margin: 0 0 12px;
  color: #FF6B6B;
  font-size: 13px;
  text-align: center;
}

.login-submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #FF6B6B, #EE5A6F);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-section {
  margin-top: 16px;
  text-align: center;
}

.demo-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.demo-buttons {
  display: flex;
  gap: 10px;
}

.demo-btn {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
