<template>
  <Base class="choice-container" :question="question" :mode="mode">
  <!-- 编辑模式 -->
  <div v-if="mode === 1" class="edit-mode">
    <div class="choice-list-base">
      <div v-for="(choice, index) in question.choices" :key="choice.id">
        <div class="choice-item">
          <span class="choice-option">{{ getOption(index) }}</span>
          <RichTextarea class="choice-input-wrap" v-if="activeIndex === index" v-model="choice.text"
            :placeholder="t('optionContent')" :list="choice.attachments" :isShowLimitTimes="false" :actionIndex="index"
            :placeholderText="t('optionContent')" @addFile="addFile"
            @deleteFile="deleteFile"></RichTextarea>
          <div class="choice-input-wrap" v-else>
            <input v-if="!needRichText" class="choice-input" v-model="choice.text" type="text"
              :placeholder="t('optionContent')" />
            <div class="choice-input" v-else @click="activeRichText(index)">
              <span class="no-content-tip"
                v-if="!(choice.text || (choice.attachments && choice.attachments.length > 0))">{{ t("optionContent")
                }}</span>
              <div class="rich-text" v-html="choice.text" v-if="choice.text"></div>
              <FileList ref="fileList" mode="edit" type="block" :isPreview="true" :list="choice.attachments || []"
                :isShowLimitTimes="false" :actionIndex="index" @deleteFile="deleteFile"></FileList>
            </div>
          </div>
          <img v-if="index > 1" class="btn-delete" src="@/assets/close.png" alt="" @click="deleteChoice(choice, index)">
        </div>
      </div>
      <div class="btn-add" @click="addChoice">
        <img src="@/assets/add.svg" alt="">{{ t("addOption") }}
      </div>
    </div>
    <div class="choice-list">
      <div class="answer-display">
        <span>{{ t('answer') }}：</span>
        <span>{{ formatAnswer(question.correctAnswer) }}</span>
      </div>
      <!-- 单选题 -->
      <TinyRadioGroup class="choices" v-if="question.type === 1" v-model="radioAnswer">
        <TinyRadio class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}</span>
        </TinyRadio>
      </TinyRadioGroup>
      <!-- 多选题 -->
      <TinyCheckboxGroup class="choices" v-if="question.type === 2" v-model="checkboxAnswer">
        <TinyCheckbox class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}</span>
        </TinyCheckbox>
      </TinyCheckboxGroup>
    </div>
    <div class="btn-save">
      <TinyButton type="primary" @click="saveQuestion">{{ t("save") }}</TinyButton>
      <TinyButton @click="cancel">{{ t("cancel") }}</TinyButton>
    </div>
  </div>
  <!-- 预览选项 -->
  <div v-if="mode === 2" class="preview-mode">
    <div class="choice-list">
      <!-- 单选题 -->
      <TinyRadioGroup class="choices" v-if="question.type === 1" v-model="radioAnswer" disabled>
        <TinyRadio class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" v-if="choice.attachments?.length"></FileList>
          </div>
        </TinyRadio>
      </TinyRadioGroup>

      <!-- 多选题 -->
      <TinyCheckboxGroup class="choices" v-if="question.type === 2" v-model="checkboxAnswer" disabled>
        <TinyCheckbox class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" v-if="choice.attachments?.length"></FileList>
          </div>
        </TinyCheckbox>
      </TinyCheckboxGroup>
    </div>

    <!-- 预览模式显示答案 -->
    <div class="answer-display">
      <span>{{ t('answer') }}：</span>
      <span>{{ formatAnswer(question.correctAnswer) }}</span>
    </div>
  </div>
  <!-- 答题模式 -->
  <div v-if="mode === 3" class="answer-mode">
    <!-- 未提交的时候可以自由选择答案 -->
    <div class="choice-list" v-if="!isSubmitted">
      <!-- 单选题 -->
      <TinyRadioGroup class="choices" v-if="question.type === 1" v-model="radioAnswer">
        <TinyRadio class="choice-item"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </TinyRadio>
      </TinyRadioGroup>
      <!-- 多选题 -->
      <TinyCheckboxGroup class="choices" v-if="question.type === 2" v-model="checkboxAnswer">
        <TinyCheckbox class="choice-item"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </TinyCheckbox>
      </TinyCheckboxGroup>
    </div>
    <!-- 已提交之后只能查看答案，不能再选择， v-model绑定question.record.answer -->
    <div class="choice-list" v-else>
      <!-- 单选题 -->
      <TinyRadioGroup class="choices" v-if="question.type === 1" v-model="userAnswer" :disabled="true">
        <TinyRadio class="choice-item" :class="handleAnswerClass(index)"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </TinyRadio>
      </TinyRadioGroup>
      <!-- 多选题 -->
      <TinyCheckboxGroup class="choices" v-if="question.type === 2" v-model="userAnswer" :disabled="true">
        <TinyCheckbox class="choice-item" :class="handleAnswerClass(index)"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </TinyCheckbox>
      </TinyCheckboxGroup>
    </div>  

    <!-- 提交后显示答案 -->
    <div v-if="isSubmitted && showAnswer">
      <div class="answer-display">
        <span>{{ t('stuAnswer') }}：</span>
        <span>{{ formatAnswer(question.record?.answer) }}</span>
      </div>
      <div class="correct-answer">
        <span>{{ t('correctAnswer') }}：</span>
        <span>{{ formatAnswer(question.correctAnswer) }}</span>
      </div>
    </div>
  </div>
  </Base>
</template>

<script>
import { useT } from "@/locale/index.js";
import { defineComponent, ref, watch } from 'vue-demi'
import Base from '../Base.vue'
import { TinyButton, TinyRadioGroup, TinyRadio, TinyCheckboxGroup, TinyCheckbox } from '@opentiny/vue'
import FileList from '@/components/FileList/index.vue'
import { getQuestion } from "@/model/questionFactory.js"
import RichTextarea from '@/components/RichTextarea/index.vue'
export default defineComponent({
  name: 'Choice',
  components: {
    TinyButton,
    TinyRadioGroup,
    TinyRadio,
    TinyCheckboxGroup,
    TinyCheckbox,
    FileList,
    Base,
    RichTextarea
  },
  props: {
    oriQuestion: {
      type: Object,
      required: true,
      default: () => ({
        type: 1, // 1:单选 2:多选
        choices: [],
        correctAnswer: null,
        record: {
          answer: null
        }
      })
    },
    mode: {
      type: Number,
      default: 1, // 1-编辑 2-预览 3-学生答题
      validator: (val) => [1, 2, 3].includes(val)
    },
    needRichText: {
      type: Boolean,
      default: true
    },
    isSubmitted: {
      type: Boolean,
      default: false
    },
    showAnswer: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel', 'change'],
  setup(props, { emit }) {
    const t = useT()
    const activeIndex = ref(null)
    const question = ref({})
    // 初始化答案
    const radioAnswer = ref('')
    const checkboxAnswer = ref([])
    // 答题模式时更新userAnswer
    const userAnswer = ref()
    const updateSelectAnswer = () => {
      if (props.mode === 3) {
        // 答题模式：使用record中的answer
        if (question.value.record?.answer) {
          if (question.value.type === 1) {
            radioAnswer.value = question.value.record.answer
            userAnswer.value = question.value.record.answer
          } else {
            checkboxAnswer.value = Array.isArray(question.value.record.answer) ? question.value.record.answer : question.value.record.answer?.split(',') || []
            userAnswer.value = Array.isArray(question.value.record.answer) ? question.value.record.answer : question.value.record.answer?.split(',') || []
          }
        } else {
          // 如果没有record.answer，则初始化空值
          radioAnswer.value = ''
          checkboxAnswer.value = []
        }
      } else {
        // 其他模式：使用correctAnswer
        if (question.value.correctAnswer) {
          if (question.value.type === 1) {
            radioAnswer.value = question.value.correctAnswer[0]
          } else {
            checkboxAnswer.value = Array.isArray(question.value.correctAnswer) ? question.value.correctAnswer : question.value.correctAnswer?.split(',') || []
          }
        } else {
          // 如果没有correctAnswer，则初始化空值
          radioAnswer.value = ''
          checkboxAnswer.value = []
        }
      }
    }
    // 监听oriQuestion变化，初始化问题数据
    watch(() => props.oriQuestion, (newVal) => {
      question.value = getQuestion(newVal)
      // 根据不同模式初始化答案
      updateSelectAnswer()
      console.log(question.value, '--------Choice--------', newVal);
    }, { immediate: true })
    watch([() => props.mode, () => props.isSubmitted], () => {
      updateSelectAnswer()
    })
    // 获取选项字母(A,B,C,D...)
    const getOption = (index) => {
      return String.fromCharCode(65 + index)
    }
    // 格式化答案显示
    const formatAnswer = (answer) => {
      if (!answer) return '-'
      return Array.isArray(answer) ? answer.join(',') : answer
    }
    // 处理答案样式类
    const handleAnswerClass = (index) => {
      // 答题模式下提交后才显示对错样式
      if (props.mode !== 3 || !props.isSubmitted) return ''
      const currentOption = getOption(index)
      const userAnswerValue = question.value.record?.answer || ''
      const correctAnswer = question.value.correctAnswer || ''

      // 标准化答案格式
      const userAnswers = Array.isArray(userAnswerValue) ? userAnswerValue : (userAnswerValue?.split(',') || [])
      const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : (correctAnswer?.split(',') || [])

      const isUserSelected = userAnswers.includes(currentOption)
      const isCorrect = correctAnswers.includes(currentOption)
      // 显示答案时的样式逻辑
      if (isCorrect && isUserSelected) {
        return 'correct'
      } else if (!isCorrect && isUserSelected) {
        return 'wrong'
      } else if (isCorrect && !isUserSelected) {
        return 'missed'
      }
      return ''
    }

    // 添加选项
    const addChoice = () => {
      if (props.mode !== 1) return // 仅编辑模式可添加选项

      if (question.value.choices.length < 20) {
        createChoice();
      } else {
        console.warn(t('optionLimit') || `选项数量已达上限(20个)`);
      }
    }

    // 创建选项
    const createChoice = () => {
      if (!question.value.choices) {
        question.value.choices = [];
      }
      question.value.choices.push({
        id: Date.now(),
        text: '',
        attachments: []
      });
    }

    // 激活富文本编辑
    const activeRichText = (index) => {
      if (props.mode !== 1) return // 仅编辑模式可编辑

      if (props.needRichText) {
        activeIndex.value = index
      }
    }

    // 删除文件
    const deleteFile = (index, actionIndex) => {
      if (props.mode !== 1) return // 仅编辑模式可删除文件
      question.value.choices[actionIndex].attachments.splice(index, 1);
    }
    // 添加文件
    const addFile = (file, actionIndex) => {
      console.log(file, actionIndex, question.value,'question.valuequestion.value');
      if (props.mode !== 1) return // 仅编辑模式可添加文件
      question.value.choices[actionIndex].attachments.push(file);
    }

    // 删除选项
    const deleteChoice = (choice, index) => {
      if (props.mode !== 1) return // 仅编辑模式可删除选项
      if (question.value.choices && Array.isArray(question.value.choices) && question.value.choices.length > 2) {
        question.value.choices.splice(index, 1);

        // 重新设置答案
        if (question.value.correctAnswer) {
          const answers = Array.isArray(question.value.correctAnswer)
            ? question.value.correctAnswer
            : question.value.correctAnswer.split(',')

          const newAnswers = answers.filter(ans => {
            const ansIndex = ans.charCodeAt(0) - 65
            return ansIndex !== index && ansIndex < question.value.choices.length
          })

          question.value.correctAnswer = question.value.type === 1 ? newAnswers[0] || '' : newAnswers
        }
      } else {
        console.warn(t('atLeastTwo') || '至少需要两个选项');
      }
    }

    // 保存问题数据（编辑模式）
    const saveQuestion = () => {
      if (props.mode !== 1) return

      // 验证是否有正确答案
      if (!question.value.correctAnswer) {
        console.warn(t('pleaseSetCorrectAnswer') || '请设置正确答案');
        return
      }
      // 深拷贝数据以避免直接修改
      const questionData = JSON.parse(JSON.stringify(question.value))
      // 发出保存事件
      emit('save', questionData)
    }
    const cancel = () => {
      emit('cancel')
    }
    // 监听单选答案变化
    watch(radioAnswer, (newVal) => {
      if (question.value.type === 1) {
        if (props.mode === 1) {
          // 编辑模式下设置正确答案
          question.value.correctAnswer = newVal
        } else if (props.mode === 3) {
          // 答题模式下设置用户答案
          if (!question.value.record) {
            question.value.record = {}
          }
          question.value.record.answer = newVal
          // 选择答案后emit change事件
          emit('change', question.value)
        }
      }
    })
    // 监听多选答案变化
    watch(checkboxAnswer, (newVal) => {
      if (question.value.type === 2) {
        if (props.mode === 1) {
          // 编辑模式下设置正确答案
          question.value.correctAnswer = newVal
        } else if (props.mode === 3 && !props.isSubmitted) {
          // 答题模式下设置用户答案
          if (!question.value.record) {
            question.value.record = {}
          }
          question.value.record.answer = newVal
          // 选择答案后emit change事件
          emit('change', question.value)
        }
      }
    })
    return {
      t,
      question,
      radioAnswer,
      checkboxAnswer,
      getOption,
      formatAnswer,
      handleAnswerClass,
      addChoice,
      saveQuestion,
      cancel,
      createChoice,
      activeIndex,
      activeRichText,
      deleteFile,
      addFile,
      deleteChoice,
      userAnswer
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.choice-container {
  width: 100%;
}

.choice-list-base {

  $height: calc(44 * var(--question-font-size));

  .choice-item {
    margin-top: calc(12 * var(--question-font-size));
    display: flex;
    .choice-option {
      margin-right: calc(20 * var(--question-font-size));
      line-height: $height;
      font-weight: bold;
    }

    .choice-input-wrap {
      flex: 1;

      .choice-input {
        width: 100%;
        min-height: $height;
        border: calc(1 * var(--question-font-size)) solid #e3e3e9;
        outline: none;
        font-size: calc(16 * var(--question-font-size));

        &::placeholder {
          font-size: calc(14 * var(--question-font-size));
          color: #969696;
          line-height: calc(44 * var(--question-font-size));
        }
      }

      .rich-text {
        padding: calc(9 * var(--question-font-size)) calc(10 * var(--question-font-size));
      }

      .no-content-tip {
        font-size: calc(14 * var(--question-font-size));
        color: #969696;
        margin-left: calc(10 * var(--question-font-size));
        line-height: $height;
      }
    }

    .btn-delete {
      width: calc(12 * var(--question-font-size));
      height: calc(12 * var(--question-font-size));
      margin-left: calc(10 * var(--question-font-size));
      cursor: pointer;
      margin-left: calc(10 * var(--question-font-size));
      cursor: pointer;
      align-self: center;
    }
  }

  .btn-add {
      margin: calc(12 * var(--question-font-size)) 0 0 calc(30 * var(--question-font-size));
      color: #529FFF;
      display: flex;
      align-items: center;
      gap: calc(4 * var(--question-font-size));
      cursor: pointer;
      img {
        width: calc(18 * var(--question-font-size));
      }
    }
}

.choices {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(12 * var(--question-font-size));
  .choice-item {
    display: flex;
    margin-right: calc(2 * var(--question-font-size));
    font-size: calc(16 * var(--question-font-size));
    line-height: 1.5;
    user-select: unset;

    .index {
      color: #444444;
      font-size: calc(16 * var(--question-font-size));
      line-height: 1.5;
    }

    .choice-content {
      display: inline-block;
      line-height: 1.5;
      width: 100%;
      vertical-align: top;
    }

    &.wrong {
      color: #f60000;
      :deep(.tiny-radio__inner) {
        border-color: #f60000;
        &:after {
          background-color: #f60000;
        }
      }
      :deep(.tiny-checkbox__inner) {
        .icon-checked-sur path:first-child {
          fill: #f60000;
        }
      }
      span {
        color: #f60000;
      }

      .rich-text {
        color: #f60000;
      }
    }

    &.correct {
      color: #69d184;
      :deep(.tiny-radio__inner) {
        border-color: #69d184;
        &:after {
          background-color: #69d184;
        }
      }
      :deep(.tiny-checkbox__inner) {
        .icon-checked-sur path:first-child {
          fill: #69d184;
        }
      }
      span {
        color: #69d184;
      }

      .rich-text {
        color: #69d184;
      }
    }
  }
}

.answer-display,
.correct-answer {
  margin: calc(12 * var(--question-font-size)) 0;
  font-size: calc(16 * var(--question-font-size));
  font-weight: 600;
}

.edit-mode {
  .choices {
    display: flex;
    flex-direction: row;
    gap: 0;
  }
  .choice-item {
    margin-right: calc(2 * var(--question-font-size));
  }
  .choice-list {
    .choice-item {
      margin-right: calc(12 * var(--question-font-size));
    }
  }
  .btn-save {
    margin-top: calc(12 * var(--question-font-size));
  }
}
.preview-mode, .answer-mode {
  :deep(.choice-item) {
    align-items: baseline;
    width: 100%;
    .tiny-radio__label, .tiny-checkbox__label {
      display: flex;
    }
    .choice-content {
      display: unset;
      font-size: calc(16 * var(--question-font-size));
    }
    .tiny-radio__input {
      position: relative;
      transform: translateY(calc(2 * var(--question-font-size)));
    }
  }
}
:deep(p) {
  margin: 0;
  white-space: break-spaces;
  padding: 0;
}
</style>