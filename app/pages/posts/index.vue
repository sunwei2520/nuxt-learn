<script setup>
// 文章列表页
const { data: posts, pending, error } = await useFetch('/api/posts')

useHead({
  title: '文章列表'
})
</script>

<template>
  <div>
    <h1>文章列表</h1>
    
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">加载失败: {{ error.message }}</div>
    
    <div v-else class="post-list">
      <article v-for="post in posts.posts" :key="post.id" class="post-card">
        <h2>
          <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>
        </h2>
        <p>{{ post.excerpt }}</p>
        <time>{{ post.date }}</time>
      </article>
    </div>
  </div>
</template>

<style scoped>
.post-list {
  display: grid;
  gap: 16px;
}

.post-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-card h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
}

.post-card a {
  color: #00dc82;
  text-decoration: none;
}

.post-card time {
  color: #64748b;
  font-size: 0.875rem;
}
</style>
