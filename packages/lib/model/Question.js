export default class Question {
  constructor({
    id,
    questionId = "",
    type = 0,
    title = "",
    score = 1,
    correctAnswer = [],
    reply = "",
    record = {},
    lisCount = -1,
    link = [],
    analyLinkList = [],
    answerlink = "",
    correctChoiceIds = [],
    tags = [],
    hardlevel = 3,
    knowledgeDTOS = []
  }) {
    this.id = id || questionId;
    this.questionid = this.id; // 与后台传参兼容
    this.type = type;
    this.title = title;
    this.score = score;
    this.correctAnswer = correctAnswer;
    this.reply = reply;
    this.record = new Record(record);
    this.lisCount = lisCount;
    this.link = link || [];
    this.analyLinkList = analyLinkList || [];
    this.answerlink = answerlink;
    this.correctChoiceIds = correctChoiceIds;
    this.tags = tags || [];
    this.hardlevel = hardlevel;
    this.knowledgeDTOS = knowledgeDTOS || [];
  }

  scoring() {
    // 子类自行实现算分方法
    console.error("子类自行实现接口");

  }

  getOption(index) {
    return String.fromCharCode("A".charCodeAt(0) + index);
  }
  
  getAnswer() {
    const answer = this.record.answer
    if (answer && answer.length > 0) {
      return answer[0]
    }
    return ''
  }

  getCorrectAnswer() {}
}

export class Record {
  constructor({
    id = "",
    answer = [],
    attachments = [],
    grade,
    reply = "",
    remark1 = ""
  }) {
    this.id = id;
    this.answer = answer;
    this.attachments = attachments;
    this.score = grade;
    this.reply = reply || remark1;
  }
}