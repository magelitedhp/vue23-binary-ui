<template>
  <Base class="completion-question" :question="question" :mode="mode">
    <!-- 编辑模式 -->
    <template v-if="mode === 1">
      <div class="title">
        <div class="tip" v-if="index">
          {{ index + ". " + "填空题"
          }}<span class="title-tip">点击插入空格</span>
        </div>
      </div>
      <div class="correct-answer">
        <span class="tip">答案：</span
        ><span class="correct-answer-tip">( 请输入答案 )</span>
        <div v-for="(blank, index) in question.blanks" :key="blank.id || index">
          <div class="answer-item">
            <span class="answer-option">{{ getBlankLabel(index) }}</span>
            <input
              class="answer-input"
              :placeholder="'请输入答案'"
              v-model="blank.correctAnswer"
              type="text"
              @change="answerChange"
            />
            <i
              class="iconfont icon-guanbi1 btn-delete"
              @click="deleteBlank(blank, index)"
            ></i>
          </div>
        </div>
        <div class="can-exchange">
          <input type="checkbox" v-model="question.allowExchange">
          <span>答案可互换顺序</span>
        </div>
        
        <div class="action-buttons">
          <button class="btn-save" @click="saveQuestion">保存题目</button>
        </div>
      </div>
    </template>
    <!-- 预览模式 -->
    <template v-else-if="mode === 2">
      <div class="preview-mode">
        <div class="title">
          <div class="tip" v-if="index">
            {{ index + ". " + "填空题" }}
          </div>
        </div>
        <div class="question-content" v-html="question.title"></div>
        <FileList :list="question.link"></FileList>
        
        <div class="correct-answer-preview">
          <h3>正确答案：</h3>
          <div v-for="(blank, index) in question.blanks" :key="blank.id || index">
            <div class="answer-item">
              <span class="answer-option">{{ getBlankLabel(index) }}：</span>
              <span class="answer-value">{{ blank.correctAnswer || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- 答题模式 -->
    <template v-else-if="mode === 3">
      <div class="answer-mode">
        <div class="title">
          <div class="tip" v-if="index">
            {{ index + ". " + "填空题" }}
          </div>
        </div>
        <div class="question-content" v-html="question.title"></div>
        <FileList :list="question.link"></FileList>
        
        <div class="user-answer">
          <h3>请作答：</h3>
          <div v-for="(blank, index) in question.blanks" :key="blank.id || index">
            <div class="answer-item" :class="{ 'correct': isSubmitted && checkAnswer(blank.correctAnswer, userAnswers[index]), 'wrong': isSubmitted && !checkAnswer(blank.correctAnswer, userAnswers[index]) }">
              <span class="answer-option">{{ getBlankLabel(index) }}：</span>
              <input
                v-if="!isSubmitted"
                class="answer-input"
                :placeholder="'请输入答案'"
                v-model="userAnswers[index]"
                type="text"
              />
              <span v-else class="answer-value user-answer-value">{{ userAnswers[index] || '-' }}</span>
              <span v-if="isSubmitted && !checkAnswer(blank.correctAnswer, userAnswers[index])" class="correct-answer-hint">正确答案：{{ blank.correctAnswer }}</span>
            </div>
          </div>
          
          <button v-if="!isSubmitted" class="btn-submit" @click="submitAnswer">提交答案</button>
          <div v-if="isSubmitted" class="submit-result">
            <span :class="{ 'success': allAnswersCorrect, 'error': !allAnswersCorrect }">
              {{ allAnswersCorrect ? '恭喜全部答对！' : '答题结果已显示，请查看对错。' }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </Base>
</template>

<script>
import { defineComponent, ref, reactive, computed, watch } from 'vue-demi';
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
    index: {
      type: Number,
      default: 0
    },
  },
  emits: ['save', 'submit'],
  setup(props, { emit }) {
    const question = ref({})
    const isSubmitted = ref(false);
    const userAnswers = ref([]);

    // 初始化用户答案数组
    const initUserAnswers = () => {
      userAnswers.value.splice(0, userAnswers.value.length);
      if (question.value.blanks && Array.isArray(question.value.blanks)) {
        question.value.blanks.forEach(() => {
          userAnswers.value.push('');
        });
      }
    };

    // 监听题目变化，重新初始化答案
    watch(() => question.value.blanks, () => {
      initUserAnswers();
    }, { deep: true });

    // 监听原始题目变化
    watch(() => props.oriQuestion, (newVal) => {
      question.value = getQuestion(newVal);
      console.log(question.value, newVal, '--------Completion--------');
    }, { immediate: true });

    // 监听模式变化，重置提交状态
    watch(() => props.mode, (newMode) => {
      if (newMode !== 3) {
        isSubmitted.value = false;
      }
    });

    // 生成空格标签 (A, B, C...)
    const getBlankLabel = (index) => {
      return String.fromCharCode(65 + index); // A, B, C...
    };

    // 检查答案是否正确
    const checkAnswer = (correct, user) => {
      if (!question.value.allowExchange) {
        return correct?.trim().toLowerCase() === user?.trim().toLowerCase();
      } else {
        // 答案可互换时的逻辑
        const correctAnswers = question.value.correctAnswer || [];
        return correctAnswers.some(ans => ans?.trim().toLowerCase() === user?.trim().toLowerCase());
      }
    };

    // 是否所有答案都正确
    const allAnswersCorrect = computed(() => {
      if (!isSubmitted.value || !question.value.blanks) return false;
      
      return question.value.blanks.every((blank, index) => 
        checkAnswer(blank.correctAnswer, userAnswers.value[index])
      );
    });

    // 标题内容变化处理
    const handleTitleChange = (newValue) => {
      if (props.mode !== 1) return;
      
      // 处理空格
      titleListener(
        newValue,
        /<span class="q-space" contenteditable="false" data-index="(.*?)"/g,
        (i, strIndex) => {
          if (!question.value.blanks) question.value.blanks = [];
          const index = question.value.blanks.findIndex(
            (it) => it.blankIndex == strIndex
          );
          if (index === -1) {
            // 创建新空格
            const newBlank = {
              id: Date.now(),
              blankIndex: strIndex,
              correctAnswer: ''
            };
            question.value.blanks.push(newBlank);
             userAnswers.value.splice(i, 0, '');
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
    };

    // 监听标题变化
    watch(() => question.value.title, handleTitleChange, { immediate: true });

    // 删除空格
    const deleteBlank = (blank, index) => {
      if (props.mode !== 1) return;
      
      const blankIndex = blank.blankIndex;
      const regx = new RegExp(
        `((&nbsp;)|\\s){0,1}<span class=\"q-space\" contenteditable=\"false\" data-index=\"${blankIndex}\">\\(&nbsp;\\)<\/span>((&nbsp;)|\\s){0,1}`,
        "g"
      );
      question.value.title = question.value.title.replace(regx, "");
    };

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
      
      emit('save', question.value);
    };

    // 提交答案
    const submitAnswer = () => {
      if (props.mode !== 3) return;
      
      // 检查是否所有空格都有答案
      let hasEmptyAnswer = false;
      for (let i = 0; i < userAnswers.value.length; i++) {
        if (!userAnswers.value[i] || userAnswers.value[i].trim() === '') {
          hasEmptyAnswer = true;
          break;
        }
      }
      
      if (hasEmptyAnswer) {
        console.warn('请填写所有答案后再提交');
        return;
      }
      
      isSubmitted.value = true;
      emit('submit', { question: question.value, answers: [...userAnswers.value], allCorrect: allAnswersCorrect.value });
    };

    // 初始化
    initUserAnswers();

    return {
      t,
      question,
      isSubmitted,
      userAnswers,
      allAnswersCorrect,
      saveQuestion,
      submitAnswer,
      getBlankLabel,
      checkAnswer,
      answerChange,
      deleteBlank,
      handleTitleChange
    };
  }
});
</script>

<style lang="scss" scoped>
$height: 44px;
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
  line-height: $height;
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
  margin-left: 12px;
  font-size: 12px;
  line-height: $height;
  color: #606266;
  cursor: pointer;

  &:hover {
    color: #c1c1c1;
  }
}

.can-exchange {
  margin: 14px 0;
  display: block;
}
</style>
