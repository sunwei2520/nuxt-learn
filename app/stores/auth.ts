// SSR 也执行：useState 初始值为空，服务端没有 cookie → isLoggedIn = false → 放行
// 客户端 hydration 后：cookie 被读入 → 状态同步
// 关键点：store 的初始值必须是「没有 token 时的状态」，让服务端和客户端 hydration 时一致
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // ---------- state ----------
  // useCookie：SSR 时服务端直接读请求的 cookie，CSR 时浏览器读
  // 两边行为一致，所以 pinia store 的 state 不会出现 SSR/CSR 不一致
  const token = useCookie('demo_auth_token')
  const user = ref(null)

  // ---------- getters ----------
  const isLoggedIn = computed(() => !!token.value)
  const displayName = computed(() => user.value?.name || token.value?.slice(0, 10) + '...')

  // ---------- actions ----------
  async function login(name) {
    // 真实项目应该调后端 API 换 token，这里直接模拟
    token.value = 'mock-jwt-' + Math.random().toString(36).slice(2, 10)
    user.value = { name: name || '访客' }
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isLoggedIn, displayName, login, logout }
})
