<template>
  <Base class="true-or-false-question" :question="question" :mode="mode">
  <!-- 编辑模式 -->
  <template v-if="mode === 1">
    <template v-if="!isMobile">
      <div class="correct-answer">
        <span>{{ t("correctAnswer") }}：</span>
        <TinyRadioGroup v-model="correctAnswer">
          <TinyRadio label="true">
            <img class="correct-img" src="@/assets/correct.svg" alt="">
          </TinyRadio>
          <TinyRadio label="false">
            <img class="error-img" src="@/assets/error.svg" alt="">
          </TinyRadio>
        </TinyRadioGroup>
      </div>
      <div class="action-buttons">
        <TinyButton type="primary" @click="saveQuestion">{{ t("save") }}</TinyButton>
        <TinyButton @click="cancel">{{ t("cancel") }}</TinyButton>
      </div>
    </template>
    <template v-else>
      <div class="base-tip">
        {{ t('setAnswer') }}
      </div>
      <div class="correct-answer mobile">
        <TinyRadioGroup v-model="correctAnswer">
          <TinyRadio label="true">
            <img class="correct-img" src="@/assets/correct.svg" alt="">
          </TinyRadio>
          <TinyRadio label="false">
            <img class="error-img" src="@/assets/error.svg" alt="">
          </TinyRadio>
        </TinyRadioGroup>
      </div>
    </template>
  </template>
  <!-- 预览模式 -->
  <template v-else-if="mode === 2">
    <div class="preview-mode">
      <div class="correct-answer-preview">
        <span>{{ t("answer") }}：</span>
        <TinyRadioGroup v-model="correctAnswer" disabled>
          <TinyRadio label="true">
            <img class="correct-img" src="@/assets/correct.svg" alt="">
          </TinyRadio>
          <TinyRadio label="false">
            <img class="error-img" src="@/assets/error.svg" alt="">
          </TinyRadio>
        </TinyRadioGroup>
      </div>
    </div>
  </template>

  <!-- 答题模式 -->
  <template v-else-if="mode === 3">
    <div class="answer-mode">
      <div class="user-answer">
        <div v-if="!isSubmitted">
          <template v-if="!isMobile">
            <TinyRadioGroup v-model="userAnswer">
              <TinyRadio label="true">
                <img class="correct-img" src="@/assets/correct.svg" alt="">
              </TinyRadio>
              <TinyRadio label="false">
                <img class="error-img" src="@/assets/error.svg" alt="">
              </TinyRadio>
            </TinyRadioGroup>
          </template>
          <template v-else>
            <div class="mobile-answer" :class="{'active': userAnswer === 'true'}" @click="userAnswer = 'true'">
              <img class="correct-img" src="@/assets/correct.svg" alt="">
            </div>
            <div class="mobile-answer" :class="{'active': userAnswer === 'false'}" @click="userAnswer = 'false'">
              <img class="error-img" src="@/assets/error.svg" alt="">
            </div>
          </template>
        </div>
        <div v-else class="submit-result">
          <div class="user-answer-display">
            <span>{{ t("yourAnswer") }}：</span>
            <TinyRadioGroup v-model="userAnswer" disabled>
              <TinyRadio label="true" :class="handleAnswerClass(true)">
                <img class="correct-img" src="@/assets/correct.svg" alt="">
              </TinyRadio>
              <TinyRadio label="false" :class="handleAnswerClass(false)">
                <img class="error-img" src="@/assets/error.svg" alt="">
              </TinyRadio>
            </TinyRadioGroup>
          </div>
          <div v-if="showAnswer" class="correct-answer-hint">
            <span>{{ t("correctAnswer") }}：</span>
            <TinyRadioGroup v-model="correctAnswer" disabled>
              <TinyRadio label="true" :class="handleCorrectAnswerClass(true)">
                <img class="correct-img" src="@/assets/correct.svg" alt="">
              </TinyRadio>
              <TinyRadio label="false" :class="handleCorrectAnswerClass(false)">
                <img class="error-img" src="@/assets/error.svg" alt="">
              </TinyRadio>
            </TinyRadioGroup>
          </div>
        </div>
      </div>
    </div>
  </template>
  <!-- 提示信息 -->
  <TinyAlert v-if="alertInfo.text" class="alert-warning" :type="alertInfo.type">
    <template #description>{{ alertInfo.text }}</template>
  </TinyAlert>
  </Base>
</template>

<script>
import { useT } from "@/locale/index.js";
import { defineComponent, ref, computed, watch, nextTick } from 'vue-demi';
import { TinyButton, TinyRadio, TinyRadioGroup, TinyAlert } from '@opentiny/vue'
import { renderMath } from "@/utils/mathjax.js"
import { getPlatform } from "@/utils"
import Base from '../Base.vue'
import FileList from '../../FileList/index.vue';
import { getQuestion } from "../../../model/questionFactory.js"
export default defineComponent({
  name: 'JudgeQuestion',
  components: {
    Base,
    TinyRadio,
    TinyRadioGroup,
    TinyButton,
    FileList,
    TinyAlert
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
    showAnswer: {
      type: Boolean,
      default: false
    },
    isSubmitted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel', 'change', 'updateQuestion'],
  setup(props, { emit }) {
    const isMobile = getPlatform().isMobile
    const t = useT()
    const alertInfo = ref({
      type: 'warning',
      text: ''
    })
    const showAlertHandler = (type, text) => {
      alertInfo.value = {
        type,
        text
      }
      setTimeout(() => {
        alertInfo.value.text = ''
      }, 2000)
    }
    const question = ref({})
    const updateQuestion = () => {
      // 深拷贝数据以避免直接修改
      const questionData = JSON.parse(JSON.stringify(question.value))
      // 发出保存事件
      emit('updateQuestion', questionData)
    }
    // 移动端监听题目变化
    const watchQuestionChange = () => {     
      watch(() => question.value, (newVal, oldVal) => {
        if (newVal && props.mode === 1) {
          updateQuestion()
        } 
      }, { deep: true })
    }
    if(isMobile) {
      watchQuestionChange()
    }
    const userAnswer = ref('');

    // 正确答案
    const correctAnswer = ref('');

    // 回答是否正确
    const isCorrect = computed(() => {
      return props.isSubmitted && userAnswer.value === correctAnswer.value;
    });

    // 监听原始题目变化
    watch(() => props.oriQuestion, (newVal) => {
      question.value = getQuestion(newVal);
      if (question.value.correctAnswer && question.value.correctAnswer.length > 0) {
        correctAnswer.value = question.value.correctAnswer[0];
      }
      // 初始化用户答案
      if (props.mode === 3) {
        if (question.value.record?.answer) {
          userAnswer.value = question.value.record.answer;
        } else {
          userAnswer.value = '';
        }
      }
      nextTick(() => {
        renderMath()
      })
      console.log(question.value, '--------Judge--------');
    }, { immediate: true });

    // 监听模式变化，重置用户答案
    watch(() => props.mode, (newMode) => {
      if (newMode !== 3) {
        userAnswer.value = '';
      } else {
        if (question.value.record?.answer) {
          userAnswer.value = question.value.record.answer;
        } else {
          userAnswer.value = '';
        }
      }
    });

    // 监听提交状态变化，更新用户答案
    watch(() => props.isSubmitted, (newVal) => {
      if (newVal && question.value.record?.answer) {
        userAnswer.value = question.value.record.answer;
      }
    });
    watch(() => correctAnswer.value, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        // 更新正确答案
        if (!question.value.correctAnswer) {
          question.value.correctAnswer = [];
        }
        question.value.correctAnswer[0] = correctAnswer.value;
      }
    })
    // 保存题目
    const saveQuestion = () => {
      if (props.mode !== 1) return;

      // 基本验证
      if (!question.value.title || !question.value.title.trim()) {
        showAlertHandler('warning', t('questionTitleTip1'))
        return;
      }

      if (!correctAnswer.value) {
        showAlertHandler('warning', t('inputAnswerTip4'))
        return;
      }

      // 更新正确答案
      if (!question.value.correctAnswer) {
        question.value.correctAnswer = [];
      }
      question.value.correctAnswer[0] = correctAnswer.value;
      emit('save', question.value);
    };

    const cancel = () => {
      emit('cancel');
    };
    // 监听用户答案变化，答题模式下选择答案后直接emit change事件
    watch(userAnswer, (newVal) => {
      if (props.mode === 3 && newVal) {
        // 更新记录
        if (!question.value.record) {
          question.value.record = {}
        }
        question.value.record.answer = newVal
        // emit change事件
        emit('change', question.value)
      }
    })
    // 用户答案的样式类
    const handleAnswerClass = (isTrue) => {
      if (!props.isSubmitted) return '';
      // 用户选择答案与当前传入选项一致
      const isUserChoice = (isTrue ? 'true' : 'false') == userAnswer.value;
      // 正确答案与当前传入选项一致
      const isCorrectChoice = (isTrue ? 'true' : 'false') == correctAnswer.value;
      // 只给用户选的项加样式
      if (isUserChoice) {
        return isCorrectChoice ? 'correct' : 'wrong';
      }
      return '';
    };
    // 正确答案样式
    const handleCorrectAnswerClass = (isTrue) => {
      if (!props.isSubmitted) return '';
      // 正确答案与当前传入选项一致
      const isCorrectChoice = (isTrue ? 'true' : 'false') == correctAnswer.value;
      if (isCorrectChoice) return 'correct';
      return '';
    };
    return {
      t,
      cancel,
      question,
      userAnswer,
      correctAnswer,
      isCorrect,
      saveQuestion,
      handleAnswerClass,
      handleCorrectAnswerClass,
      alertInfo,
      showAlertHandler,
      isMobile
    };
  }
});
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.title {
  margin-bottom: calc(15 * var(--question-font-size));
}
.base-tip {
  font-size: calc(14 * var(--question-font-size));
  color: #B1B1B1;
  background-color: #F5F5F5; 
  padding: calc(8 * var(--question-font-size)) 0;
}
.correct-answer {
  margin: calc(15 * var(--question-font-size)) 0;
  display: flex;
  align-items: center;
  img {
    width: calc(18 * var(--question-font-size));
  }
  &.mobile {
    .tiny-radio-group {
      flex-wrap: wrap;
      gap: calc(12 * var(--question-font-size));
      .tiny-radio {
        width: 100%;
      }
    }
  }
}

.answer-option.selected {
  font-weight: bold;
}

.option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(20 * var(--question-font-size));
  height: calc(20 * var(--question-font-size));
  margin-right: calc(6 * var(--question-font-size));
  border-radius: 50%;
}

.action-buttons {
  margin-top: calc(20 * var(--question-font-size));
}

.preview-mode,
.answer-mode {
  .question-content {
    margin: calc(15 * var(--question-font-size)) 0;
    padding: calc(10 * var(--question-font-size));
    background-color: #f9f9f9;
    border-radius: calc(4 * var(--question-font-size));
  }
}

.correct-answer-preview {
  margin: calc(12 * var(--question-font-size)) 0;
  border-radius: calc(4 * var(--question-font-size));
  font-size: calc(16 * var(--question-font-size));
  font-weight: 600;
}

.user-answer {
  margin-top: calc(15 * var(--question-font-size));
}

.submit-result {
  margin-top: calc(15 * var(--question-font-size));
  border-radius: calc(4 * var(--question-font-size));
}

.user-answer-display,
.correct-answer-hint {
  margin-bottom: calc(8 * var(--question-font-size));
}

.correct {
  color: #4caf50 !important;

  :deep(.tiny-radio__inner) {
    border-color: #69d184 !important;

    &:after {
      background-color: #69d184 !important;
    }
  }
}

.wrong {
  color: #f44336 !important;

  :deep(.tiny-radio__inner) {
    border-color: #f60000 !important;

    &:after {
      background-color: #f60000 !important;
    }
  }
}
.correct-img {
  width: calc(16 * var(--question-font-size)) !important;
}
.error-img {
  width: calc(15 * var(--question-font-size)) !important;
}
.mobile-answer {
  text-align: center;
  padding: calc(8 * var(--question-font-size));
  margin-bottom: calc(12 * var(--question-font-size));
  border-radius: calc(4 * var(--question-font-size));
  border: calc(1 * var(--question-font-size)) solid #E3E3E9;
  background: #FFF;
  box-shadow: 0 calc(2 * var(--question-font-size)) calc(4 * var(--question-font-size)) 0 rgba(216, 216, 216, 0.25);
  &.active {
    background: #F5F5F5;
  }
}
</style>
