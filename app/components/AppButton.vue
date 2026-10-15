<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    class="btn"
    :class="[`btn-${type}`, `btn-${size}`]"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 类型 */
.btn-primary {
  background: #00dc82;
  color: #1e293b;
}

.btn-primary:hover:not(:disabled) {
  background: #00c474;
}

.btn-secondary {
  background: #e2e8f0;
  color: #334155;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e1;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

/* 尺寸 */
.btn-small {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-medium {
  padding: 10px 20px;
  font-size: 1rem;
}

.btn-large {
  padding: 14px 28px;
  font-size: 1.125rem;
}
</style>
