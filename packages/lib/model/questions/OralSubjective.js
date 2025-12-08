import Question from "../Question.js";

export default class OralSubjective extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
  }

  scoring() {
    // let isCorrect =
    //   this.record.answer.length === 1 &&
    //   this.record.answer[0].trim().length > 0;

    // this.record.score = isCorrect ? this.score : 0;
  }

  getAnswer() {
    return this.record.answer.join("") || ""
  }
}
