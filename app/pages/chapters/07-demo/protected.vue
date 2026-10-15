<script setup>
// 受保护页面：需要登录才能访问
// 中间件 'auth' 会检查 meta.requiresAuth
definePageMeta({
  middleware: 'auth',         // 页面声明 → 该页面路由时执行 auth 中间件
  requiresAuth: true          // 自定义 meta，auth 中间件里读取这个值来判断要不要拦
})

const auth = useAuthStore()

// SSR 里 auth.token 读的是请求 cookie，CSR 里读的是浏览器 cookie
// 如果 cookie 有值 → SSR 时 user 就已经被设置好了 → hydration 零 mismatch
</script>

<template>
  <div class="protected-page">
    <div class="protected-banner">🔒 这是一个受保护页面</div>

    <h2>欢迎，{{ auth.displayName }}</h2>
    <p class="token-display">
      当前 token：<code>{{ auth.token }}</code>
    </p>
    <p class="meta-explain">
      <strong>definePageMeta</strong> 里同时声明了 <code>middleware: 'auth'</code> 和
      <code>requiresAuth: true</code>，中间件 <code>auth.ts</code> 读取后者来决定是否拦截。
    </p>

    <div class="demo-controls">
      <AppButton type="danger" size="small" @click="auth.logout()">登出</AppButton>
      <NuxtLink to="/chapters/07-demo/login" class="back-link">去登录页 →</NuxtLink>
      <NuxtLink to="/chapters/07" class="back-link">← 返回第七章</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.protected-page {
  padding: 24px;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border: 1px solid #c7f0d9;
  border-radius: 10px;
  text-align: center;
}

.protected-banner {
  background: #00dc82;
  color: #fff;
  display: inline-block;
  padding: 4px 14px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}

h2 {
  margin: 0 0 12px;
  color: #1e293b;
}

.token-display {
  font-family: monospace;
  font-size: 0.82rem;
  background: #fff;
  border-radius: 6px;
  padding: 10px 14px;
  color: #334155;
  margin: 0 0 12px;
  word-break: break-all;
}

.token-display code {
  color: #00dc82;
}

.meta-explain {
  font-size: 0.84rem;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 16px;
}

.meta-explain code {
  background: #fff;
  color: #be123c;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}

.demo-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.back-link {
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
}
</style>
