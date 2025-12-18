<template>
  <div class="container">
    <h1>mode: {{ modeObj[mode] }}</h1>
    <MyTinyButton @handleClick1="changeMode(1)">change to edit mode</MyTinyButton>
    <MyTinyButton @handleClick1="changeMode(2)">change to preview mode</MyTinyButton>
    <MyTinyButton @handleClick1="changeMode(3)">change to answer mode</MyTinyButton>
    <MyTinyButton @handleClick1="isSubmitted = !isSubmitted">change isSubmitted {{ isSubmitted }}</MyTinyButton>
    <!-- <h1>Vue3 沙盒</h1> -->
    <!-- <MyButton @click="say">点我</MyButton> -->
    <!-- <MyTinyButton type="primary" @handleClick1="say">点我</MyTinyButton> -->
    <br>
    <br>
    <!-- <div>
      <MyTinyButton type="primary" @handleClick1="getQuestion1">编辑单选题</MyTinyButton>
     </div>
    <div>
      <MyTinyButton type="primary" @handleClick1="getQuestion2">编辑多选</MyTinyButton>
     </div>
    <div>
      <MyTinyButton type="primary" @handleClick1="getQuestion3">编辑判断</MyTinyButton>
     </div>
    <div>
      <MyTinyButton type="primary" @handleClick1="getQuestion4">编辑填空</MyTinyButton>
     </div> -->
    <div>
      <MyTinyButton type="primary" @handleClick1="question = {}">清空题目</MyTinyButton>
     </div>
     <div v-for="item in 4">
      <div @click="addQuestion(item)">{{ '添加' + item + '题型'}}</div>
     </div>
    <component :is="componentId" :mode="question.mode || mode" :oriQuestion="question" :isSubmitted="isSubmitted" @save="save" @change="answerChange"></component>
  </div>
</template>

<script>
// import { Choice, Judge, Completion } from 'ul-question-test-ui';
import { Choice, Judge, Completion } from 'my-vue3-ui';

export default {
  name: 'App',
  components: {
    Choice,
    Judge,
    Completion
  },
  data() {
    return {
      question: {},
      mode: 1,
      modeObj: {
        1: 'edit 1',
        2: 'previe 2',
        3: 'answer 3'
      },
      componentId: '', // 动态组件ID
      isSubmitted: false
    }
  },
  watch: {
    // 监听question.type变化，动态更新组件
    'question.type': {
      handler(newType) {
        switch(newType) {
          case 1:
          case 2:
            this.componentId = Choice;
            break;
          case 3:
            this.componentId = Completion;
            break;
          case 4:
            this.componentId = Judge;
            break;
          default:
            this.componentId = '';
        }
      },
      immediate: true
    }
  },
  methods: {
    answerChange(val) {
      console.log(val,'valval');
    },
    save(val) {
      console.log(val,'valval');
    },
    say() {
      alert('Hello Vue3')
    },
    changeMode(mode) {
      this.mode = mode
    },
    getQuestion1() {
      this.question = {
  "questionid": 19673995,
  "oldQuestionId": null,
  "title": "<p>\\(= = \\div \\times \\times \\times \\)</p>优学院是一个集( )、( )、( )、( )的平台<p><img src=\"https://obscloud.ulearning.cn/resources/web/17653341516826949.png\" /></p>",
  "type": 1,
  "iscontent": 1,
  "hardlevel": 3,
  "parentid": 0,
  "score": 1,
  "correctreply": "",
  "correctAnswer": [
    "B"
  ],
  "lisCount": null,
  "createtime": null,
  "updatetime": 1765344324000,
  "remark": null,
  "userid": 10792509,
  "orgid": null,
  "aspid": null,
  "desc1": "",
  "desc4": null,
  "isShare": 0,
  "theLatest": null,
  "blankOrder": 0,
  "item": [
    {
      "choiceItemID": 47315155,
      "questionID": 19673995,
      "title": "<p>123123<img src=\"https://obscloud.ulearning.cn/resources/web/17653442934763743.png\" /></p>",
      "link": "https://obscloud.ulearning.cn/resources/web/17653443214724001.mp4"
    },
    {
      "choiceItemID": 47315156,
      "questionID": 19673995,
      "title": "<p>123123</p>",
      "link": ""
    },
    {
      "choiceItemID": 47315157,
      "questionID": 19673995,
      "title": "<p>122313</p>",
      "link": ""
    },
    {
      "choiceItemID": 47315158,
      "questionID": 19673995,
      "title": "<p>12312132</p>",
      "link": ""
    }
  ],
  "subQuestions": null,
  "link": [
    {
      "fileUrl": "https://obscloud.ulearning.cn/resources/web/17653341688477768.mp3",
      "lisCount": null,
      "fileName": "16994360136574566.mp3",
      "fileSize": 0,
      "srt": null,
      "avatar": null
    },
    {
      "fileUrl": "https://obscloud.ulearning.cn/resources/web/17653341742454581.mp4",
      "lisCount": null,
      "fileName": "17639736759711778.mp4",
      "fileSize": 0,
      "srt": null,
      "avatar": null
    }
  ],
  "analyLinkList": null,
  "answerLinkList": null,
  "demoLinkList": null,
  "formulaVar": null,
  "parentFolders": [],
  "creater": "测试教师",
  "orgName": "文华在线测试部门",
  "shareArray": [],
  "isUsed": null,
  "autoscore": 0,
  "linkOptionList": null,
  "tags": null,
  "tagIds": null,
  "compareInfo": null,
  "originalQuestionId": null,
  "isShareFolder": 0,
  "isShareRootDir": null,
  "shareFolderUse": null,
  "shareFolderAllowCopy": null,
  "shareFolderRootDirId": null,
  "knowledgeDTOS": null,
  "source": null
}
// this.question.mode = 3
// this.question = {
//     "id": null,
//     "type": 1,
//     "title": "<p>修改答案一次这是单选标题 答案A</p>",
//     "score": 1,
//     "correctAnswer": [
//         "B"
//     ],
//     "choices": [
//         {
//             "choiceItemId": 217,
//             "questionId": 77,
//             "link": "",
//             "title": "选项A的内容"
//         },
//         {
//             "choiceItemId": 218,
//             "questionId": 77,
//             "link": "",
//             "title": "选项B的内容"
//         },
//         {
//             "choiceItemId": 219,
//             "questionId": 77,
//             "link": "",
//             "title": "选项C的内容"
//         },
//         {
//             "choiceItemId": 220,
//             "questionId": 77,
//             "link": "",
//             "title": "选项D的内容"
//         }
//     ],
//     "item": [
//         {
//             "choiceItemId": 217,
//             "questionId": 77,
//             "link": "",
//             "title": "选项A的内容"
//         },
//         {
//             "choiceItemId": 218,
//             "questionId": 77,
//             "link": "",
//             "title": "选项B的内容"
//         },
//         {
//             "choiceItemId": 219,
//             "questionId": 77,
//             "link": "",
//             "title": "选项C的内容"
//         },
//         {
//             "choiceItemId": 220,
//             "questionId": 77,
//             "link": "",
//             "title": "选项D的内容"
//         }
//     ],
//     record: {
//       answer: "A"
//     },
//     "mode": 2
// }
      // console.log(this.question, '--------Choice--------');
    },
    getQuestion2() {
      this.question = {
        "questionid": 12496524,
        "oldQuestionId": null,
        "title": "13",
        // "title": `<span class="q-space" contenteditable="false">(&nbsp;)</span><p>123131有附件的多选题呵呵呵呵呵呵呵<img src=\"https://leicloud.ulearning.cn/resources/7449024/202509281042424985.jpg\" /></p>`,
        "type": 2,
        "iscontent": 1,
        "hardlevel": 3,
        "parentid": 0,
        "score": 1,
        "correctreply": "",
        "correctAnswer": [
            "A",
            "B"
        ],
        "lisCount": null,
        "createtime": null,
        "updatetime": 1764209055000,
        "remark": null,
        "userid": 7449024,
        "orgid": null,
        "aspid": null,
        "record": {
          answer: [ "A", "D" ]
        }
  
      }
    },
    getQuestion3() {
      this.question = {
        "allowExchange": 0,
  "questionid": 12497547,
  "oldQuestionId": null,
  "title": "<p>优学院是一个集(&nbsp;)、(&nbsp;)、(&nbsp;)、(&nbsp;)的平台</p>",
  "type": 3,
  "iscontent": 1,
  "hardlevel": 3,
  "parentid": 0,
  "score": 1,
  "correctreply": "",
  "correctAnswer": [
    "AI//ai",
    "智能化",
    "酌情给分",
    "酌情给分1"
  ],
  "lisCount": null,
  "createtime": null,
  "updatetime": 1762758218000,
  "remark": null,
  "userid": 6546517,
  "orgid": null,
  "aspid": null,
  "desc1": "",
  "desc4": null,
  "isShare": 0,
  "theLatest": null,
  "blankOrder": 0,
  "item": null,
  "subQuestions": null,
  "link": null,
  "analyLinkList": null,
  "answerLinkList": null,
  "demoLinkList": null,
  "formulaVar": null,
  "parentFolders": [],
  "creater": "魏艺宁老师",
  "orgName": "文华在线",
  "shareArray": [],
  "isUsed": null,
  "autoscore": null,
  "linkOptionList": null,
  "tags": null,
  "tagIds": null,
  "compareInfo": null,
  "originalQuestionId": null,
  "isShareFolder": 0,
  "isShareRootDir": null,
  "shareFolderUse": null,
  "shareFolderAllowCopy": null,
  "shareFolderRootDirId": null,
  "knowledgeDTOS": null,
  "source": null,
  "record": {
    answer: [
      "AI",
      "智能化",
      "酌情给分21312213",
      "酌情给分21312312211"
    ]
  },
  mode: 3
}
    },
    getQuestion4() {
      this.question = {
        type: 4,
        questionId: 8,
        record: {
          answer: "true"
        }
      }
    },
    addQuestion(type) {
      switch(type) {
        case 1:
          this.getQuestion1();
          // this.question = {
          //   type,
          //   questionId: Math.floor(Math.random() * 1e9),
          //   record: {
          //     answer: "A"
          //   }
          // }
          break;
        case 2:
          this.getQuestion2();
          break;
        case 3:
          this.getQuestion3();
          break;
        case 4:
          this.getQuestion4();
          break;
        default:
          this.question = {};
      }
    }
  }
}
</script>
<style scoped>
.container {
  width: 100%;
}
</style>