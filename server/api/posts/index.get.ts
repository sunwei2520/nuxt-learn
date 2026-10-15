// 模拟文章数据
const posts = [
  {
    id: 1,
    title: 'Nuxt 4 入门指南',
    excerpt: '学习 Nuxt 4 的核心概念和最佳实践',
    content: 'Nuxt 4 带来了许多新特性，包括全新的目录结构、改进的性能和更好的开发体验...',
    date: '2025-01-15'
  },
  {
    id: 2,
    title: '掌握 Vue 3 组合式 API',
    excerpt: '深入理解 Composition API 的设计思想',
    content: '组合式 API 是 Vue 3 的核心特性，它让我们能够以更灵活的方式组织组件逻辑...',
    date: '2025-01-10'
  },
  {
    id: 3,
    title: '服务端渲染原理解析',
    excerpt: '了解 SSR 的工作原理和优化策略',
    content: '服务端渲染可以显著提升首屏加载速度和 SEO 表现...',
    date: '2025-01-05'
  }
]

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  
  const start = (page - 1) * limit
  const end = start + limit
  
  return {
    posts: posts.slice(start, end),
    total: posts.length,
    page,
    limit
  }
})
