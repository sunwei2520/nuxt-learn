<script setup>
// Scoped 演示：同样的 .card / .title，但用了 scoped + data 属性
// 两个组件的类名一样，但 Vue 会给当前组件的样式加 [data-v-hash]，
// 只作用于当前组件的元素

const expanded = ref(false)
</script>

<template>
  <div class="card" :class="{ expanded }">
    <h4 class="title">Scoped CSS 组件</h4>
    <p class="desc">
      这个组件和 DemoModule 里的 <code>.card</code> / <code>.title</code> 同名，
      但 scoped 会给当前组件的每个选择器加上 <code>[data-v-7f3a2b]</code> 属性选择器，
      只作用于当前组件的元素。
    </p>
    <button class="btn" @click="expanded = !expanded">
      {{ expanded ? '收起说明' : '展开说明' }}
    </button>

    <div v-if="expanded" class="expanded-content">
      <p><strong>Scoped 的工作原理：</strong></p>
      <ol>
        <li>Vue 给当前组件的所有 DOM 元素添加 <code>data-v-xxx</code> 属性</li>
        <li>编译后的选择器变成 <code>.card[data-v-xxx]</code>、<code>.title[data-v-xxx]</code></li>
        <li>其他组件没有 <code>data-v-xxx</code>，所以样式不会污染</li>
        <li>组件内部想穿透子组件样式 → 用 <code>:deep()</code></li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
/* scoped：在 <style scoped> 标签下写类，
   模板里直接用类名，Vue 自动加 data-v 属性 */

.card {
  padding: 16px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
}

.title {
  margin: 0 0 8px;
  color: #1e40af;
  font-size: 0.95rem;
}

.desc {
  margin: 0 0 12px;
  color: #475569;
  font-size: 0.82rem;
  line-height: 1.6;
}

.desc code {
  background: #fff;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.78em;
}

.btn {
  padding: 6px 14px;
  border: 1px solid #3b82f6;
  background: #fff;
  color: #3b82f6;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn:hover {
  background: #3b82f6;
  color: #fff;
}

.expanded {
  border-color: #3b82f6;
}

.expanded-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #93c5fd;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.7;
}

.expanded-content ol {
  padding-left: 18px;
  margin: 6px 0 0;
}

.expanded-content code {
  background: #dbeafe;
  color: #1e40af;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.78em;
}
</style>
