<template>
  <div class="base-container">
    <!-- 编辑模式使用富文本编辑器，预览模式使用div显示 -->
    <template v-if="mode === 2 || mode === 3">
      <div class="preview-title" v-html="question.title || ''"></div>
      <FileList mode="view" type="block" :isPreview="true" :list="question.link" @deleteFile=""></FileList>
    </template>
    <RichTextarea
      ref="richTextareaRef"
      v-else
      v-model="question.title"
      :placeholderText="t('inputQuestionTitle')"
      :list="question.link"
      :maxNum="5"
      :is-question-bank="isQuestionBank"
      @addFile="addTitleFile"
      @deleteFile="deleteTitleFile"
    ></RichTextarea>
    <TinyButton class="right" v-if="question.type == 3" @click="insert">
      {{ t("insertQue") }}
    </TinyButton>
    <slot></slot>
    <!-- 答案展示区域 -->
    <template v-if="showAnswer">
      <div class="answer-display">
        <span>{{ t('stuAnswer') }}：</span>
        <span>{{ formatAnswer(question.record?.answer) }}</span>
      </div>
      <div class="correct-answer">
        <span>{{ mode === 2 ? t('answer') : t('correctAnswer') }}：</span>
        <span>{{ formatAnswer(question.correctAnswer) }}</span>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, computed, ref, isVue3, isVue2 } from 'vue-demi'
import { TinyButton } from '@opentiny/vue'
import RichTextarea from '../RichTextarea/index.vue'
import FileList from '../FileList/index.vue'
import { useT } from "../../locale/index.js"
export default defineComponent({
  name: 'Base',
  components: {
    RichTextarea,
    FileList,
    TinyButton
  },
  props: {
    question: {
      type: Object,
      required: true,
      default: () => {}
    },
    showAnswer: {
      type: Boolean,
      default: false
    },
    mode: {
      type: Number,
      default: 0
    },
    isQuestionBank: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const t = useT()    
    const richTextareaRef = ref(null)
    
    const addTitleFile = (file) => {
      // 文件添加逻辑
      console.log('Add file:', file)
    }
    
    const deleteTitleFile = (fileId) => {
      // 文件删除逻辑
      console.log('Delete file:', fileId)
    }
    
    const formatAnswer = (answer) => {
      // 答案格式化逻辑
      return answer || ''
    }
    
    // 实现insert方法，通过ref调用RichTextarea组件中的方法
    const insert = () => {
      if (richTextareaRef.value) {
        // 方式1：直接调用RichTextarea暴露的insertContent方法
        // 这里假设插入的内容是"<span class='q-space' contenteditable='false' data-index='-1'>(&nbsp;)</span>"
        const contentToInsert = "<span class='q-space' contenteditable='false' data-index='-1'>(&nbsp;)</span>"
        richTextareaRef.value.insertContent(contentToInsert)
        
        // 方式2：获取编辑器实例后调用其方法
        // const editor = richTextareaRef.value.getEditor()
        // if (editor) {
        //   // 调用编辑器实例的方法，具体方法名需根据实际API调整
        //   editor.insertContent(contentToInsert)
        // }
      }
    }
    
    return {
      t,
      addTitleFile,
      deleteTitleFile,
      formatAnswer,
      insert,
      richTextareaRef
    }
  }
})
</script>

<style lang="scss" scoped>
</style>