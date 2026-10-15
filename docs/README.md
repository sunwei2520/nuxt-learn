# Nuxt 4 学习大纲

## 学习路径

```
01 项目结构与配置 → 02 页面与路由 → 03 布局与组件 → 04 数据获取
→ 05 服务端 API → 06 状态管理 → 07 中间件 → 08 样式与静态资源
→ 09 SEO 与元信息 → 10 构建与部署
```

## 章节概览

| 章节 | 主题 | 核心内容 | 示例文件 |
|------|------|----------|----------|
| 01 | 项目结构与配置 | Nuxt 目录约定、nuxt.config.ts、环境变量 | `nuxt.config.ts` |
| 02 | 页面与路由 | 文件路由、动态路由、嵌套路由、导航 | `app/pages/` |
| 03 | 布局与组件 | 布局系统、组件自动导入、Props/Emits | `app/layouts/` `app/components/` |
| 04 | 数据获取 | useFetch、useAsyncData、服务端渲染 | `app/pages/data-demo.vue` |
| 05 | 服务端 API | server/api 目录、RESTful 端点 | `server/api/` |
| 06 | 状态管理 | Pinia 集成、store 定义、跨组件共享 | `stores/` |
| 07 | 中间件 | 路由中间件、全局守卫、权限控制 | `app/middleware/` |
| 08 | 样式与静态资源 | CSS/SCSS、静态文件、图片优化 | `app/assets/` `app/public/` |
| 09 | SEO 与元信息 | useHead、useSeoMeta、Open Graph | 各页面 `<script setup>` |
| 10 | 构建与部署 | 构建模式、SSR/SSG、部署策略 | `nuxt.config.ts` |

## 快速开始

```bash
cd ~/Desktop/projects/nuxt-learn
npm run dev
```

访问 http://localhost:3000

## 学习建议

1. **按顺序学习**：01 → 02 → 03 是基础，必须掌握
2. **边学边练**：每章都有可运行的示例代码，修改后实时查看效果
3. **对比学习**：将 Nuxt 与 Vue CLI/Vite 项目对比，理解约定大于配置的思想
4. **查阅文档**：遇到问题先看 https://nuxt.com/docs
