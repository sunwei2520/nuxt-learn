<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  if (props.clickable) {
    emit('click', props.title)
  }
}
</script>

<template>
  <div 
    class="card" 
    :class="{ clickable }"
    @click="handleClick"
  >
    <h3 class="title">{{ title }}</h3>
    <p v-if="content" class="content">{{ content }}</p>
    <slot />
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.2s;
}

.card.clickable {
  cursor: pointer;
}

.card.clickable:hover {
  border-color: #00dc82;
  box-shadow: 0 4px 12px rgba(0, 220, 130, 0.15);
}

.title {
  margin: 0 0 8px;
  font-size: 1.125rem;
  color: #1e293b;
}

.content {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}
</style>
