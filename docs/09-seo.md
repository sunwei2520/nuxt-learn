# 09 SEO 与元信息

## useHead

```vue
<script setup>
useHead({
  title: '页面标题',
  meta: [
    { name: 'description', content: '页面描述' },
    { name: 'keywords', content: 'nuxt, vue, seo' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  script: [
    { src: 'https://example.com/script.js', async: true }
  ],
  style: [
    { children: 'body { background: #fff; }' }
  ],
  htmlAttrs: {
    lang: 'zh-CN'
  },
  bodyAttrs: {
    class: 'dark-mode'
  }
})
</script>
```

### 动态标题

```vue
<script setup>
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.id}`)

useHead({
  title: () => post.value?.title ?? '加载中...'
})
</script>
```

## useSeoMeta

专为 SEO 设计的组合式函数：

```vue
<script setup>
useSeoMeta({
  title: '页面标题',
  description: '页面描述，用于搜索引擎结果展示',
  keywords: 'nuxt, vue, seo',
  
  // Open Graph
  ogTitle: 'Open Graph 标题',
  ogDescription: 'Open Graph 描述',
  ogImage: 'https://example.com/image.jpg',
  ogUrl: 'https://example.com/page',
  ogType: 'website',
  
  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: 'Twitter 标题',
  twitterDescription: 'Twitter 描述',
  twitterImage: 'https://example.com/image.jpg',
  
  // 其他
  robots: 'index, follow',
  author: '作者名'
})
</script>
```

## 全局 SEO 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: '%s - Nuxt 学习项目',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '默认描述' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
```

## 动态路由的 SEO

```vue
<!-- app/pages/posts/[id].vue -->
<script setup>
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.id}`)

// 服务端渲染时设置 SEO 信息
useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.excerpt,
  ogImage: () => post.value?.coverImage
})
</script>
```

## Sitemap

```bash
npm install @nuxtjs/sitemap
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: 'https://example.com'
  }
})
```

## 实践练习

1. 为首页添加完整的 SEO 元信息
2. 为文章详情页添加动态 SEO（标题、描述、OG 图片）
3. 配置全局 titleTemplate
4. 检查页面源代码，确认 SEO 标签正确渲染
