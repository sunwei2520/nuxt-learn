# 08 样式与静态资源

## CSS 支持

### 全局 CSS

```css
/* app/assets/css/main.css */
:root {
  --primary-color: #00dc82;
}

body {
  font-family: system-ui, sans-serif;
  margin: 0;
}
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/main.css']
})
```

### 组件级样式

```vue
<template>
  <div class="card">
    <h3 class="title">标题</h3>
  </div>
</template>

<style scoped>
/* scoped: 只作用于当前组件 */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.title {
  color: var(--primary-color);
}
</style>
```

### CSS 预处理器

```bash
npm install -D sass
```

```vue
<style lang="scss" scoped>
$primary: #00dc82;

.card {
  border-color: $primary;
  
  .title {
    color: $primary;
    
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
```

### Tailwind CSS

```bash
npm install -D @nuxtjs/tailwindcss
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss']
})
```

```vue
<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-bold text-green-600">标题</h3>
  </div>
</template>
```

## 静态资源

### public 目录

`app/public/` 下的文件直接复制到输出目录，通过 `/` 访问：

```
app/public/
├── favicon.ico      → /favicon.ico
├── robots.txt       → /robots.txt
└── images/
    └── logo.png     → /images/logo.png
```

```vue
<template>
  <img src="/images/logo.png" alt="Logo">
</template>
```

### assets 目录

`app/assets/` 下的文件经过 Vite 构建处理：

```
app/assets/
├── css/
│   └── main.css
└── images/
    └── hero.jpg
```

```vue
<script setup>
// 导入图片，返回 URL
import heroImage from '~/assets/images/hero.jpg'
</script>

<template>
  <img :src="heroImage" alt="Hero">
</template>
```

### 响应式图片

```vue
<script setup>
// 使用 Nuxt 图片模块
</script>

<template>
  <NuxtImg
    src="/images/hero.jpg"
    width="800"
    height="400"
    format="webp"
    quality="80"
  />
</template>
```

## 字体

```css
/* app/assets/css/fonts.css */
@font-face {
  font-family: 'CustomFont';
  src: url('~/assets/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

## 实践练习

1. 创建 `app/assets/css/main.css`，定义全局样式变量
2. 在 `nuxt.config.ts` 中引入全局样式
3. 创建一个组件，使用 scoped 样式
4. 在 `app/public/` 放置图片，在页面中引用
