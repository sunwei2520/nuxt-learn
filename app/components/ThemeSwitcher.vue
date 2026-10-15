<script setup>
// ThemeSwitcher 演示：CSS 变量 + data-theme 切换
// 点击后给 <html> 设置 data-theme 属性，触发 css-vars.css 里的暗色变量
const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
}

// 初始化（确保页面加载时默认是 light）
onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'light')
})
</script>

<template>
  <div class="theme-switcher" :class="theme">
    <div class="switcher-card">
      <div class="switcher-preview">
        <span class="preview-dot" :class="theme" />
        <span class="preview-text">
          当前主题：<strong>{{ theme === 'light' ? '浅色 ☀️' : '深色 🌙' }}</strong>
        </span>
      </div>

      <button class="switcher-btn" :class="theme" @click="toggleTheme">
        {{ theme === 'light' ? '切换到深色' : '切换到浅色' }}
      </button>
    </div>

    <div class="vars-preview">
      <p class="vars-title">CSS 变量实时值（切主题后变）：</p>
      <div class="vars-grid">
        <div class="var-item">
          <span class="var-name">--text</span>
          <span class="var-value" style="color: var(--text)">文字颜色</span>
        </div>
        <div class="var-item">
          <span class="var-name">--bg</span>
          <span class="var-value" :style="{ background: 'var(--bg)', border: '1px solid var(--border)' }">背景色</span>
        </div>
        <div class="var-item">
          <span class="var-name">--primary</span>
          <span class="var-value" style="color: var(--primary)">主题色</span>
        </div>
        <div class="var-item">
          <span class="var-name">--border</span>
          <span class="var-value" :style="{ background: 'var(--border)', borderRadius: '2px', width: '24px', height: '12px', display: 'inline-block' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-switcher {
  padding: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
}

.theme-switcher.light {
  background: #fff;
}

.theme-switcher.dark {
  background: #1e293b;
}

.switcher-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.switcher-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
}

.preview-dot.light { background: #fbbf24; }
.preview-dot.dark { background: #3b82f6; }

.preview-text {
  color: var(--text);
  font-size: 0.9rem;
}

.preview-text strong {
  color: var(--primary);
}

.switcher-btn {
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--bg-card);
  color: var(--text);
  transition: all 0.2s;
}

.switcher-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.vars-preview {
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.vars-title {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.vars-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.var-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-family: monospace;
}

.var-name {
  color: var(--text-secondary);
  min-width: 80px;
}

.var-value {
  font-weight: 500;
}
</style>
