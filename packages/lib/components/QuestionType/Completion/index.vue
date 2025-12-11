<template>
  <Base ref="baseComponent" class="completion-question" :question="question" :mode="mode" @blankAnswerChange="blankAnswerChange" :isSubmitted="isSubmitted">
  <!-- 编辑模式 -->
  <template v-if="mode === 1">
    <div class="edit-mode">
      <div class="title">
      </div>
      <div class="correct-answer">
        <span class="tip">答案：</span><span class="correct-answer-tip">( {{ t('inputAnswerTip2') }} )</span>
        {{ question.blanks }}
        <div v-for="(blank, index) in question.blanks" :key="blank.id || index">
          <div class="answer-item">
            <span class="answer-option">[{{ index + 1 }}]</span>
            <input class="answer-input" :placeholder="'请输入答案'" v-model="blank.correctAnswer" type="text"
              @change="answerChange" />
            <div class="btn-delete">
              <img src="@/assets/close.png" alt="" @click="deleteBlank(blank, index)">
            </div>
          </div>
        </div>
        <div class="can-exchange">
          <TinyCheckbox v-model="question.allowExchange" :false-label="0" :true-label="1">答案可互换顺序</TinyCheckbox>
        </div>
        <div class="btn-save">
          <TinyButton type="info" @click="saveQuestion">{{ t("save") }}</TinyButton>
          <TinyButton @click="cancel">{{ t("cancel") }}</TinyButton>
        </div>
      </div>
    </div>
  </template>
  <!-- 预览模式 -->
  <template v-else-if="mode === 2">
    <div class="preview-mode">
      <FileList :list="question.link"></FileList>
      <div class="correct-answer-preview">
        <h3>正确答案：</h3>
        <div class="answer-item" v-for="(blank, index) in question.blanks" :key="blank.id || index">
          <span class="answer-option">[{{ index + 1 }}]</span>
          <span class="answer-value">{{ blank.correctAnswer || '-' }}</span>
        </div>
      </div>
    </div>
  </template>
  </Base>
</template>

<script>
import { defineComponent, ref, reactive, computed, watch } from 'vue-demi';
import { TinyButton, TinyCheckbox } from '@opentiny/vue'
import Base from '../Base.vue'
import FileList from '../../FileList/index.vue';
import { titleListener } from '../../../model/questionFactory.js';
import { t } from '../../../locale/index.js';
import { getUniqueValue } from "@/utils"
import { getQuestion } from "../../../model/questionFactory.js"

export default defineComponent({
  name: 'Completion',
  components: {
    Base,
    FileList,
    TinyButton,
    TinyCheckbox
  },
  props: {
    mode: {
      type: Number,
      default: 1 // 1:编辑模式, 2:预览模式, 3:答题模式
    },
    oriQuestion: {
      type: Object,
      default: () => ({})
    },
    isSubmitted: {
      type: Boolean,
      default: false
    },
  },
  emits: ['save', 'cancel', 'submit'],
  setup(props, { emit }) {
    const question = ref({})
    const userAnswers = ref([]);

    // 监听原始题目变化
    watch(() => props.oriQuestion, (newVal) => {
      question.value = getQuestion(newVal);
    }, { immediate: true });

    // 答案变化处理
    const answerChange = () => {
      if (props.mode !== 1) return;
      let correctAnswer = [];
      if (question.value.blanks) {
        for (let i = 0; i < question.value.blanks.length; i++) {
          let blank = question.value.blanks[i];
          correctAnswer.push(blank.correctAnswer || '');
        }
      }

      question.value.correctAnswer = correctAnswer;
    };

    // 保存题目
    const saveQuestion = () => {
      if (props.mode !== 1) return;
      // 执行答案变化处理确保答案同步
      answerChange();
      // 基本验证
      if (!question.value.title || !question.value.blanks || question.value.blanks.length === 0) {
        console.warn('请输入题目内容并添加空格');
        return;
      }

      // 检查是否所有空格都有答案
      let hasEmptyAnswer = false;
      for (let i = 0; i < question.value.blanks.length; i++) {
        if (!question.value.blanks[i].correctAnswer || question.value.blanks[i].correctAnswer.trim() === '') {
          hasEmptyAnswer = true;
          break;
        }
      }

      if (hasEmptyAnswer) {
        console.warn('请为所有空格填写答案');
        return;
      }
      console.log('save-completion', question.value);
      emit('save', question.value);
    };
    // 取消编辑
    const cancel = () => {
      emit('cancel');
    };
    // 答题模式的时候，答案改变的时候改变question.record.answer 并且emit('change')
    const blankAnswerChange = (stuAnswer) => {
      if (props.mode !== 3) return;
      question.value.record.answer = stuAnswer;
      emit('change', question.value);
    }

    const baseComponent = ref(null)
    // 删除空格
    const deleteBlank = (blank, index) => {
      if (props.mode !== 1) return;
      // 找到所有(&nbsp;)的匹配及其索引
      const reg = /\(&nbsp;\)/g;
      let match;
      let indices = [];
      
      while ((match = reg.exec(question.value.title)) !== null) {
        indices.push(match.index);
      }
      // 检查索引是否有效
      if (index >= 0 && index < indices.length) {
        // 获取要删除的空格位置
        const idx = indices[index];
        // 删除指定位置的&nbsp;
        question.value.title = question.value.title.substring(0, idx) + question.value.title.substring(idx + 8);
        console.log(question.value.title,'-------------------------')
        // 删除对应的blank
        question.value.blanks.splice(index, 1);
        // 删除空格，这里手动更新富文本的内容
        baseComponent.value.richTextareaRef.content = question.value.title
      }
    };
    // 标题内容变化处理
    const handleTitleChange = (newValue, oldValue) => {
      console.log(newValue, oldValue,'标题内容变化处理');
      if (props.mode !== 1) return;
      
      // 确保blanks数组存在
      if (!question.value.blanks) {
        question.value.blanks = [];
      }
      
      // 获取所有(&nbsp;)的匹配位置
      const reg = /\(&nbsp;\)/g;
      let match;
      let newIndices = [];
      
      while ((match = reg.exec(newValue)) !== null) {
        newIndices.push(match.index);
      }
      
      // 创建一个映射，记录现有blank的位置和索引
      const existingBlanksMap = new Map();
      question.value.blanks.forEach((blank, index) => {
        existingBlanksMap.set(blank.blankIndex, index);
      });
      
      // 跟踪需要添加的新blank位置
      const blanksToAdd = [];
      // 使用titleListener处理空格变化
      titleListener(
        newValue,
        /\(&nbsp;\)/g,
        (i, strIndex) => {
          if (!question.value.blanks) question.value.blanks = [];
          const index = question.value.blanks.findIndex(
            (it) => it.blankIndex == strIndex
          );
          if (index === -1) {
            // 创建新空格
            const newBlank = {
              id: getUniqueValue(),
              blankIndex: strIndex,
              correctAnswer: ''
            };
            blanksToAdd.push({ index: i, blank: newBlank });
          }
        },
        (indexs) => {
          if (!question.value.blanks) return;
          for (let i = question.value.blanks.length - 1; i >= 0; i--) {
            const index = indexs.findIndex(
              (it) => question.value.blanks[i].blankIndex == it
            );
            if (index === -1) {
              question.value.blanks.splice(i, 1);
              userAnswers.value.splice(i, 1);
            }
          }
        }
      );
      
      // 按照索引位置倒序添加新blank，避免插入顺序影响后续索引
      blanksToAdd.sort((a, b) => b.index - a.index);
      
      blanksToAdd.forEach(item => {
        // 在正确的位置插入新blank
        question.value.blanks.splice(item.index, 0, item.blank);
        // 在对应位置插入新的userAnswer
        userAnswers.value.splice(item.index, 0, '');
      });
    };
    // 监听标题变化
    watch(() => question.value.title, handleTitleChange, { immediate: true });
    
    return {
      t,
      question,
      userAnswers,
      saveQuestion,
      cancel,
      answerChange,
      blankAnswerChange,
      deleteBlank,
      baseComponent
    };
  }
});
</script>

<style lang="scss" scoped>
$height: 44px;
.completion-question {
  .edit-mode {
    .correct-answer {
      margin-top: 12px;
    }
  }
  .preview-mode {
    .answer-item {
      display: flex;
      align-items: center;
    }
  }
}
.title-tip {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.2;
  font-weight: normal;
}

.correct-answer-tip {
  margin-left: 6px;
  font-size: 14px;
  line-height: 20px;
}

.answer-item {
  margin-top: 12px;
  line-height: $height;
  font-size: 16px;
  display: flex;
}

.answer-option {
  margin-right: 20px;
}

.answer-input {
  flex: 1;
  height: $height;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  outline: none;
  font-size: 16px;
}

.btn-delete {
  img {
    width: 12px;
    height: 12px;
  }

  line-height: 44px;
  margin-left: 10px;
  cursor: pointer;
}

.can-exchange {
  margin: 14px 0;
  display: block;
}
</style>
