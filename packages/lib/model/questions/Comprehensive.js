import Question from "../Question.js";
import {
  getQuestionWithAdapter,
  createQuestion,
} from "@/model/questionFactory.js";

export default class Comprehensive extends Question {
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

      this.subQuestions.push(getQuestionWithAdapter(sq));
    }
  }

  // 扩展方法
  scoring() {
    // let score = 0;
    // for (let i = 0; i < this.subQuestions.length; i++) {
    //   let sq = this.subQuestions[i];

    //   sq.scoring();
    //   score += sq.record.score;
    // }

    // this.record.score = score;
  }

  createSubQuestion(type) {
    let question = createQuestion(type)
    question.isEdit = true
    question.isNew = 1
    this.subQuestions.push(question);
  }

  deleteSubQuestion(index) {
    this.subQuestions.splice(index, 1);
  }
}
