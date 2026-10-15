<script setup>
// ============================================================
// 全局错误页：Nuxt 在两类情况下会渲染它
//   1. 路由不存在 → 404
//   2. 页面 setup / 渲染阶段抛错 → 对应状态码
// 它是最后一道防线 —— 用户看到的不是白屏，而是一张能自救的页面
// ============================================================
const props = defineProps({
  // Nuxt 注入的 NuxtError 对象
  error: {
    type: Object,
    required: true
  }
})

const isNotFound = computed(() => props.error?.statusCode === 404)

// 结构化数据（createError 的 data 字段）会原样带到这里
const details = computed(() => props.error?.data ?? null)

// clearError()：清掉错误状态，让应用恢复到可渲染状态
// 带 redirect：清错后直接跳到首页（最常用）
function goHome() {
  clearError({ redirect: '/' })
}

// 不带参数：清掉错误，重新渲染当前路由（相当于「重试」）
function retry() {
  clearError()
}
</script>

<template>
  <div class="error-page">
    <div class="card">
      <div class="code">{{ error?.statusCode || 500 }}</div>

      <h1>{{ isNotFound ? '这个页面不存在' : '出了一点问题' }}</h1>

      <p class="message">
        {{ error?.statusMessage || '服务器遇到了未预期的情况' }}
      </p>

      <dl v-if="details" class="details">
        <template v-for="(value, key) in details" :key="key">
          <dt>{{ key }}</dt>
          <dd>{{ typeof value === 'string' ? value : JSON.stringify(value) }}</dd>
        </template>
      </dl>

      <div class="hint">
        <p><strong>给开发者的补充信息</strong>（生产环境会隐藏）：</p>
        <p class="dev-message">{{ error?.message }}</p>
      </div>

      <div class="actions">
        <AppButton type="primary" @click="goHome">返回首页</AppButton>
        <AppButton type="secondary" @click="retry">重试当前页</AppButton>
      </div>

      <p class="back-link">
        <NuxtLink to="/chapters/11">← 回到第 11 章（错误处理与测试）</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
}

.card {
  max-width: 520px;
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.code {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: #ef4444;
  margin-bottom: 12px;
}

h1 {
  font-size: 1.4rem;
  color: #1e293b;
  margin: 0 0 10px;
}

.message {
  color: #475569;
  line-height: 1.7;
  margin: 0 0 16px;
}

.details {
  margin: 16px 0;
  padding: 12px 16px;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.85rem;
}

.details dt {
  color: #92400e;
  font-weight: 600;
  font-family: monospace;
  margin-top: 6px;
}

.details dt:first-child {
  margin-top: 0;
}

.details dd {
  margin: 2px 0 0;
  color: #334155;
  word-break: break-all;
}

.hint {
  margin: 16px 0;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #64748b;
}

.hint p {
  margin: 0 0 6px;
}

.dev-message {
  font-family: monospace;
  color: #475569;
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 12px;
  margin: 20px 0 12px;
}

.back-link {
  margin: 0;
  font-size: 0.85rem;
}

.back-link a {
  color: #00dc82;
  text-decoration: none;
}
</style>
