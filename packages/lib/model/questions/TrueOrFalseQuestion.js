import Question from "../Question.js";

export default class TrueOrFalseQuestion extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
  }

  scoring() {
    // let isCorrect =
    //   this.record.answer.length === 1 &&
    //   this.record.answer[0] == this.correctAnswer[0];

    // this.record.score = isCorrect ? this.score : 0;
  }

  getAnswerResult(answer) {
    if (answer && answer.length > 0 && answer[0]) {
      return answer[0].toLowerCase() === 'true' || answer[0] === true
    } 
    return ''
  }

  handleAnswer(showAnswerResult, option) {
    const isSelect = this.getAnswerResult(this.record.answer) === option
    if (!showAnswerResult) {
      return isSelect ? 'select' : ''
    }
    const isCorrectAnswer = this.getAnswerResult(this.correctAnswer) === option
    if (isSelect) {
      return isCorrectAnswer ? 'correct' : 'error'
    }
    return ''
  }
}
