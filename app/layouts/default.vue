<template>
  <div class="layout-default">
    <header class="header">
      <nav class="nav">
        <NuxtLink to="/" class="logo">NuxtLearn</NuxtLink>
        <div class="links">
          <NuxtLink to="/">首页</NuxtLink>
          <NuxtLink to="/posts">文章</NuxtLink>
          <NuxtLink to="/about">关于</NuxtLink>
        </div>
      </nav>
    </header>
    
    <main class="main">
      <slot />
    </main>
    
    <footer class="footer">
      <p>© 2025 Nuxt 学习项目 - 基于 Nuxt 4 构建</p>
    </footer>
  </div>
</template>

<style scoped>
.layout-default {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}

.nav {
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 1.25rem;
  font-weight: bold;
  color: #00dc82;
  text-decoration: none;
}

.links {
  display: flex;
  gap: 24px;
}

.links a {
  color: #334155;
  text-decoration: none;
  transition: color 0.2s;
}

.links a:hover,
.links a.router-link-active {
  color: #00dc82;
}

.main {
  flex: 1;
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

.footer {
  border-top: 1px solid #e2e8f0;
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}
</style>
