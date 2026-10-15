# 05 服务端 API

Nuxt 的 `server/api/` 目录允许你在同一个项目中编写服务端代码，基于 Nitro 引擎。

## 创建 API 端点

### 基础 GET 请求

```typescript
// server/api/hello.get.ts
export default defineEventHandler((event) => {
  return {
    message: 'Hello from Nuxt server!'
  }
})
```

访问：`GET /api/hello`

### 带参数的 GET 请求

```typescript
// server/api/posts/[id].get.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  
  return {
    id,
    title: `文章 ${id}`,
    content: '文章内容...'
  }
})
```

访问：`GET /api/posts/1`

### POST 请求（创建资源）

```typescript
// server/api/posts.post.ts
export default defineEventHandler(async (event) => {
  // 读取请求体
  const body = await readBody(event)
  
  // 验证数据
  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: '标题不能为空'
    })
  }
  
  // 保存到数据库...
  
  return {
    success: true,
    data: {
      id: Date.now(),
      ...body
    }
  }
})
```

### PUT/PATCH 请求（更新资源）

```typescript
// server/api/posts/[id].put.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  return {
    success: true,
    message: `文章 ${id} 已更新`,
    data: body
  }
})
```

### DELETE 请求

```typescript
// server/api/posts/[id].delete.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  
  return {
    success: true,
    message: `文章 ${id} 已删除`
  }
})
```

## 请求处理工具

### 获取查询参数

```typescript
export default defineEventHandler((event) => {
  const { page = 1, limit = 10, search } = getQuery(event)
  
  return {
    page: Number(page),
    limit: Number(limit),
    search
  }
})
```

### 获取请求头

```typescript
export default defineEventHandler((event) => {
  const headers = getRequestHeaders(event)
  const auth = headers['authorization']
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      statusMessage: '未授权'
    })
  }
  
  return { authenticated: true }
})
```

### 获取客户端 IP

```typescript
export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true })
  return { ip }
})
```

## 错误处理

```typescript
export default defineEventHandler(async (event) => {
  try {
    const data = await someAsyncOperation()
    return data
  } catch (error) {
    // 方式1：抛出 HTTP 错误
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误',
      data: { detail: error.message }
    })
  }
})
```

## 中间件

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  // 只保护 /api/admin 下的路由
  if (event.path.startsWith('/api/admin')) {
    const auth = getRequestHeader(event, 'authorization')
    if (!auth) {
      throw createError({ statusCode: 401, statusMessage: '未授权' })
    }
  }
})
```

## 文件上传

```typescript
// server/api/upload.post.ts
export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: '无文件' })
  }
  
  const file = form.find(f => f.name === 'file')
  
  return {
    filename: file.filename,
    size: file.data.length,
    type: file.type
  }
})
```

## 调用外部 API

```typescript
// server/api/external.get.ts
export default defineEventHandler(async (event) => {
  // 服务端可以安全地调用需要密钥的 API
  const data = await $fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${process.env.API_SECRET}`
    }
  })
  
  return data
})
```

## 实践练习

1. 创建 `server/api/posts/index.get.ts` 返回文章列表
2. 创建 `server/api/posts/[id].get.ts` 返回单篇文章
3. 创建 `server/api/posts.post.ts` 处理创建请求
4. 在前端页面中调用这些 API，实现完整的 CRUD 操作
