<script setup>
// 演示页面：关于
useHead({
  title: '关于'
})
</script>

<template>
  <div>
    <h1>关于 Nuxt</h1>
    <p>Nuxt 是一个基于 Vue 的全栈框架，让构建现代 Web 应用变得简单。</p>
    
    <h2>核心特性</h2>
    <ul>
      <li>文件路由：无需手动配置路由</li>
      <li>自动导入：组件、组合式函数自动导入</li>
      <li>服务端渲染：内置 SSR/SSG 支持</li>
      <li>全栈能力：前后端同构开发</li>
    </ul>
    
    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>
