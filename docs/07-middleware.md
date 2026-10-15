# 07 中间件

中间件在路由导航前执行，用于权限验证、日志记录等。

## 命名中间件

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // to: 目标路由
  // from: 来源路由
  
  const { status } = useAuth()
  
  if (status.value !== 'authenticated') {
    return navigateTo('/login')
  }
})
```

在页面中使用：

```vue
<script setup>
definePageMeta({
  middleware: ['auth']
})
</script>
```

## 全局中间件

```typescript
// app/middleware/global.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log(`导航: ${from.path} → ${to.path}`)
})
```

`.global.ts` 后缀表示全局生效，无需在页面中声明。

## 内联中间件

```vue
<script setup>
definePageMeta({
  middleware: [
    function (to, from) {
      // 直接内联定义
      if (to.params.id === '1') {
        return abortNavigation('不能访问 ID 为 1 的文章')
      }
    },
    'auth'  // 也可以混合使用命名中间件
  ]
})
</script>
```

## 中间件执行顺序

1. 全局中间件（按字母顺序）
2. 页面中定义的中间件（按数组顺序）
3. 布局中间件

## 常用工具函数

### navigateTo

```typescript
// 重定向
return navigateTo('/login')

// 外部链接
return navigateTo('https://example.com', { external: true })

// 带查询参数
return navigateTo({ path: '/search', query: { q: 'nuxt' } })
```

### abortNavigation

```typescript
// 阻止导航，显示错误页面
return abortNavigation()

// 自定义错误信息
return abortNavigation({
  statusCode: 403,
  message: '没有权限访问此页面'
})
```

## 服务端中间件

```typescript
// server/middleware/logger.ts
export default defineEventHandler((event) => {
  console.log(`[${event.method}] ${event.path}`)
})
```

## 权限控制示例

```typescript
// app/middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  
  if (user.value?.role !== 'admin') {
    return abortNavigation({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }
})
```

```vue
<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

## 实践练习

1. 创建 `app/middleware/auth.ts`，检查用户是否登录
2. 创建 `app/middleware/log.global.ts`，记录所有路由变化
3. 创建一个需要登录才能访问的页面，测试重定向功能
4. 创建一个 403 错误页面，测试 abortNavigation
