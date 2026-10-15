<script setup>
// Demo：用 useState 做跨组件共享状态
// 多个实例使用同一个 key → 共享同一个 ref
defineProps({
  label: { type: String, default: '实例' }
})

const count = useState('demo-shared-counter', () => 0)
</script>

<template>
  <div class="counter-box shared">
    <div class="box-label">{{ label }}</div>
    <div class="box-value">{{ count }}</div>
    <div class="box-actions">
      <button @click="count++">+1</button>
      <button @click="count--">-1</button>
    </div>
    <div class="box-key">useState('demo-shared-counter')</div>
  </div>
</template>

<style scoped>
.counter-box {
  border: 1px solid #c7f0d9;
  background: #f0fdf4;
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
  color: #00dc82;
  line-height: 1.2;
}

.box-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 8px 0 6px;
}

.box-actions button {
  border: 1px solid #00dc82;
  background: #fff;
  color: #00dc82;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.85rem;
  cursor: pointer;
}

.box-actions button:hover {
  background: #00dc82;
  color: #fff;
}

.box-key {
  font-family: monospace;
  font-size: 0.68rem;
  color: #94a3b8;
}
</style>
