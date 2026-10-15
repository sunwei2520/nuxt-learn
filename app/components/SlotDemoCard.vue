<script setup>
// 第03章演示组件：带命名插槽 + 插槽回退内容
// 用于章节页面的「插槽填充 playground」
defineProps({
  title: {
    type: String,
    default: 'SlotDemoCard'
  }
})
</script>

<template>
  <div class="demo-card">
    <!-- 具名插槽：header，带回退内容 -->
    <div class="demo-card-header">
      <slot name="header">
        <span class="fallback">（header 插槽未填充，显示回退内容）</span>
      </slot>
    </div>

    <!-- 默认插槽 -->
    <div class="demo-card-body">
      <slot>
        <span class="fallback">（default 插槽未填充，显示回退内容）</span>
      </slot>
    </div>

    <!-- 具名插槽：footer -->
    <div class="demo-card-footer">
      <slot name="footer">
        <span class="fallback">（footer 插槽未填充，显示回退内容）</span>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.demo-card {
  border: 1px solid #c7f0d9;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.demo-card-header {
  padding: 12px 16px;
  background: #f0fdf4;
  border-bottom: 1px dashed #c7f0d9;
}

.demo-card-body {
  padding: 16px;
  min-height: 60px;
}

.demo-card-footer {
  padding: 10px 16px;
  background: #f8fafc;
  border-top: 1px dashed #c7f0d9;
}

.fallback {
  color: #94a3b8;
  font-size: 0.82rem;
  font-style: italic;
}
</style>
