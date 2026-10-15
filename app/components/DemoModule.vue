<script setup>
// CSS Modules 演示：两个组件里用了同名的 .card / .title，
// 但因为用了 $style.xxx，CSS 编译后类名会自动加 hash，
// 两个组件互不干扰

const highlighted = ref(false)
</script>

<template>
  <div :class="[$style.card, highlighted && $style.highlighted]">
    <h4 :class="$style.title">CSS Modules 组件</h4>
    <p :class="$style.desc">
      这个组件和 DemoScoped 里的 <code>.card</code> / <code>.title</code> 是同名的，
      但编译后类名会变成 <code>card_3f2a1b</code> 这样的 hash，不会冲突。
    </p>
    <button :class="$style.btn" @click="highlighted = !highlighted">
      {{ highlighted ? '取消高亮' : '高亮这个组件' }}
    </button>
  </div>
</template>

<style module>
/* CSS Modules：在 <style module> 标签下写类，
   模板里用 $style.xxx 引用，编译后自动加 hash */

.card {
  padding: 16px;
  border: 1px solid #c7f0d9;
  border-radius: 8px;
  background: #f0fdf4;
}

.title {
  margin: 0 0 8px;
  color: #065f46;
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
  border: 1px solid #00dc82;
  background: #fff;
  color: #00dc82;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn:hover {
  background: #00dc82;
  color: #fff;
}

.highlighted {
  border-color: #f59e0b;
  background: #fffbeb;
}

.highlighted .title {
  color: #92400e;
}
</style>
