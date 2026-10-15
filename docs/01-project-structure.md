# 01 项目结构与配置

## 目录结构详解

```
nuxt-learn/
├── app/                    # 应用源码目录（Nuxt 4 新特性）
│   ├── pages/              # 页面组件 —— 基于文件自动生成路由
│   ├── layouts/            # 布局组件 —— 页面外壳
│   ├── components/         # 可复用组件 —— 自动全局注册
│   ├── composables/        # 组合式函数 —— 自动导入
│   ├── middleware/         # 路由中间件
│   ├── assets/             # 需要构建的静态资源（CSS、图片等）
│   ├── public/             # 不需要构建的静态文件（直接复制到输出目录）
│   └── app.vue             # 根组件
├── server/                 # 服务端代码
│   └── api/                # API 端点 —— 基于文件自动生成路由
├── stores/                 # Pinia 状态管理
├── docs/                   # 学习文档（本项目特有）
├── nuxt.config.ts          # Nuxt 配置文件
├── package.json
└── tsconfig.json
```

## 核心概念：约定大于配置

Nuxt 不需要手动配置路由、不需要手动注册组件、不需要手动导入 API。这一切通过**目录约定**实现：

| 目录 | 自动完成的事情 |
|------|---------------|
| `app/pages/` | 生成 Vue Router 路由配置 |
| `app/components/` | 全局注册组件，可直接在模板中使用 |
| `app/composables/` | 自动导出函数，可在任何组件中直接使用 |
| `server/api/` | 生成服务端 API 路由 |

## nuxt.config.ts 详解

```typescript
export default defineNuxtConfig({
  // 兼容日期：确保使用特定日期前的行为
  compatibilityDate: '2025-07-15',
  
  // 开发工具：提供可视化调试面板
  devtools: { enabled: true },
  
  // 模块：扩展 Nuxt 功能
  modules: [],
  
  // 运行时配置：可区分服务端/客户端
  runtimeConfig: {
    apiSecret: '',           // 仅服务端可访问
    public: {
      apiBase: ''            // 客户端也可访问
    }
  },
  
  // 应用配置
  app: {
    head: {
      title: 'Nuxt 学习项目',
      meta: [
        { name: 'description', content: '学习 Nuxt 4 的最佳实践' }
      ]
    }
  }
})
```

## 与 Vue CLI/Vite 项目的对比

| 特性 | Vue CLI/Vite | Nuxt |
|------|-------------|------|
| 路由配置 | 手动创建 `router/index.js` | 文件自动生成 |
| 组件注册 | 手动 `import` + `components` | 自动全局注册 |
| API 导入 | 手动 `import { ref } from 'vue'` | 自动导入 |
| 服务端渲染 | 需要额外配置 | 内置支持 |
| 构建配置 | `vue.config.js` 或 `vite.config.ts` | `nuxt.config.ts` |

## 实践练习

1. 打开 `nuxt.config.ts`，添加一个自定义配置项
2. 在 `app/public/` 下放一个图片，然后在页面中通过 `/图片名` 访问
3. 观察 `.nuxt/` 目录（`npm run dev` 后生成），这是 Nuxt 自动生成的类型声明和路由配置
