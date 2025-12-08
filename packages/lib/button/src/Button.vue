<template>
  <button class="my-btn" @click="onClick">
    {{ 'vue-version:' + vueVersion }}
    <slot/>
  </button>
</template>

<script>
import { defineComponent, version } from 'vue-demi'
export default defineComponent({
  name: 'MyButton',
  emits: ['click'],
  setup(_, { emit }) {
    const vueVersion = version
    const onClick = e => emit('click', e)
    return {
      onClick,
      vueVersion
    }
  }
})
</script>

<style scoped>
.my-btn{padding:6px 12px;background:#409eff;color:#fff;border:none;border-radius:4px}
</style>