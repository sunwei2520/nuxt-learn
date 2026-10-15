# 04 数据获取

Nuxt 提供了多种数据获取方式，支持服务端渲染（SSR）和静态生成（SSG）。

## useFetch（推荐）

`useFetch` 是最常用的数据获取组合式函数，自动处理缓存、重复请求和序列化。

```vue
<script setup>
// 基础用法
const { data, pending, error, refresh } = await useFetch('/api/posts')

// 带参数
const { data: post } = await useFetch(`/api/posts/${id}`)

// POST 请求
const { data } = await useFetch('/api/posts', {
  method: 'POST',
  body: { title: '新文章' }
})

// 拦截器
const { data } = await useFetch('/api/posts', {
  onRequest({ request, options }) {
    // 请求前设置 header
    options.headers.set('Authorization', 'Bearer token')
  },
  onResponse({ response }) {
    // 响应后处理
    return response._data
  }
})
</script>
```

### 响应式刷新

```vue
<script setup>
const page = ref(1)

// 参数变化时自动重新请求
const { data } = await useFetch(() => `/api/posts?page=${page.value}`)

// 手动刷新
function refreshData() {
  refresh()
}
</script>

<template>
  <button @click="page++">下一页</button>
  <div v-if="pending">加载中...</div>
  <div v-else>{{ data }}</div>
</template>
```

## useAsyncData

`useAsyncData` 更底层，适合非 HTTP 的异步操作：

```vue
<script setup>
// 从数据库获取数据
const { data, pending, error } = await useAsyncData('posts', async () => {
  const posts = await db.posts.findMany()
  return posts
})

// 依赖其他数据
const { data: user } = await useAsyncData('user', () => $fetch('/api/user'))
const { data: posts } = await useAsyncData('user-posts', () => {
  return $fetch(`/api/users/${user.value.id}/posts`)
}, {
  watch: [user]  // user 变化时重新执行
})
</script>
```

### 缓存控制

```vue
<script setup>
// 相同 key 的请求共享缓存
const { data } = await useAsyncData('posts', () => $fetch('/api/posts'), {
  // 缓存时间（毫秒）
  getCachedData(key) {
    return useNuxtData(key).data.value
  },
  // 服务端渲染时是否获取数据
  server: true,
  // 客户端是否立即获取
  immediate: true,
  // 深度监听
  deep: false,
  // 转换数据
  transform: (data) => data.map(item => ({ ...item, processed: true })),
  // 默认值
  default: () => []
})
</script>
```

## $fetch

`$fetch` 是原生 fetch 的封装，用于命令式请求：

```vue
<script setup>
// 在事件处理中使用
async function submitForm() {
  try {
    const result = await $fetch('/api/posts', {
      method: 'POST',
      body: formData
    })
    console.log('成功', result)
  } catch (err) {
    console.error('失败', err)
  }
}

// 获取二进制数据
async function download() {
  const blob = await $fetch('/api/file', { responseType: 'blob' })
  // 处理下载...
}
</script>
```

## 服务端数据获取

在 `server/api/` 目录下创建 API 端点：

```typescript
// server/api/posts.get.ts
export default defineEventHandler(async (event) => {
  // 查询参数
  const query = getQuery(event)
  
  // 返回数据（自动序列化为 JSON）
  return {
    posts: [
      { id: 1, title: '第一篇文章' },
      { id: 2, title: '第二篇文章' }
    ],
    total: 2
  }
})
```

## 渲染策略

| 策略 | 配置 | 适用场景 |
|------|------|----------|
| SSR | 默认 | 需要 SEO、实时数据 |
| SSG | `ssr: false` + `nitro: { prerender: { routes: ['/'] } }` | 静态内容 |
| CSR | `ssr: false` | 纯客户端应用 |
| ISR | `routeRules: { '/blog/**': { isr: 3600 } }` | 增量静态再生 |

## 实践练习

1. 创建 `server/api/posts.get.ts` 返回文章列表
2. 在页面中使用 `useFetch` 获取并展示文章
3. 添加加载状态和错误处理
4. 实现分页功能，页码变化时自动重新获取数据
