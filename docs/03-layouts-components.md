# 03 布局与组件

## 布局系统

布局是包裹页面的外壳，适合放置导航栏、页脚等公共元素。

### 默认布局

创建 `app/layouts/default.vue`，所有页面默认使用它：

```vue
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </header>
    
    <main>
      <slot />  <!-- 页面内容渲染在这里 -->
    </main>
    
    <footer>
      <p>© 2025 Nuxt 学习项目</p>
    </footer>
  </div>
</template>
```

### 自定义布局

创建 `app/layouts/custom.vue`：

```vue
<template>
  <div class="custom-layout">
    <aside>侧边栏</aside>
    <main>
      <slot />
    </main>
  </div>
</template>
```

### 页面指定布局

```vue
<script setup>
// 方式1：通过 definePageMeta
definePageMeta({
  layout: 'custom'
})
</script>

<!-- 方式2：在模板中动态指定 -->
<template>
  <NuxtLayout name="custom">
    <h1>页面内容</h1>
  </NuxtLayout>
</template>
```

### 禁用布局

```vue
<script setup>
definePageMeta({
  layout: false
})
</script>
```

## 组件系统

### 自动导入

`app/components/` 下的组件自动全局注册，无需 import：

```vue
<!-- app/components/AppButton.vue -->
<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary'
  }
})
</script>

<template>
  <button :class="['btn', `btn-${type}`]">
    <slot />
  </button>
</template>
```

在任何页面中直接使用：

```vue
<template>
  <!-- 无需 import，直接使用 -->
  <AppButton type="primary">点击</AppButton>
</template>
```

### 组件命名规则

| 文件路径 | 组件名 |
|----------|--------|
| `components/AppButton.vue` | `<AppButton />` |
| `components/base/Button.vue` | `<BaseButton />` |
| `components/form/Input.vue` | `<FormInput />` |

### 动态组件

```vue
<script setup>
const currentComponent = ref('AppButton')
</script>

<template>
  <component :is="currentComponent" />
</template>
```

### 懒加载组件

```vue
<script setup>
// 组件按需加载
const LazyAppModal = defineAsyncComponent(() => import('~/components/AppModal.vue'))
</script>
```

或使用 `Lazy` 前缀：

```vue
<template>
  <LazyAppModal v-if="showModal" />
</template>
```

## Props 与 Emits

```vue
<!-- app/components/AppCard.vue -->
<script setup>
// Props
const props = defineProps({
  title: String,
  content: String,
  clickable: Boolean
})

// Emits
const emit = defineEmits(['click'])

function handleClick() {
  if (props.clickable) {
    emit('click', props.title)
  }
}
</script>

<template>
  <div class="card" @click="handleClick">
    <h3>{{ title }}</h3>
    <p>{{ content }}</p>
  </div>
</template>
```

使用：

```vue
<template>
  <AppCard 
    title="标题" 
    content="内容"
    clickable
    @click="handleCardClick"
  />
</template>
```

## 实践练习

1. 创建 `app/layouts/default.vue`，包含导航栏和页脚
2. 创建 `app/components/AppCard.vue`，支持 title 和 content props
3. 在首页中使用 AppCard 组件展示多张卡片
4. 创建 `app/layouts/custom.vue`，并在 about 页面中使用它
