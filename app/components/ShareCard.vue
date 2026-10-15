<script setup>
// 分享卡片预览：模拟社交平台（微信 / Twitter）根据 og 标签渲染出的链接卡片
// 数据来源：Demo C 模拟爬虫抓取商品页 HTML 后解析出的 og 标签
const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  url: { type: String, default: '' }
})

const domain = computed(() => {
  try {
    return new URL(props.url).host
  } catch {
    return props.url
  }
})
</script>

<template>
  <div class="share-card">
    <div v-if="image" class="thumb">
      <img :src="image" :alt="title" />
    </div>
    <div class="body">
      <div class="s-title">{{ title || '（缺少 og:title）' }}</div>
      <div class="s-desc">{{ description || '（缺少 og:description）' }}</div>
      <div class="s-domain">{{ domain || '（缺少 og:url）' }}</div>
    </div>
  </div>
</template>

<style scoped>
.share-card {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  max-width: 480px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.thumb {
  width: 120px;
  min-height: 120px;
  flex-shrink: 0;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.s-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.92rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.s-desc {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.s-domain {
  color: #94a3b8;
  font-size: 0.72rem;
  font-family: monospace;
}
</style>
