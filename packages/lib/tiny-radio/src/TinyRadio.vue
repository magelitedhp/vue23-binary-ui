<template>
  <!-- 基于 tiny-radio 扩展，添加默认内容、插槽和自定义事件 -->
  <tiny-radio
    v-model="radioValue"
    :label="label"
    :name="name"
    :disabled="disabled"
    @change="handleRadioChange"
    @click="handleRadioClick"
    class="my-tiny-radio"
  >
    <!-- 默认显示 Vue 版本信息，插槽可覆盖或扩展 -->
    <span v-if="!$slots.default">
      {{ `vueVersion: ${version} ${label}` }}
    </span>
    <slot />
  </tiny-radio>
</template>

<script>
import { defineComponent, isVue2, isVue3, version, ref, toRefs } from 'vue-demi'
// 按需导入 tiny-radio（兼容 Vue2/Vue3）
import { Radio as TinyRadio } from '@opentiny/vue'

export default defineComponent({
  name: 'MyTinyRadio',
  components: {
    TinyRadio // 注册组件（模板中使用 tiny-radio 小写形式）
  },
  props: {
    // 继承 tiny-radio 核心属性
    label: {
      type: [String, Number, Boolean],
      required: true // radio 的唯一标识，必须传入
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: undefined // 双向绑定值（v-model）
    },
    name: {
      type: String,
      default: '' // 原生 name 属性
    },
    disabled: {
      type: Boolean,
      default: false // 是否禁用
    }
  },
  emits: ['update:modelValue', 'change', 'click'], // 声明事件
  setup(props, { emit }) {
    // 处理 v-model 双向绑定（兼容 Vue2/Vue3）
    const radioValue = isVue2
      ? ref(props.modelValue) // Vue2 中通过 watch 同步
      : toRefs(props).modelValue // Vue3 直接使用 props 响应式

    // 监听值变化，同步给父组件（Vue2 专用）
    if (isVue2) {
      watch(radioValue, (newVal) => {
        emit('update:modelValue', newVal)
      })
    }

    // 处理 radio 内置 change 事件
    const handleRadioChange = (value) => {
      emit('change', value) // 透传原始 change 事件
    }

    // 处理点击事件
    const handleRadioClick = (e) => {
      emit('click', e) // 透传点击事件
    }

    return {
      radioValue,
      version, // 暴露 Vue 版本
      handleRadioChange,
      handleRadioClick
    }
  }
})
</script>

<style scoped>
/* 自定义样式 */
.my-tiny-radio {
  margin: 4px 0;
  /* 可添加自定义样式覆盖原始组件 */
}
</style>