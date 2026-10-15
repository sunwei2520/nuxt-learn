<script setup>
// 第 10 章 Demo B：SSG 样本页
// nuxt.config 里 routeRules 把本页设为 prerender: true
// dev 模式：每请求 SSR，import.meta.prerender = false，renderedAt 每次都变
// build 后：本页在构建时渲染成静态 HTML，import.meta.prerender = true，renderedAt 凝固
const prerendered = import.meta.prerender
// useState：服务端渲染时生成一次并写入 payload；SSG 时 payload 直接固化在产物里
const renderedAt = useState('prerender-check-time', () => new Date().toString())
</script>

<template>
  <div class="prerender-check">
    <NuxtLink to="/chapters/10" class="back">← 返回第 10 章</NuxtLink>
    <h1>SSG 样本页：我是什么时候渲染的？</h1>
    <div class="facts">
      <p><strong>import.meta.prerender：</strong><code>{{ prerendered }}</code></p>
      <p><strong>渲染时刻：</strong><code>{{ renderedAt }}</code></p>
      <p v-if="prerendered" class="tip">
        本页在 nuxt build 时已预渲染为静态 HTML——上面的时间凝固在构建那一刻，
        无论谁在什么时候访问，看到的都是同一份 HTML。这就是 SSG。
      </p>
      <p v-else class="tip">
        当前是 SSR / dev 模式：每次请求都重新渲染，时间是刚才那一刻。
        运行 npm run build 后再访问本页，时间将凝固在构建时刻。
      </p>
    </div>
  </div>
</template>

<style scoped>
.prerender-check {
  max-width: 640px;
  margin: 0 auto;
}

.back {
  color: #00dc82;
  text-decoration: none;
  font-size: 0.9rem;
}

h1 {
  font-size: 1.6rem;
  color: #1e293b;
  margin: 16px 0 20px;
}

.facts {
  padding: 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.facts p {
  margin: 0 0 12px;
  color: #334155;
  font-size: 0.95rem;
}

.facts code {
  background: #0f172a;
  color: #00dc82;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.85em;
}

.tip {
  margin-top: 16px;
  padding: 12px 16px;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  color: #334155;
  font-size: 0.88rem;
  line-height: 1.7;
}
</style>
