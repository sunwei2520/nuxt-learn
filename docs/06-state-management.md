# 06 状态管理

Nuxt 官方推荐使用 Pinia 进行状态管理。

## 安装与配置

```bash
npm install @pinia/nuxt pinia
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt']
})
```

## 创建 Store

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    name: '计数器'
  }),
  
  // 计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    // 依赖其他 getter
    doubleCountPlusOne(): number {
      return this.doubleCount + 1
    }
  },
  
  // 方法
  actions: {
    increment() {
      this.count++
    },
    async fetchCount() {
      const data = await $fetch('/api/count')
      this.count = data.count
    }
  }
})
```

## 使用 Store

```vue
<script setup>
// 在组件中使用
const counter = useCounterStore()

// 解构会丢失响应性，使用 storeToRefs
import { storeToRefs } from 'pinia'
const { count, doubleCount } = storeToRefs(counter)

// 方法可以直接解构
const { increment } = counter
</script>

<template>
  <div>
    <p>当前计数: {{ count }}</p>
    <p>双倍: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

## 组合式 API 风格

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // state
  const user = ref(null)
  const token = ref('')
  
  // getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? '访客')
  
  // actions
  async function login(credentials) {
    const data = await $fetch('/api/login', {
      method: 'POST',
      body: credentials
    })
    token.value = data.token
    user.value = data.user
  }
  
  function logout() {
    token.value = ''
    user.value = null
  }
  
  return {
    user,
    token,
    isLoggedIn,
    userName,
    login,
    logout
  }
})
```

## 服务端渲染与状态持久化

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = useCookie('token')  // 使用 cookie 持久化
  const user = ref(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  async function fetchUser() {
    if (!token.value) return
    user.value = await $fetch('/api/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }
  
  return { token, user, isAuthenticated, fetchUser }
})
```

## 插件扩展

```typescript
// plugins/pinia-plugin.ts
export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(({ store }) => {
    // 为所有 store 添加 $reset 方法
    store.$reset = () => {
      store.$state = JSON.parse(JSON.stringify(store.$initialState))
    }
  })
})
```

## 实践练习

1. 安装并配置 Pinia
2. 创建 `stores/counter.ts`，实现计数器功能
3. 创建 `stores/posts.ts`，管理文章列表状态
4. 在页面中使用 store，实现跨组件数据共享
