import { defineStore } from 'pinia'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)

  const postCount = computed(() => posts.value.length)

  async function fetchPosts() {
    loading.value = true
    try {
      const data = await $fetch('/api/posts')
      posts.value = data.posts
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(id) {
    loading.value = true
    try {
      currentPost.value = await $fetch(`/api/posts/${id}`)
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    currentPost,
    loading,
    postCount,
    fetchPosts,
    fetchPost
  }
})
