export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 引入全局样式
  css: [
    '~/assets/css/main.css',       // 基础样式
    '~/assets/css/css-vars.css'    // CSS 变量（设计 token，配合第 08 章 demo）
  ],
  
  // 模块
  modules: ['@pinia/nuxt', '@nuxt/image'],

  // 路由规则：混合渲染（第 10 章 demo）
  // 该页在 nuxt build 时预渲染为纯静态 HTML —— SSG 样本
  routeRules: {
    '/chapters/10-demo/prerender-check': { prerender: true }
  },
  
  // 应用配置
  app: {
    head: {
      titleTemplate: '%s - Nuxt 学习项目',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt 4 学习项目' }
      ]
    }
  },

  // 运行时配置：public 字段客户端可读
  runtimeConfig: {
    apiSecret: 'server-only-demo-secret',
    public: {
      appName: 'Nuxt Learn',
      apiBase: '/api'
    }
  }
})
