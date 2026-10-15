<script setup>
// Demo：用本地 ref 做组件内状态
// 每个组件实例都有自己的 ref → 互不影响
defineProps({
  label: { type: String, default: '实例' }
})

const count = ref(0)
</script>

<template>
  <div class="counter-box local">
    <div class="box-label">{{ label }}</div>
    <div class="box-value">{{ count }}</div>
    <div class="box-actions">
      <button @click="count++">+1</button>
      <button @click="count--">-1</button>
    </div>
    <div class="box-key">const count = ref(0)</div>
  </div>
</template>

<style scoped>
.counter-box {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px;
  padding: 14px;
  text-align: center;
}

.box-label {
  font-size: 0.78rem;
  color: #64748b;
  margin-bottom: 6px;
}

.box-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #64748b;
  line-height: 1.2;
}

.box-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 8px 0 6px;
}

.box-actions button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #475569;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.85rem;
  cursor: pointer;
}

.box-actions button:hover {
  background: #475569;
  color: #fff;
}

.box-key {
  font-family: monospace;
  font-size: 0.68rem;
  color: #94a3b8;
}
</style>
