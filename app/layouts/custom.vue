<template>
  <div class="layout-custom">
    <aside class="sidebar">
      <h2>自定义布局</h2>
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/posts">文章</NuxtLink>
      </nav>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-custom {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  padding: 24px;
}

.sidebar h2 {
  font-size: 1.25rem;
  margin-bottom: 24px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  color: #00dc82;
}

.content {
  flex: 1;
  padding: 32px;
}
</style>
