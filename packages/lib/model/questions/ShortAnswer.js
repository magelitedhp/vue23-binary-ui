import Question from "../Question.js";

export default class ShortAnswer extends Question {
  constructor(params) {
    super(params);
    
    this.answerLinkList = params.answerLinkList || []
    if (this.answerLinkList.length == 0 && this.answerlink) {
      this.answerLinkList.push({fileUrl: this.answerlink})
    }
    // 扩展字段处理
  }

  scoring() {
    // let isCorrect =
    //   this.record.answer.length === 1 &&
    //   this.record.answer[0].trim().length > 0;

    // this.record.score = isCorrect ? this.score : 0;
  }
  getAnswer() {
    return (this.record.answer.join("") || "").trim()
  }
  getCorrectAnswer() {
    return Array.isArray(this.correctAnswer) ? this.correctAnswer[0] : this.correctAnswer
  }
}
