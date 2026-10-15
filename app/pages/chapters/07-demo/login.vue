<script setup>
// 登录页：不受保护（requiresAuth 为 false 或不存在）
// 但如果已经登录，跳到受保护页面或来源页

definePageMeta({ layout: 'custom' })

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const name = ref('')
const loggingIn = ref(false)

const redirectTo = computed(() => route.query.redirect || '/chapters/07-demo/protected')

// 已登录直接跳过去
if (auth.isLoggedIn) {
  await navigateTo(redirectTo.value)
}

async function handleLogin() {
  if (!name.value.trim()) return
  loggingIn.value = true
  try {
    await auth.login(name.value.trim())
    // 登录成功后跳到来源页（或默认受保护页）
    await navigateTo(redirectTo.value)
  } finally {
    loggingIn.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2>登录 Demo</h2>
      <p class="subtitle">这是一个纯前端登录模拟（没有真实后端）</p>

      <label class="login-label">
        用户名
        <input v-model="name" type="text" class="login-input" placeholder="随便填一个" @keyup.enter="handleLogin" />
      </label>

      <div class="login-actions">
        <AppButton type="primary" size="medium" :disabled="loggingIn || !name.trim()" @click="handleLogin">
          {{ loggingIn ? '登录中…' : '登录' }}
        </AppButton>
        <NuxtLink to="/chapters/07" class="back-link">← 返回第七章</NuxtLink>
      </div>

      <div class="login-tip">
        已设置的跳转目标：<code>{{ redirectTo }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 32px;
  width: 100%;
  max-width: 360px;
}

h2 { margin: 0 0 6px; color: #1e293b; }

.subtitle {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 20px;
}

.login-label {
  display: block;
  font-size: 0.82rem;
  color: #475569;
  margin-bottom: 6px;
}

.login-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  margin-bottom: 16px;
}

.login-input:focus {
  border-color: #00dc82;
}

.login-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.back-link {
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
}

.login-tip {
  margin-top: 16px;
  font-size: 0.78rem;
  color: #94a3b8;
}

.login-tip code {
  background: #f1f5f9;
  color: #334155;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: monospace;
}
</style>
