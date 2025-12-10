import Question from "./Question.js";
import ChoiceQuestion from "./questions/ChoiceQuestion.js";
import Completion from "./questions/Completion.js";
import TrueOrFalseQuestion from "./questions/TrueOrFalseQuestion.js";
import ShortAnswer from "./questions/ShortAnswer.js";
import Cloze from "./questions/Cloze.js";
import BankedCloze from "./questions/BankedCloze.js";
import Comprehensive from "./questions/Comprehensive.js";
import Sorting from "./questions/Sorting.js";
import OralSubjective from "./questions/OralSubjective.js";
import OralReading from "./questions/OralReading.js";
import FormulaCalculation from "./questions/FormulaCalculation.js";
import { handleNum } from "@/utils"
import Paper from "@/model/paper.js";
import { lang, t } from "@/locale/index"
export function getQuestion(params) {
  let question = null;
  switch (params.type) {
    case 1:
    case 2:
      question = new ChoiceQuestion(params);
      break;
    case 3:
      question = new Completion(params);
      break;
    case 4:
      question = new TrueOrFalseQuestion(params);
      break;
    case 5:
      question = new ShortAnswer(params);
      break;
    case 12:
      question = new Sorting(params);
      break;
    case 11:
    case 23:
      question = new Cloze(params);
      break;
    case 17:
      question = new BankedCloze(params);
      break;
    case 16:
      question = new OralSubjective(params);
      break;
    case 19:
      question = new OralReading(params);
      break;
    case 24:
      question = new Comprehensive(params);
      break;
    case 25:
      question = new FormulaCalculation(params);
      break;
    default:
      question = new Question(params);
  }
  return question;
}

export function getQuestionTypeText(qtype) {
  let questionType = t('questionType');
  const type = qtype || this.question.type
  switch (type) {
    case 1:
      questionType = t('singleQ');
      break;
    case 2:
      questionType = t('multipleQ');
      break;
    case 3:
      questionType = t('completion');
      break;
    case 4:
      questionType = t('judgmentQ');
      break;
    case 5:
      questionType = t('shortAnswer');
      break;
    case 12:
      questionType = t('sortingQ');
      break;
    case 11:
      questionType = t('clozeQ');
      break;
    case 23:
      questionType = t('dropDownQ');
      break;
    case 17:
      questionType = t('blankQ');
      break;
    case 16:
      questionType = t('oralSubjectQ');
      break;
    case 19:
      questionType = t('oralReadingQ');
      break;
    case 24:
      questionType = t('comprehensiveQ');
      break;
    case 25:
      questionType = t('formulaCalculationQ');
      break;
  }
  return questionType;
}

export function getQuestionComponent() {
  let questionType = "base"; // base是所有习题组件的模板
  switch (this.question.type) {
    case 1:
    case 2:
      questionType = "choice";
      break;
    case 3:
      questionType = "completion";
      break;
    case 4:
      questionType = "true-or-false";
      break;
    case 5:
      questionType = "short-answer";
      break;
    case 12:
      questionType = "sorting";
      break;
    case 11:
    case 23:
      questionType = "cloze";
      break;
    case 17:
      questionType = "banked-cloze";
      break;
    case 16:
      questionType = "oral-subjective";
      break;
    case 19:
      questionType = "oral-reading";
      break;
    case 24:
      questionType = "comprehensive";
      break;
    case 25:
      questionType = "formula-calculation";
      break;
  }
  return "ul-" + questionType;
}

export function createQuestion(type) {
  let question = getQuestion({
    id: Math.random(),
    type: type,
  });
  question.key = Math.random()
  return question
}

export function getQuestionWithAdapter(params) {
  params.id = params.id || params.questionid;
  params.allowExchange = params.allowExchange || params.blankOrder || params.blackOrder || 0;
  if (params.correctAnswerAndReplay) {
    let { correctAnswer, correctReplay, correctChoiceIds } = params.correctAnswerAndReplay
    params.correctAnswer = correctAnswer || params.correctAnswer;
    params.reply = correctReplay || params.reply;
    params.correctChoiceIds = correctChoiceIds || []
  } else {
    params.correctAnswer = params.correctAnswer || params.correctanswer;
    params.reply = params.reply || params.correctreply;
  }
  params.correctAnswer = params.correctAnswer || params.correctanswer;
  params.reply = params.reply || params.correctreply;
  params.subQuestions = params.questionlist || params.subQuestions;
  // 处理分数除不尽的情况
  if (params.subQuestions && params.subQuestions.length > 0) {
    params.score = 0
    params.subQuestions.forEach((it, j) => {
      it.score = it.score === 0 || it.score > 0 ? Number(handleNum(it.score, 2)) : 1
      params.score += it.score;
    });
  }
  params.score = params.score === 0 || params.score > 0 ? Number(handleNum(params.score, 2)) : 1
  if (params.type == 25 && !params.formulaVar && params.desc1) {
    params.formulaVar = JSON.parse(params.desc1)
  }
  return getQuestion(params);
}

export function toolbarOptions2() {
  let str = "";
  switch (this.question.type) {
    case 3:
      str = "addSpace";
      break;
    case 11:
    case 23:
    case 17:
      str = "addQues";
      break;
    case 25:
      str = "addVariable addSpace";
      break;
    default:
  }
  return str
}

export function handleBlank(title, blanks) {
  const blankregx = /[(（](\s|&nbsp;)+[)）]|_{5,}/gi;
  if (blankregx.test(title)) {
    title = title.replace(blankregx, () => {
      return '(&nbsp;)'
    });
  }
  return title
}

export function handleSubQuestion(title, subQuestions) {
  const regx = /<span class="question"[^/]*<\/span>/g;
  let i = 0;
  if (regx.test(title)) {
    title = title.replace(regx, () => {
      i++
      return `<span class="question" contenteditable="false" data-index="${(subQuestions[i - 1] && subQuestions[i - 1].qIndex) || i}">[${i}]</span>`
    });
  }
  return title
}

export function titleListener(newValue, regExp, addCallback, deleteCallback) {
  const reg = new RegExp(regExp, 'g');
  let strs = newValue.match(reg);
  let indexs = [];
  for (let i = 0; strs && i < strs.length; i++) {
    let strIndex;
    const dataIndexMatch = /data-index="([^"]*)"/g.exec(strs[i]);
    if (dataIndexMatch && dataIndexMatch.length > 1) {
      strIndex = dataIndexMatch[1];
    } else {
      strIndex = i + 1;
    }
    indexs.push(strIndex);
    addCallback && addCallback(i, strIndex);
  }
  deleteCallback && deleteCallback(indexs);
}

export function editQuestionHandleData(question) {
  question.isEdit = true;
  if ([11, 17, 23].includes(question.type)) {
    question.title = handleSubQuestion(
      question.title,
      question.subQuestions
    );
  }
  if ([3, 25].includes(question.type)) {
    question.title = handleBlank(question.title, question.blanks);
  }
  if (question.subQuestions && question.subQuestions.length > 0) {
    question.subQuestions.forEach((item) => {
      item.isEdit = true;
      if (question.type === 24 && [3, 25].includes(item.type)) {
        item.title = handleBlank(item.title, item.blanks);
      }
    });
  }
  return question
}

export function saveQuestionHandleData(question) {
  const changeTitle = (question) => {
    if (question.type === 3 || question.type === 25) {
      question.title = question.title.replace(/\((\s|&nbsp;)+\)/gi, "()");
      question.title = question.title.replace(/（(\s|&nbsp;)+）/gi, "（）");
    }
  }
  const saveQuestionAdapter = (question) => {
    if (question.choices && question.choices.length > 0) {
      question.item = question.choices.map((it) => {
        it.title = it.text;
        it.attachments &&
          it.attachments.forEach((file) => {
            it.link = file.fileUrl;
          });
        return it;
      });
    }
    if (question.type === 25) {
      if (question.variables && question.variables.length > 0) {
        question.formulaVar = question.variables.map((it) => {
          it.max = Number(it.max);
          it.min = Number(it.min);
          return it;
        });
      }
      if (question.blanks && question.blanks.length > 0) {
        question.correctAnswer = question.blanks;
      }
    }
    if (question.type == 3) {
      question.blankOrder = question.allowExchange ? 1 : 0;
    }
    question.correctreply = question.reply;
    changeTitle(question)
    return question;
  }
  let data = JSON.parse(JSON.stringify(question))
  // 选词填空题优先兼容处理
  if (data.type === 17) {
    data = saveQuestionAdapter(data);
  }
  if (data.subQuestions && data.subQuestions.length > 0) {
    data.subQuestions.forEach((item) => {
      item = saveQuestionAdapter(item);
      // 为了兼容选词填空题旧版前端渲染试卷
      if (data.type === 17) {
        item.type = 17;
      }
    });
  } else {
    data = saveQuestionAdapter(data);
  }
  return data
}


export function changePreviewTitle(question) {
  let title = question.title;
  if ([3, 25].includes(question.type)) {
    for (let i = 0; i < question.blanks.length; i++) {
      if (question.type == 3) {
        var answer = (question.blanks[i].correctAnswer || "").trim();
      } else {
        var answer = question.blanks[i];
      }
      const blankHtml =
        '<span class="blank"><span class="blank-option">[' +
        (i + 1) +
        ']</span><span class="blank-text">' +
        (question.type == 3 ? answer : answer.formula) +
        "</span></span>";
      title = title.replace(/[(（](\s|&nbsp;)+[)）]|_{5,}/, blankHtml);
    }
  } else {
    for (let i = 0; i < question.subQuestions.length; i++) {
      let blank = question.subQuestions[i];
      let blankHtml =
        '<span class="blank"><span class="blank-option">[' +
        (i + 1) +
        ']</span><span class="blank-text">' +
        question.getAnswerText(blank)
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;") +
        "</span></span>";
      title = title.replace(
        /<span class="question"[^/]*<\/span>/,
        blankHtml
      );
    }
  }
  return title;
}