<script setup>
// 动态路由：文章详情页
const route = useRoute()
const postId = route.params.id

// 获取文章数据
const { data: post, pending, error } = await useFetch(`/api/posts/${postId}`)

// 动态 SEO
useSeoMeta({
  title: () => post.value?.title ?? '加载中...',
  description: () => post.value?.excerpt ?? ''
})
</script>

<template>
  <div>
    <NuxtLink to="/posts">← 返回列表</NuxtLink>
    
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">文章不存在</div>
    
    <article v-else class="post-detail">
      <h1>{{ post.title }}</h1>
      <time>{{ post.date }}</time>
      <div class="content">
        <p>{{ post.content }}</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.post-detail {
  max-width: 640px;
}

.post-detail h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.post-detail time {
  color: #64748b;
  font-size: 0.875rem;
}

.post-detail .content {
  margin-top: 24px;
  line-height: 1.7;
}
</style>
