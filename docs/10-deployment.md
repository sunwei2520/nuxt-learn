# 10 构建与部署

## 构建模式

### 服务端渲染 (SSR)

默认模式，每次请求在服务端渲染 HTML：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true  // 默认
})
```

```bash
npm run build
node .output/server/index.mjs
```

### 静态站点生成 (SSG)

构建时生成静态 HTML：

```typescript
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/', '/about', '/posts/1']
    }
  }
})
```

```bash
npm run generate
# 输出到 .output/public/
```

### 客户端渲染 (CSR)

禁用 SSR，纯客户端渲染：

```typescript
export default defineNuxtConfig({
  ssr: false
})
```

### 增量静态再生 (ISR)

```typescript
export default defineNuxtConfig({
  routeRules: {
    '/blog/**': { isr: 3600 },  // 1小时缓存
    '/api/**': { cors: true }
  }
})
```

## 环境变量

```bash
# .env
NUXT_API_SECRET=server-secret
NUXT_PUBLIC_API_BASE=https://api.example.com
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',  // 仅服务端
    public: {
      apiBase: ''   // 客户端也可访问
    }
  }
})
```

```vue
<script setup>
const config = useRuntimeConfig()
// config.apiSecret 仅在服务端可用
// config.public.apiBase 客户端也可用
</script>
```

## 部署

### Node.js 服务器

```bash
npm run build
node .output/server/index.mjs
```

### 静态托管

```bash
npm run generate
# 部署 .output/public/ 到任何静态托管服务
```

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run generate
# 部署 dist/ 目录
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## 性能优化

### 图片优化

```bash
npm install @nuxt/image
```

```vue
<template>
  <NuxtImg
    src="/images/hero.jpg"
    width="800"
    height="400"
    format="webp"
    loading="lazy"
  />
</template>
```

### 代码分割

```vue
<script setup>
// 组件懒加载
const LazyModal = defineAsyncComponent(() => import('~/components/Modal.vue'))
</script>
```

### 预加载关键资源

```typescript
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preload', href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }
      ]
    }
  }
})
```

## 实践练习

1. 配置 `npm run generate` 生成静态站点
2. 创建 `.env` 文件，配置环境变量
3. 在页面中使用 `useRuntimeConfig()` 读取配置
4. 构建项目并本地运行 `.output/server/index.mjs`
