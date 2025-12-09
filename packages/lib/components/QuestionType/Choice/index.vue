<template>
  <Base class="choice-container" :question="question" :mode="mode">
  <!-- 编辑模式 -->
  <div v-if="mode === 1" class="edit-mode">
    <div class="choice-list-base">
      <div v-for="(choice, index) in question.choices" :key="choice.id">
        <div class="choice-item">
          <span class="choice-option">{{ getOption(index) }}</span>
          <RichTextarea class="choice-input-wrap" v-if="activeIndex === index" v-model="choice.text"
            :placeholder="t('optionContent')" :list="choice.attachments" :isShowLimitTimes="false" :index="index"
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
      <tiny-radio-group class="choices" v-if="question.type === 1" v-model="radioAnswer">
        <tiny-radio class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}</span>
          <div class="choice-content">
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-radio>
      </tiny-radio-group>
      <!-- 多选题 -->
      <tiny-checkbox-group class="choices" v-if="question.type === 2" v-model="checkboxAnswer">
        <tiny-checkbox class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}</span>
          <div class="choice-content">
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-checkbox>
      </tiny-checkbox-group>
    </div>
    <div class="btn-save">
      <TinyButton type="info" @click="saveQuestion">{{ t("save") }}</TinyButton>
      <TinyButton @click="cancel">{{ t("cancel") }}</TinyButton>
    </div>
  </div>
  <!-- 预览选项 -->
  <div v-if="mode === 2" class="preview-mode">
    <div class="choice-list">
      <!-- 单选题 -->
      <tiny-radio-group class="choices" v-if="question.type === 1" v-model="radioAnswer" disabled>
        <tiny-radio class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-radio>
      </tiny-radio-group>

      <!-- 多选题 -->
      <tiny-checkbox-group class="choices" v-if="question.type === 2" v-model="checkboxAnswer" disabled>
        <tiny-checkbox class="choice-item" v-for="(choice, index) in question.choices" :key="choice.id"
          :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-checkbox>
      </tiny-checkbox-group>
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
      <tiny-radio-group class="choices" v-if="question.type === 1" v-model="radioAnswer">
        <tiny-radio class="choice-item"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-radio>
      </tiny-radio-group>
      <!-- 多选题 -->
      <tiny-checkbox-group class="choices" v-if="question.type === 2" v-model="checkboxAnswer">
        <tiny-checkbox class="choice-item"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-checkbox>
      </tiny-checkbox-group>
    </div>
    <!-- 已提交之后只能查看答案，不能再选择， v-model绑定question.record.answer -->
    <div class="choice-list" v-else>
      <!-- 单选题 -->
      <tiny-radio-group class="choices" v-if="question.type === 1" v-model="question.record.answer" :disabled="true">
        <tiny-radio class="choice-item" :class="handleAnswerClass(index)"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-radio>
      </tiny-radio-group>
      <!-- 多选题 -->
      <tiny-checkbox-group class="choices" v-if="question.type === 2" v-model="question.record.answer" :disabled="true">
        <tiny-checkbox class="choice-item" :class="handleAnswerClass(index)"
          v-for="(choice, index) in question.choices" :key="choice.id" :label="getOption(index)">
          <span class="index">{{ getOption(index) }}. </span>
          <div class="choice-content">
            <span class="rich-text" v-html="choice.text"></span>
            <FileList class="choice-file-list" mode="preview" type="block" :isPreview="true" :list="choice.attachments"
              :isShowLimitTimes="false" :showDownLoad="mode !== 3" v-if="choice.attachments?.length"></FileList>
          </div>
        </tiny-checkbox>
      </tiny-checkbox-group>
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
    // 监听oriQuestion变化，初始化问题数据
    watch(() => props.oriQuestion, (newVal) => {
      question.value = getQuestion(newVal)
      // 根据不同模式初始化答案
      if (props.mode === 3) {
        // 答题模式：使用record中的answer
        if (question.value.record?.answer) {
          if (question.value.type === 1) {
            radioAnswer.value = question.value.record.answer
          } else {
            checkboxAnswer.value = Array.isArray(question.value.record.answer) ? question.value.record.answer : question.value.record.answer?.split(',') || []
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
            radioAnswer.value = question.value.correctAnswer
          } else {
            checkboxAnswer.value = Array.isArray(question.value.correctAnswer) ? question.value.correctAnswer : question.value.correctAnswer?.split(',') || []
          }
        } else {
          // 如果没有correctAnswer，则初始化空值
          radioAnswer.value = ''
          checkboxAnswer.value = []
        }
      }
      console.log(question.value, '--------Choice--------');
    }, { immediate: true })
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
      const userAnswer = question.value.record?.answer || ''
      const correctAnswer = question.value.correctAnswer || ''

      // 标准化答案格式
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : (userAnswer?.split(',') || [])
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
    const deleteFile = (item, index) => {
      if (props.mode !== 1) return // 仅编辑模式可删除文件

      if (item && item.actionIndex !== undefined && question.value.choices) {
        const choice = question.value.choices[item.actionIndex];
        if (choice && choice.attachments && Array.isArray(choice.attachments)) {
          choice.attachments.splice(index, 1);
        }
      }
    }

    // 添加文件
    const addFile = (item, file) => {
      if (props.mode !== 1) return // 仅编辑模式可添加文件

      if (item && item.actionIndex !== undefined && question.value.choices) {
        const choice = question.value.choices[item.actionIndex];
        if (!choice.attachments) {
          choice.attachments = [];
        }
        choice.attachments.push(file);
      }
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
      deleteChoice
    }
  }
})
</script>

<style lang="scss" scoped>
.choice-container {
  width: 100%;
}

.choice-list-base {

  $height: 44px;

  .choice-item {
    margin-top: 12px;
    display: flex;
    align-items: center;

    .choice-option {
      margin-right: 20px;
      line-height: $height;
      font-weight: bold;
    }

    .choice-input-wrap {
      flex: 1;

      .choice-input {
        width: 100%;
        min-height: $height;
        border: 1px solid #e3e3e9;
        outline: none;
        font-size: 16px;

        &::placeholder {
          font-size: 14px;
          color: #969696;
          line-height: 44px;
        }
      }

      .rich-text {
        padding: 9px 10px;
      }

      .no-content-tip {
        font-size: 14px;
        color: #969696;
        margin-left: 10px;
        line-height: $height;
      }
    }

    .btn-delete {
      width: 12px;
      height: 12px;
      margin-left: 10px;
      cursor: pointer;
    }
  }

  .btn-add {
      margin: 12px 0 0 30px;
      color: #529FFF;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
}

.choices {
  width: 100%;
}

.choice-item {
  display: flex;
  margin-top: 16px;
  margin-right: 2px;
  font-size: 16px;
  line-height: 1.5;
  user-select: unset;

  .index {
    color: #444444;
    font-size: 16px;
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
    span {
      color: #69d184;
    }

    .rich-text {
      color: #69d184;
    }
  }
}
.answer-display,
.correct-answer {
  margin-top: 12px;
  font-size: 14px;

  span:first-child {
    color: #666;
    margin-right: 8px;
  }
}

.edit-mode {
  .choice-item {
    margin-right: 2px;
  }
  .choice-list {
    .choice-item {
      margin-right: 12px;
    }
  }
  .btn-save {
    margin-top: 12px;
  }
}
.preview-mode, .answer-mode {
  :deep(.tiny-radio-group) {
    display: unset;
  }
  :deep(.choice-item) {
    align-items: baseline;
    width: 100%;
    .tiny-radio__label, .tiny-checkbox__label {
      display: flex;
    }
    .choice-content {
      display: unset;
      font-size: 16px;
    }
    .tiny-radio__input {
      position: relative;
      transform: translateY(2px);
    }
  }
}
:deep(p) {
  margin: 0;
  white-space: break-spaces;
  padding: 0;
}
</style>