# 02 页面与路由

## 文件路由系统

Nuxt 的路由完全由 `app/pages/` 目录结构决定，无需手动配置。

### 基础映射规则

```
app/pages/index.vue      →  /
app/pages/about.vue      →  /about
app/pages/posts/index.vue →  /posts
app/pages/posts/[id].vue →  /posts/:id  (动态路由)
```

### 嵌套路由

```
app/pages/parent.vue           →  /parent
app/pages/parent/child.vue     →  /parent/child (嵌套在 parent 布局中)
```

父页面使用 `<NuxtPage />` 渲染子路由：

```vue
<!-- app/pages/parent.vue -->
<template>
  <div>
    <h1>父页面</h1>
    <NuxtPage />  <!-- 子路由内容渲染在这里 -->
  </div>
</template>
```

## 动态路由参数

使用 `[param]` 语法创建动态路由：

```vue
<!-- app/pages/posts/[id].vue -->
<script setup>
// route.params 获取路由参数
const route = useRoute()
const postId = route.params.id
</script>

<template>
  <article>
    <h1>文章 {{ postId }}</h1>
  </article>
</template>
```

### 多级动态路由

```
app/pages/[category]/[id].vue →  /:category/:id
```

## 路由导航

### 声明式导航 `<NuxtLink>`

```vue
<template>
  <!-- 基础导航 -->
  <NuxtLink to="/about">关于</NuxtLink>
  
  <!-- 动态路由 -->
  <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>
  
  <!-- 带查询参数 -->
  <NuxtLink :to="{ path: '/search', query: { q: 'nuxt' } }">搜索</NuxtLink>
  
  <!-- 外部链接 -->
  <NuxtLink to="https://nuxt.com" external target="_blank">Nuxt 官网</NuxtLink>
</template>
```

### 编程式导航

```vue
<script setup>
const router = useRouter()

function goToPost(id) {
  // 方式1：路径字符串
  router.push(`/posts/${id}`)
  
  // 方式2：对象形式
  router.push({ path: '/posts', query: { page: 1 } })
  
  // 方式3：命名路由（如果定义了 name）
  router.push({ name: 'posts-id', params: { id: 1 } })
}

// 替换历史记录（不会留下浏览记录）
function replace() {
  router.replace('/about')
}

// 前进/后退
function goBack() {
  router.back()
}
</script>
```

## 路由元信息

```vue
<script setup>
// 为当前路由添加元信息
definePageMeta({
  title: '关于我们',
  layout: 'custom',        // 指定布局
  middleware: ['auth'],    // 应用中间件
  auth: {                  // 自定义元信息
    requiresAuth: true
  }
})
</script>
```

## 路由验证

```vue
<script setup>
definePageMeta({
  validate: async (route) => {
    // 验证 id 是否为数字
    return /^\d+$/.test(route.params.id)
  }
})
</script>
```

验证失败会显示 404 页面。

## 实践练习

1. 创建 `app/pages/about.vue`，添加一个返回首页的链接
2. 创建 `app/pages/posts/[id].vue`，显示传入的 id 参数
3. 创建 `app/pages/posts/index.vue`，列出所有文章并链接到详情页
4. 尝试访问 `/posts/abc`，观察路由验证的效果
