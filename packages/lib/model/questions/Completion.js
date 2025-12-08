import Question from "../Question.js";

export class Blank {
  constructor({ id = "", correctAnswer = "" }) {
    this.id = id;
    this.correctAnswer = correctAnswer;
  }
}

export default class Completion extends Question {
  constructor(params) {
    super(params);
    // 扩展字段处理
    this.allowExchange = params.allowExchange || params.blankOrder || params.blackOrder || 0; // 是否允许交换空的答案
    this.blanks = [];
    // 初始化空
    let index = 0;
    this.title.replace(/[(（](\s|&nbsp;)+[)）]|_{5,}/gi, () => {
      this.createBlank();
      this.blanks[index].correctAnswer = this.correctAnswer[index];
      this.blanks[index].blankIndex = index + 1
      index++
    })
    this.oldNums = this.blanks.length
  }

  createBlank() {
    this.blanks.push(
      new Blank({
        id: Math.random(),
        correctAnswer: "",
      })
    );
    if (this.correctAnswer.length < this.blanks.length) {
      this.correctAnswer.push("");
    }
  }

  deleteBlank(index, num = 1) {
    this.blanks.splice(index, num);
    this.correctAnswer.splice(index, num);
  }

  createBlankByIndex(index, blankIndex) {
    let blank = new Blank({
      id: Math.random(),
      correctAnswer: ""
    })
    blank.blankIndex = blankIndex
    this.blanks.splice(index, 0, blank);
    this.correctAnswer.splice(index, 0, "");
  }
}
