import Question from "../Question.js";

export class Variable {
  constructor({ name = "", precision, max, min }) {
    this.name = name;
    this.precision = precision || 1;
    this.max = max;
    this.min = min;
  }
}

export class Blank {
  constructor({ formula = "", answerRange = 0, precision = 1 }) {
    this.formula = formula;
    this.answerRange = answerRange;
    this.precision = precision;
  }
}

export default class FormulaCalculation extends Question {
  constructor(params) {
    super(params);

    // 扩展字段处理
    this.variables = [];
    this.blanks = [];
    this.scope = {};
    this.desc1 = params.desc1
    // 初始化变量
    try {
      for (let i = 0; params.formulaVar && i < params.formulaVar.length; i++) {
        let v = params.formulaVar[i];
        this.variables.push(new Variable(v));
        if (v.value !== undefined) {
          this.scope[v.name] = v.value
        }
      }
    } catch (error) {
      console.log(error);
    }

    // 初始化空
    let index = 0;
    this.title.replace(/[(（](\s|&nbsp;)+[)）]|_{5,}/gi, () => {
      let correctAnswer = {};
      const answer = this.correctAnswer[index];
      if (answer) {
        correctAnswer = typeof answer === 'string' && answer.length > 0 ? JSON.parse(answer) : answer
      } 
      let blank = new Blank(correctAnswer)
      blank.blankIndex = index + 1
      this.blanks.push(blank);
      index++
    })
    this.oldNums = this.blanks.length
  }

  createVariable(name) {
    this.variables.push(
      new Variable({
        name: name,
      })
    );
  }

  deleteVariable(name) {
    for (let i = 0; i < this.variables.length; i++) {
      let variable = this.variables[i];
      if (variable.name === name) {
        this.variables.splice(i, 1);
        return;
      }
    }
  }

  createBlank() {
    this.blanks.push(new Blank({}));
  }

  deleteBlank(index, num) {
    this.blanks.splice(index, num || 1);
  }

  createBlankByIndex(index, blankIndex) {
    let blank = new Blank({})
    blank.blankIndex = blankIndex
    this.blanks.splice(index, 0, blank);
  }

  initVariables(title) {
    let scope = {}
    for (let i = 0; i < this.variables.length; i++) {
      let item = this.variables[i];
      let randomNum = item.min * 1 + Math.random() * (item.max - item.min);
      randomNum = new Number(randomNum);
      let decimalNumber = 0;
      if (item.precision != 1) {
        decimalNumber = (Math.round(0.1 / item.precision) + "").length;
      }
      randomNum = randomNum.toFixed(decimalNumber);
      let reg = new RegExp("\\>" + item.name + "\\*\\<", "g");
      title = title.replace(reg, ">" + randomNum + "<");
      scope[item.name] = randomNum;
    }
    // 注意，首次生成随机变量后需要保存在后台，供回显时使用
    this.scope = scope;
    return title
  }

  initDomVariables(title) {
    for (let key in this.scope) {
      let reg = new RegExp("\\>" + key + "\\*\\<", "g");
      title = title.replace(reg, ">" + this.scope[key] + "<");
    }
    return title
  }

  checkAnswer(math) {
    // 公式题提交时，需要携带提交当前生成的随机变量，并由前端判断答案是否正确
    let answers = []
    for (let i = 0; i < this.blanks.length; i++) {
      answers.push({
        text: this.record.answer[i] || ""
      })
    }
    let extraAnswer = {
      scope: this.scope,
      answerResult: [],
    };
    let rightCount = 0
    for (let i = 0; Object.values(this.scope).length > 0 && i < answers.length; i++) {
      if (answers[i].text && answers[i].text.trim().length > 0) {
        let blank = this.blanks[i];
        let formula = blank.formula;
        let result = math.format(math.evaluate(formula, this.scope), {precision: 14}) * 1.0; // 使用随机变量计算出答案
        let userAnswer = answers[i].text * 1.0;

        // 处理精度
        let decimalNumber = 0
        if (blank.precision != 1) {
          decimalNumber = (Math.round(0.1 / blank.precision) + "").length;
        }
        result = result.toFixed(decimalNumber) * 1.0;
        userAnswer = userAnswer.toFixed(decimalNumber) * 1.0;

        // 判断答案是否在允许范围
        if (
          userAnswer >= result - (blank.answerRange * 1.0) &&
          userAnswer <= result + (blank.answerRange * 1.0)
        ) {
          // 正确
          extraAnswer.answerResult[i] = true;
          rightCount++
        } else {
          // 错误
          extraAnswer.answerResult[i] = false;
        }
      } else {
        extraAnswer.answerResult[i] = false;
      }
    }
    this.record.extraAnswer = extraAnswer;
    this.record.grade = this.score * (rightCount/this.blanks.length)
    this.checkResult = extraAnswer.answerResult;
  }
}
