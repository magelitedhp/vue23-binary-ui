<template>
    <div>
        <h1>当前模式: {{ modeObj[mode] }}</h1>
        <MyTinyButton @click="changeMode(1)">切换到编辑模式</MyTinyButton>
        <MyTinyButton @click="changeMode(2)">切换到预览模式</MyTinyButton>
        <MyTinyButton @click="changeMode(3)">切换到答题模式</MyTinyButton>
        <br>
        <br>
        <div>
            <MyTinyButton type="primary" @click="clearQuestion">清空题目</MyTinyButton>
        </div>
        <div v-for="item in 4" :key="item" style="margin: 10px 0; cursor: pointer;">
            <div @click="addQuestion(item)">{{ '添加' + getQuestionTypeName(item) + '题型' }}</div>
        </div>
        <component v-if="Object.keys(question).length > 0" :is="currentComponent" :mode="mode" :oriQuestion="question"></component>
    </div>
</template>

<script setup>
// import { Choice, Judge, Completion } from 'ul-question-test-ui/vue3';
import { Choice, Judge, Completion } from 'my-vue3-ui'
import { ref, computed } from "vue"
import { Button as MyTinyButton } from '@opentiny/vue'

// 状态定义
const question = ref({})
const mode = ref(1)
const questionType = ref(1) // 1: 单选, 2: 多选, 3: 填空, 4: 判断

// 模式映射
const modeObj = {
    1: '编辑模式',
    2: '预览模式',
    3: '答题模式'
}

// 组件映射
const components = {
    1: Choice,
    2: Choice,
    3: Completion,
    4: Judge
}

// 当前组件计算属性
const currentComponent = computed(() => {
    return components[questionType.value] || Choice
})

// 切换模式
const changeMode = (val) => {
    mode.value = val
}

// 清空题目
const clearQuestion = () => {
    question.value = {}
}
// 获取题型名称
const getQuestionTypeName = (type) => {
    const typeNames = {
        1: '单选',
        2: '多选',
        3: '判断',
        4: '填空'
    }
    return typeNames[type] || '未知'
}

// 添加题目
const addQuestion = (type) => {
    questionType.value = type // 设置题型
    
    switch (type) {
        case 1:
            // 简单单选题
            question.value = {
                type,
                title: '213131231',
                questionId: Math.floor(Math.random() * 1e9),
            }
            break;
        case 2:
            getQuestion2();
            break;
        case 3:
            getQuestion3();
            break;
        case 4:
            getQuestion4();
            break;
        default:
            question.value = {};
    }
}
const getQuestion1 = () => {
  question.value = {
    questionid: 19673995,
    oldQuestionId: null,
    title: "<p>\\(= = \\div \\times \\times \\times \\)</p>优学院是一个集( )、( )、( )、( )的平台<p><img src=\"https://obscloud.ulearning.cn/resources/web/17653341516826949.png\" /></p>",
    type: 1,
    iscontent: 1,
    hardlevel: 3,
    parentid: 0,
    score: 1,
    correctreply: "",
    correctAnswer: ["B"],
    lisCount: null,
    createtime: null,
    updatetime: 1765344324000,
    remark: null,
    userid: 10792509,
    orgid: null,
    aspid: null,
    desc1: "",
    desc4: null,
    isShare: 0,
    theLatest: null,
    blankOrder: 0,
    item: [
      {
        choiceItemID: 47315155,
        questionID: 19673995,
        title: "<p>123123<img src=\"https://obscloud.ulearning.cn/resources/web/17653442934763743.png\" /></p>",
        link: "https://obscloud.ulearning.cn/resources/web/17653443214724001.mp4"
      },
      {
        choiceItemID: 47315156,
        questionID: 19673995,
        title: "<p>123123</p>",
        link: ""
      },
      {
        choiceItemID: 47315157,
        questionID: 19673995,
        title: "<p>122313</p>",
        link: ""
      },
      {
        choiceItemID: 47315158,
        questionID: 19673995,
        title: "<p>12312132</p>",
        link: ""
      }
    ],
    subQuestions: null,
    link: [
      {
        fileUrl: "https://obscloud.ulearning.cn/resources/web/17653341688477768.mp3",
        lisCount: null,
        fileName: "16994360136574566.mp3",
        fileSize: 0,
        srt: null,
        avatar: null
      },
      {
        fileUrl: "https://obscloud.ulearning.cn/resources/web/17653341742454581.mp4",
        lisCount: null,
        fileName: "17639736759711778.mp4",
        fileSize: 0,
        srt: null,
        avatar: null
      }
    ],
    analyLinkList: null,
    answerLinkList: null,
    demoLinkList: null,
    formulaVar: null,
    parentFolders: [],
    creater: "测试教师",
    orgName: "文华在线测试部门",
    shareArray: [],
    isUsed: null,
    autoscore: 0,
    linkOptionList: null,
    tags: null,
    tagIds: null,
    compareInfo: null,
    originalQuestionId: null,
    isShareFolder: 0,
    isShareRootDir: null,
    shareFolderUse: null,
    shareFolderAllowCopy: null,
    shareFolderRootDirId: null,
    knowledgeDTOS: null,
    source: null
  };
  // question.value.mode = 3
  // question.value = {
  //     id: null,
  //     type: 1,
  //     title: "<p>修改答案一次这是单选标题 答案A</p>",
  //     score: 1,
  //     correctAnswer: [
  //         "B"
  //     ],
  //     choices: [
  //         {
  //             choiceItemId: 217,
  //             questionId: 77,
  //             link: "",
  //             title: "选项A的内容"
  //         },
  //         {
  //             choiceItemId: 218,
  //             questionId: 77,
  //             link: "",
  //             title: "选项B的内容"
  //         },
  //         {
  //             choiceItemId: 219,
  //             questionId: 77,
  //             link: "",
  //             title: "选项C的内容"
  //         },
  //         {
  //             choiceItemId: 220,
  //             questionId: 77,
  //             link: "",
  //             title: "选项D的内容"
  //         }
  //     ],
  //     item: [
  //         {
  //             choiceItemId: 217,
  //             questionId: 77,
  //             link: "",
  //             title: "选项A的内容"
  //         },
  //         {
  //             choiceItemId: 218,
  //             questionId: 77,
  //             link: "",
  //             title: "选项B的内容"
  //         },
  //         {
  //             choiceItemId: 219,
  //             questionId: 77,
  //             link: "",
  //             title: "选项C的内容"
  //         },
  //         {
  //             choiceItemId: 220,
  //             questionId: 77,
  //             link: "",
  //             title: "选项D的内容"
  //         }
  //     ],
  //     record: {
  //       answer: "A"
  //     },
  //     mode: 2
  // }
  // console.log(question.value, '--------Choice--------');
};

const getQuestion2 = () => {
  question.value = {
    questionid: 12496524,
    oldQuestionId: null,
    title: "1321312312",
    // title: `<span class="q-space" contenteditable="false">(&nbsp;)</span><p>123131有附件的多选题呵呵呵呵呵呵呵<img src=\"https://leicloud.ulearning.cn/resources/7449024/202509281042424985.jpg\" /></p>`,
    type: 2,
    iscontent: 1,
    hardlevel: 3,
    parentid: 0,
    score: 1,
    correctreply: "",
    correctAnswer: ["A", "B"],
    lisCount: null,
    createtime: null,
    updatetime: 1764209055000,
    remark: null,
    userid: 7449024,
    orgid: null,
    aspid: null,
    record: {
      answer: ["A", "D"]
    }
  };
};

const getQuestion3 = () => {
  question.value = {
    allowExchange: 0,
    questionid: 12497547,
    oldQuestionId: null,
    title: "<p>优学院是一个集(&nbsp;)、(&nbsp;)、(&nbsp;)、(&nbsp;)的平台</p>",
    type: 3,
    iscontent: 1,
    hardlevel: 3,
    parentid: 0,
    score: 1,
    correctreply: "",
    correctAnswer: ["AI//ai", "智能化", "酌情给分", "酌情给分1"],
    lisCount: null,
    createtime: null,
    updatetime: 1762758218000,
    remark: null,
    userid: 6546517,
    orgid: null,
    aspid: null,
    desc1: "",
    desc4: null,
    isShare: 0,
    theLatest: null,
    blankOrder: 0,
    item: null,
    subQuestions: null,
    link: null,
    analyLinkList: null,
    answerLinkList: null,
    demoLinkList: null,
    formulaVar: null,
    parentFolders: [],
    creater: "魏艺宁老师",
    orgName: "文华在线",
    shareArray: [],
    isUsed: null,
    autoscore: null,
    linkOptionList: null,
    tags: null,
    tagIds: null,
    compareInfo: null,
    originalQuestionId: null,
    isShareFolder: 0,
    isShareRootDir: null,
    shareFolderUse: null,
    shareFolderAllowCopy: null,
    shareFolderRootDirId: null,
    knowledgeDTOS: null,
    source: null,
    record: {
      answer: ["AI", "智能化", "酌情给分21312213", "酌情给分21312312211"]
    },
    mode: 3
  };
};

const getQuestion4 = () => {
  question.value = {
    type: 4,
    questionId: 8,
    record: {
      answer: "true"
    }
  };
};
</script>
<style></style>