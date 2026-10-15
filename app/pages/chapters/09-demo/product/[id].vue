<script setup>
// 第 09 章 Demo C 配套页面：动态商品页
// SEO 元信息完全由接口数据驱动 —— 不同商品页的 og 标签各不相同
const route = useRoute()
const { data: product, error } = await useFetch(`/api/demo/product/${route.params.id}`)

// useRequestURL：SSR 期间拿到当前请求的完整 URL（含 origin），客户端 hydration 保持一致
// og:image / og:url 必须是绝对地址 —— 社交平台的爬虫不会帮你拼相对路径
const requestUrl = useRequestURL()

useSeoMeta({
  // 传 getter 函数 → 接口数据到位后自动更新（useSeoMeta 支持响应式值）
  title: () => product.value?.name ?? '商品不存在',
  description: () => product.value?.description ?? '',
  ogTitle: () => product.value?.name ?? '',
  ogDescription: () => product.value?.description ?? '',
  ogImage: () => product.value ? `${requestUrl.origin}${product.value.image}` : '',
  ogUrl: () => requestUrl.href,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div class="product-page">
    <NuxtLink to="/chapters/09" class="back-link">← 返回第 09 章</NuxtLink>

    <div v-if="product" class="product-card">
      <img :src="product.image" :alt="product.name" class="product-img" />
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-desc">{{ product.description }}</p>
        <p class="product-price">¥ {{ product.price }}</p>
      </div>
    </div>

    <div v-else class="product-missing">
      <h1>商品不存在</h1>
      <p>{{ error?.statusMessage || '没有对应的商品数据' }}</p>
      <p class="hint">
        试试
        <NuxtLink to="/chapters/09-demo/product/1">商品 1</NuxtLink>
        或
        <NuxtLink to="/chapters/09-demo/product/2">商品 2</NuxtLink>
      </p>
    </div>

    <div class="seo-note">
      <h3>本页的 SEO 元信息是动态生成的</h3>
      <p>
        上方商品数据来自 <code>GET /api/demo/product/{{ route.params.id }}</code>，
        <code>useSeoMeta</code> 根据接口返回设置了
        <code>og:title</code> / <code>og:description</code> / <code>og:image</code> / <code>og:url</code>。
        右键「查看网页源代码」，在 <code>&lt;head&gt;</code> 里能看到这些标签已经在首屏 HTML 中——这就是爬虫看到的内容。
      </p>
      <p>
        也可以回到 <NuxtLink to="/chapters/09">第 09 章</NuxtLink>，用 Demo C 的「模拟爬虫」抓取本页并生成分享卡片预览。
      </p>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  max-width: 720px;
  margin: 0 auto;
}

.back-link {
  color: #00dc82;
  text-decoration: none;
  font-size: 0.9rem;
}

.product-card {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.product-img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.product-name {
  margin: 0 0 10px;
  color: #1e293b;
  font-size: 1.5rem;
}

.product-desc {
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 14px;
}

.product-price {
  color: #dc2626;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.product-missing {
  margin-top: 20px;
  padding: 40px 24px;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
}

.product-missing h1 {
  color: #1e293b;
  margin: 0 0 8px;
}

.hint a {
  color: #00dc82;
}

.seo-note {
  margin-top: 24px;
  padding: 20px;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.8;
}

.seo-note h3 {
  margin: 0 0 8px;
  color: #1e40af;
  font-size: 1rem;
}

.seo-note p {
  margin: 0 0 8px;
}

.seo-note code {
  background: #dbeafe;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  color: #1e40af;
}

.seo-note a {
  color: #1e40af;
}

@media (max-width: 640px) {
  .product-card {
    flex-direction: column;
  }

  .product-img {
    width: 100%;
    height: auto;
  }
}
</style>
