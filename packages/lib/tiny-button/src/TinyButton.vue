<template>
  <!-- 在 OpenTiny 基础上加自己的默认插槽 / 样式 / 事件 -->
  <tiny-button
    :type="type"
    :size="size"
    @click="handleClick1"
  > 
    <slot />
  </tiny-button>
</template>

<script>
import { defineComponent, isVue2, isVue3, version } from 'vue-demi'
// let TinyButtonImport
// if (isVue2) {
//   TinyButtonImport = import('@opentiny/vue-v2/index.js').then(pkg => pkg.Button)
// } else {
//   import('@opentiny/vue-v3/es/button/index.js').then(m => {
//   TinyButtonImport = m.Button   // named export
// })
// }
import { Button as TinyButton } from '@opentiny/vue'
// import 'element-plus/dist/index.css'
export default defineComponent({
  name: 'MyTinyButton',
  components: { 
    TinyButton,
  },
  props: {
    type:  { type: String, default: 'primary' },
    size:  { type: String, default: 'medium' }
  },
  emits: ['handleClick1'],
  setup(props, { emit }) {
    const handleClick1 = e => emit('handleClick1', e)
    return { 
      handleClick1,
      version
    }
  }
})
</script>

<style scoped>
/* 你可以覆盖 OpenTiny 变量或写死自定义样式 */
.my-tiny-button{ border-radius:20px; }
</style>