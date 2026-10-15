<script setup>
// 第 11 章 Demo B：故意抛错的页面
// 默认 500；也可以 ?code=404 / 403 换状态码。
// 抛出后由 app/error.vue 接管 —— 你永远看不到下面的 template 内容。
const route = useRoute()
const code = Number(route.query.code) || 500

throw createError({
  statusCode: code,
  statusMessage: code === 404
    ? '演示：资源不存在（404）'
    : code === 403
      ? '演示：没有访问权限（403）'
      : '演示：服务端异常（500）',
  data: { from: 'boom.vue', code, tip: 'createError 的 data 字段会出现在错误页上' }
})
</script>

<template>
  <div>
    <p>这行永远不会渲染 —— setup 阶段就抛错了。</p>
  </div>
</template>
