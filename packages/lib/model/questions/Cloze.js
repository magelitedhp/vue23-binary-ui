import Question from "../Question.js";
import {
  getQuestionWithAdapter,
  createQuestion,
} from "@/model/questionFactory.js";

export default class Cloze extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
    this.subQuestions = [];
    // 初始化子题
    for (
      let i = 0;
      params.subQuestions && i < params.subQuestions.length;
      i++
    ) {
      let sq = params.subQuestions[i];
      sq.type = 1;
      sq = getQuestionWithAdapter(sq);
      sq.qIndex = i + 1;
      this.subQuestions.push(sq);
    }
    this.oldNums = this.subQuestions.length
  }

  // 扩展方法
  scoring() {
    // let isCorrect =
    //   this.record.answer.length === 1 &&
    //   this.record.answer[0].trim().length > 0;

    // this.record.score = isCorrect ? this.score : 0;
  }

  createSubQuestion() {
    this.subQuestions.push(createQuestion(1));
  }

  deleteSubQuestion(index, num) {
    this.subQuestions.splice(index, num || 1);
  }

  createSubQuestionByIndex(index, qIndex) {
    let subQuestion = createQuestion(1)
    subQuestion.qIndex = qIndex
    subQuestion.isNew = 1
    this.subQuestions.splice(index, 0, subQuestion);
  }

  getAnswerText(subQuestion) {
    if (subQuestion.correctAnswer.length === 0) {
      return "";
    }
    let answerIndex =
      subQuestion.correctAnswer[0].charCodeAt(0) - "A".charCodeAt(0);

    return subQuestion.choices[answerIndex].text;
  }
}
