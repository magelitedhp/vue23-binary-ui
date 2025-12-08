import Question from "../Question.js";

export class Choice {
  constructor({
    id = "",
    questionID = '',
    choiceId = 0,
    text = "",
    attachments = [],
    record = {}
  }) {
    this.id = id || questionID;
    this.choiceId = choiceId;
    this.text = text;
    this.attachments = attachments;
    this.record = record
  }
}

export default class ChoiceQuestion extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
    this.choices = [];
    for (let i = 0; params.item && i < params.item.length; i++) {
      let c = params.item[i];
      
      this.choices.push(
        new Choice({
          id: Math.random(),
          choiceId: c.choiceId || 0,
          text: c.title,
          attachments: c.link ? [{
            fileUrl: c.link
          }] : []
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
    // let isCorrect = isEqualArray(this.record.answer, this.correctAnswer);

    // this.record.score = isCorrect ? this.score : 0;
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
    if (!showAnswerResult || this.getAnswer().length === 0) {
      return ''
    }
    const option = this.getOption(index);
    const isCorrectAnswer = this.correctAnswer && this.correctAnswer.includes(option)
    const isSelect = this.record.answer && this.record.answer.includes(option)
    if (isSelect) {
      return isCorrectAnswer ? 'correct' : 'error'
    }
    return isCorrectAnswer && this.type === 2 ? 'no-select error' : ''
  }
}

// 工具方法
function isEqualArray(array1, array2) {
  if (array1 && array1.length && array2 && array2.length) {
    let leftArray = deepCopy(array1);
    let rightArray = deepCopy(array2);
    let equalItemNum = 0;
    for (let i = 0; i < leftArray.length; i++) {
      let leftItem = leftArray[i];
      for (let j = 0; j < rightArray.length; j++) {
        let rightItem = rightArray[j];
        if (leftItem == rightItem) {
          equalItemNum++;
          rightArray.splice(j, 1);
          break;
        }
      }
    }
    if (equalItemNum == array1.length && equalItemNum == array2.length) {
      return true;
    }
  }
  return false;
}

function deepCopy(source) {
  let temp = JSON.stringify(source);
  return JSON.parse(temp);
}