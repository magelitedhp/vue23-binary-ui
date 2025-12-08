import Question from "../Question.js";

export class Choice {
  constructor({ id = "", text = "", option = "" }) {
    this.id = id;
    this.text = text;
    this.option = option;
  }
}

export default class Sorting extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
    this.choices = [];
    for (let i = 0; params.item && i < params.item.length; i++) {
      let c = params.item[i];

      this.choices.push(
        new Choice({
          id: Math.random(),
          text: c.title,
        })
      );
    }
    // 补全到四个选项
    if (this.choices.length === 0) {
      for (let i = 1; i <= 4; i++) {
        this.choices.push(
          new Choice({
            id: Math.random(),
            text: "",
          })
        );
      }
    }
  }

  scoring() {
    this.record.score = 0;
  }

  // 扩展方法
  createChoice() {
    this.choices.push(
      new Choice({
        id: Math.random(),
      })
    );
  }

  deleteChoice(choice, index) {
    this.choices.splice(index, 1);
  }

  getAnswer() {
    const answer = Array.isArray(this.record.answer) ? this.record.answer : [this.record.answer]
    const hasAnswer = answer.filter(it => it && it.length > 0)              
    return hasAnswer.length > 0 ? answer.join("-") : '' 
  }

  getCorrectAnswer() {
    return Array.isArray(this.correctAnswer)
    ? this.correctAnswer.join("-")
    : this.correctAnswer
  }

  handleAnswer(showAnswerResult, index) {
    if (!showAnswerResult) {
      return ''
    }
    if (this.record.answer && this.record.answer[index]) {
      return this.correctAnswer[index] === this.record.answer[index] ? 'correct' : 'error'
    }
    return ''
  }
}
