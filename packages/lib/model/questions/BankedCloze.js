import Question from "../Question.js";
import {
  getQuestionWithAdapter,
  createQuestion,
} from "@/model/questionFactory.js";

export class Choice {
  constructor({ id = "", text = "", option = "", attachments = [] }) {
    this.id = id;
    this.text = text;
    this.option = option;
    this.attachments = attachments;
  }
}

export default class BankedCloze extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
    this.choices = [];
    this.subQuestions = [];
    // 初始化选项
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
    // 初始化子题
    for (
      let i = 0;
      params.subQuestions && i < params.subQuestions.length;
      i++
    ) {
      let sq = params.subQuestions[i];
      sq = getQuestionWithAdapter(sq);
      sq.qIndex = i + 1
      this.subQuestions.push(sq);
    }
    this.oldNums = this.subQuestions.length
  }

  scoring() {
    // let isCorrect =
    //   this.record.answer.length === 1 &&
    //   this.record.answer[0].trim().length > 0;

    // this.record.score = isCorrect ? this.score : 0;
  }

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
    if (
      subQuestion.correctAnswer.length === 0 ||
      !subQuestion.correctAnswer[0]
    ) {
      return "";
    }
    let answerIndex =
      subQuestion.correctAnswer[0].charCodeAt(0) - "A".charCodeAt(0);

    return this.choices[answerIndex].text;
  }

  getAnswer() {
    return Array.isArray(this.record.answer)
          ? this.record.answer.join("")
          : this.record.answer
  }

  getCorrectAnswer() {
    return Array.isArray(this.correctAnswer)
    ? this.correctAnswer.join("")
    : this.correctAnswer
  }
  
  handleAnswer(showAnswerResult, index) {
    if (!showAnswerResult) {
      return ''
    }
    const option = this.getOption(index);
    const isCorrectAnswer = this.correctAnswer && this.correctAnswer.includes(option)
    const isSelect = this.record.answer && this.record.answer.includes(option)
    if (isSelect) {
      return isCorrectAnswer ? 'correct' : 'error'
    }
    return ''
  }
}
