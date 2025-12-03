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
import { Choice, Judge, Completion } from 'ul-question-test-ui/vue3';
import { ref, computed } from "vue"
import { Button as MyTinyButton } from '@opentiny/vue'

// 状态定义
const question = ref({})
const mode = ref(1)
const questionType = ref(1) // 1: 单选, 2: 多选, 3: 判断, 4: 填空

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
    3: Judge,
    4: Completion
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
const getQuestion3 = () => {
    question.value = {
        "questionid": 12496525,
        "oldQuestionId": null,
        "title": "<p>这是一道判断题</p>",
        "type": 3,
        "iscontent": 1,
        "hardlevel": 2,
        "parentid": 0,
        "score": 1,
        "correctreply": "",
        "correctAnswer": [
            "正确"
        ],
        "lisCount": null,
        "createtime": null,
        "updatetime": 1764209055000,
        "remark": null,
        "userid": 7449024,
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
        "creater": "csbm_testtea001@!:+./！",
        "orgName": "测试部门-测试机构",
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
}
const getQuestion4 = () => {
    question.value = {
        "questionid": 12496526,
        "oldQuestionId": null,
        "title": "<p>请填写：中国的首都是____，美国的首都是____。</p>",
        "type": 4,
        "iscontent": 1,
        "hardlevel": 1,
        "parentid": 0,
        "score": 1,
        "correctreply": "",
        "correctAnswer": [
            "北京",
            "华盛顿"
        ],
        "lisCount": null,
        "createtime": null,
        "updatetime": 1764209055000,
        "remark": null,
        "userid": 7449024,
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
        "creater": "csbm_testtea001@!:+./！",
        "orgName": "测试部门-测试机构",
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
        "questionid": 12496523,
        "oldQuestionId": null,
        "title": "<p>123131有附件的单选题呵呵呵呵呵呵呵<img src=\"https://leicloud.ulearning.cn/resources/7449024/202509281042424985.jpg\" /></p>",
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
        "updatetime": 1764209055000,
        "remark": null,
        "userid": 7449024,
        "orgid": null,
        "aspid": null,
        "desc1": "",
        "desc4": null,
        "isShare": 0,
        "theLatest": null,
        "blankOrder": 0,
        "item": [
            {
                "choiceItemID": 457368601,
                "questionID": 12496523,
                "title": "<p>123</p>",
                "link": "https://tobs.ulearning.cn/resources/web/16601871016762958.mp3"
            },
            {
                "choiceItemID": 457368602,
                "questionID": 12496523,
                "title": "<p><img src=\"https://tobs.ulearning.cn/resources/web/16601866903825796.png\" width=\"515\" height=\"213\" /><img src=\"https://tobs.ulearning.cn/resources/web/166018692562230.png\" /></p>",
                "link": ""
            },
            {
                "choiceItemID": 457368603,
                "questionID": 12496523,
                "title": "<p>123</p>",
                "link": ""
            },
            {
                "choiceItemID": 457368604,
                "questionID": 12496523,
                "title": "<p>123</p>",
                "link": ""
            }
        ],
        "subQuestions": null,
        "link": [
            {
                "fileUrl": "https://leicloud.ulearning.cn/resources/7449024/202509281042488834.mp3",
                "lisCount": null,
                "fileName": "16994360136574566.mp3",
                "fileSize": 0,
                "srt": null,
                "avatar": null
            },
            {
                "fileUrl": "https://leicloud.ulearning.cn/resources/7449024/202509281042534031.mp4",
                "lisCount": null,
                "fileName": "62c74441fde0d91b474d9a85bd68fd7c.mp4",
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
        "creater": "csbm_testtea001@!:+./！",
        "orgName": "测试部门-测试机构",
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
}
const getQuestion2 = () => {
    question.value = {
        "questionid": 12496524,
        "oldQuestionId": null,
        "title": "<p>123131有附件的多选题呵呵呵呵呵呵呵<img src=\"https://leicloud.ulearning.cn/resources/7449024/202509281042424985.jpg\" /></p>",
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
        "aspid": null
    }
}
</script>
<style></style>