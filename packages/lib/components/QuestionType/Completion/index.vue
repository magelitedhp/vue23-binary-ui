<template>
  <Base class="completion-question" :question="question" :mode="mode" @blankAnswerChange="blankAnswerChange" :isSubmitted="isSubmitted">
  <!-- 编辑模式 -->
  <template v-if="mode === 1">
    <div class="edit-mode">
      <div class="title">
      </div>
      <div class="correct-answer">
        <span class="tip">答案：</span><span class="correct-answer-tip">( {{ t('inputAnswerTip2') }} )</span>
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
    return {
      t,
      question,
      userAnswers,
      saveQuestion,
      cancel,
      answerChange,
      blankAnswerChange
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
