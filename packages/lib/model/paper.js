import { getQuestionWithAdapter } from "@/model/questionFactory.js";
import { formatFileType } from "@/utils/file.js";
import { getUniqueValue, handleNum } from "@/utils"
import Attach from "@/model/attach.js";
export default class Paper {
  constructor({
    paperID,
    paperId,
    title = "",
    score = 0,
    count = 0,
    part = [],
    isHasUsed = 0,
    enableUpload = 0,
    status = 0,
    objective = 0,
    subjective = 0,
    questionOrderBreak = 0,
    optionOrderBreak = 0,
    choiceItems = [],
    hideQuestionType = 0
  }) {
    this.paperID = paperID || paperId;
    this.title = title;
    this.score = score;
    this.count = count;
    this.part = part;
    this.isUsed = isHasUsed;
    this.enableUpload = enableUpload;
    this.status = status;
    this.objective = objective;
    this.subjective = subjective;
    this.questionOrderBreak = questionOrderBreak; // 题目乱序
    this.optionOrderBreak = optionOrderBreak; // 选项乱序
    this.choiceItems = choiceItems; // 选项乱序集合
    this.hideQuestionType = hideQuestionType ? 1 : 0;
  }
  randomQuestion(arr) {
    let outputArr = arr.slice();
    let i = outputArr.length;
    let indexA = 0;
    let indexB = 0;

    while (i) {
      indexA = i - 1;
      indexB = Math.floor(Math.random() * i);
      i--;

      if (indexA == indexB) continue;
      [outputArr[indexA], outputArr[indexB]] = [outputArr[indexB], outputArr[indexA]]
    }
    return outputArr;
  }
  handleQuestionData(question, mode) {
    question.link && question.link.forEach(it => {
      if (formatFileType(it.fileUrl) === "audio") {
        if (!it.lisCount) {
          it.lisCount = question.lisCount || -1
        }
      }
    })
    if (question.type === 5 && this.enableUpload) {
      question.enableUpload = 1
    }
    if (mode === 5) {
      const arr = question.record.answer.filter(it => (it || '').trim().length > 0)
      question.isEdit = arr.length || (question.record.attachments && question.record.attachments.length > 0)
    }
  }
  handleRightOrWrong(question) {
    try {
      const { type, record, allowExchange, subQuestions, correctChoiceIds } = question
      // 根据选项id重新获取正确答案（选项乱序专用）
      if (correctChoiceIds && correctChoiceIds.length > 0) {
        question.correctAnswer = correctChoiceIds.map(it => {
          const index = question.choices.findIndex(choice => choice.choiceId == it)
          return index > -1 ? String.fromCharCode("A".charCodeAt(0) + index) : ''
        })
      }
      question.checkResult = this.checkAnswer(type, record.answer, question.correctAnswer, allowExchange, subQuestions)
      if ([5, 16, 19].includes(type)) {
        question.isEdit = record.score === undefined ? 3 : 4
      } else {
        if (Array.isArray(question.checkResult)) {
          question.answerStatus = question.checkResult.every(it => it) ? 1 : -1
        } else {
          question.answerStatus = question.checkResult ? 1 : -1
        }
        question.isEdit = question.answerStatus === 1 ? 1 : 2
        if ([3, 25].includes(type)) {
          question.isEdit = record.score === undefined ? 3 : 4
        }
      }
      question.remark = (diffGrade) => {
        this.subjective = handleNum(this.subjective + diffGrade)
        let index = this.remarkedQues.findIndex(it => it.id === question.id)
        if (index !== -1) {
          this.remarkedQues.splice(index, 1)
        }
        this.remarkedQues.push(question)
      }
      if ([5, 16, 19, 3, 25].includes(type) && this.canRemarkQues) {
        this.canRemarkQues.push(question)
      }
    } catch (e) {
      console.log(e)
    }
  }
  handleStudentAnswer(question) {
    try {
      if (
        question.questionlist &&
        question.questionlist.length > 0
      ) {
        if (question.type === 24) {
          question.questionlist.forEach(it => {
            it.record = this.handleRecord(it.studentAnswer || { answer: [""] }, it.questionid)
          })
        } else {
          let answers = []
          let scores = []
          let record = {}
          question.questionlist.forEach((it) => {
            const { answer, grade } = it.studentAnswer;
            answers.push(answer || "");
            scores.push(grade || 0)
          });
          record.grade = scores;
          record.answer = answers;
          record.id = record.ID;
          question.record = record;
        }
      } else {
        if (question.studentAnswer) {
          question.record = this.handleRecord(question.studentAnswer || {}, question.questionid)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  handleEachQuestion(question, mode) {
    question.isEdit = false;
    question.answerStatus = 0;
    question.key = getUniqueValue()
    question.hideQuestionType = this.hideQuestionType
    this.handleQuestionData(question, mode)
    if (mode === 4) {
      this.handleRightOrWrong(question)
    }
  }
  initIndex(isNewPaper, mode) {
    let totalCount = 0;
    let score = 0;
    if (mode === 4) {
      this.canRemarkQues = []
      this.remarkedQues = []
    }
    this.part.forEach((item, i) => {
      // 打乱题目顺序
      if (isNewPaper && this.questionOrderBreak && item.children) {
        item.children = this.randomQuestion(item.children);
      }
      item = new Section(item)
      item.score = 0;
      item.count = 0;
      item.children &&
        item.children.forEach((question, k) => {
          let type = question.type
          // 为了处理问题数据，不包含子题的题型，有questionlist就取第一个
          if (![11, 17, 23, 24, 25].includes(type - 0)) { 
            if (Array.isArray(question.questionlist) && question.questionlist.length > 0) {
              question = question.questionlist[0]
              type = question.type
            }
          }
          // 打乱选项顺序
          if (isNewPaper && this.optionOrderBreak && (type == 1 || type == 2 || type == 24)) { 
            if (type == 1 || type == 2) {
              question.item = this.randomQuestion(question.item)
            }
            if (type == 24 && question.questionlist && question.questionlist.length > 0) {
              question.questionlist.forEach(subIt => {
                if (subIt.type == 1 || subIt.type == 2) {
                  subIt.item = this.randomQuestion(subIt.item)
                }
              })
            }
          }

          if (mode === 4 || mode === 5) {
            this.handleStudentAnswer(question)
          }
          question = getQuestionWithAdapter(question);
          this.handleEachQuestion(question, mode)
          item.score += Number(question.score);
          if (
            question.type === 24 &&
            question.subQuestions &&
            question.subQuestions.length > 0
          ) {
            question.subQuestions.forEach((it, j) => {
              it.index = totalCount + item.count + j + 1;
              this.handleEachQuestion(it, mode)
            });
            item.count += question.subQuestions.length;
          } else {
            item.count += 1;
            question.index = totalCount + item.count;
          }
          item.children.splice(k, 1, question);
        });
      totalCount += item.count;
      score += item.score;
      this.part.splice(i, 1, item);
    });
    this.count = totalCount;
    this.score = handleNum(score);
  }
  initEachQuestion(question, mode) {
    let type = question.type
    // 为了处理问题数据，不包含子题的题型，有questionlist就取第一个
    if (![11, 17, 23, 24, 25].includes(type - 0)) { 
      if (Array.isArray(question.questionlist) && question.questionlist.length > 0) {
        question = question.questionlist[0]
        type = question.type
      }
    }
    question = getQuestionWithAdapter(question);
    this.handleEachQuestion(question, mode)
    if (
      question.type === 24 &&
      question.subQuestions &&
      question.subQuestions.length > 0
    ) {
      question.subQuestions.forEach((it, j) => {
        it.index = j + 1;
        this.handleEachQuestion(it, mode)
      });
    }
    return question
  }
  initPlayedTimes(question, lisCount) {
    if (question.link && question.link.length > 0) {
      let count = 0
      lisCount = lisCount || []
      question.link.forEach((it, index) => {
        let isMedia = formatFileType(it.fileUrl) === "audio" || formatFileType(it.fileUrl) === "video"
        if (isMedia) {
          it.playedTimes = lisCount[count] || 0
          question.link.splice(index, 1, it) // 强制更新已播放次数
          count++
        }
      })
    }
  }
  getRecord(answers, question) {
    let userAswer = answers.filter((item) => item.ID == question.questionid);
    let record = userAswer[0] || { answer: [] };
    return record
  }
  handleRecord(record, questionid) {
    let answer = record.answer || "";
    if (typeof answer == "string") {
      record.answer = record.type !== 5 ? answer.split(";") : [answer];
    }
    if (record.type === 5) {
      let files = [];
      if (record.studentFiles) {
        let fileList =
          typeof record.studentFiles == "string"
            ? JSON.parse(record.studentFiles)
            : record.studentFiles;
        fileList.forEach((file) => {
          let stuFile = new Attach(file)
          stuFile.index = file.index
          stuFile.questionId = questionid
          stuFile = stuFile.handleOldAttach(stuFile)
          files.push(stuFile)
        })
      }
      record.attachments = files;
    }
    return record
  }
  handleOldData(record, question) {
    record = this.handleRecord(record, question.questionid)
    record.id = record.ID;
    question.record = record;
    let arr = record.answer.filter(it => (it || '').trim().length === 0)
    question.isEdit = (record.answer.length > 0 && !arr.length) || (record.attachments && record.attachments.length > 0)
    this.initPlayedTimes(question, record.lisCount)
  }
  initAnswer(tabs) {
    let answers = tabs || [];
    this.part.forEach((part) => {
      part.children.forEach((question) => {
        if (question.subQuestions && question.subQuestions.length > 0) {
          if (question.type === 24) {
            let parentLisCount = []
            question.subQuestions.forEach((it) => {
              let record = this.getRecord(answers, it)
              parentLisCount = record.parentLisCount || []
              this.handleOldData(record, it);
            });
            this.initPlayedTimes(question, parentLisCount)
          } else {
            let answer = []
            let record = {}
            let isEdit = true
            let parentLisCount = []
            question.subQuestions.forEach((it) => {
              let record = this.getRecord(answers, it)
              parentLisCount = record.parentLisCount || []
              let eachAnswer = record.answer || "";
              if (eachAnswer.length === 0) {
                isEdit = false
              }
              answer.push(eachAnswer);
            });
            record.answer = answer;
            record.id = record.ID;
            question.record = record;
            this.initPlayedTimes(question, parentLisCount)
            question.isEdit = isEdit
          }
        } else {
          this.handleOldData(this.getRecord(answers, question), question);
        }
      });
    });
  }
  // 收集选项乱序的顺序
  collectOptionsOrder(question, answers) {
    if (this.optionOrderBreak && (question.type == 1 || question.type == 2)) {
      answers.choiceId = []
      var choiceItem = {
        "ID": question.questionid,
        "choices": []
      }
      question.choices && question.choices.forEach((it, i) => {
        choiceItem.choices.push({
          "choiceId": it.choiceId,
          "orderIndex": i + 1
        })
        if (answers.answer && (answers.answer.indexOf(String.fromCharCode("A".charCodeAt(0) + i)) > -1)) {
          answers.choiceId.push(it.choiceId)
        }
      })
      this.choiceItems.push(choiceItem)
    }
  }
  getTitleLisCount(it) {
    let lisCount = []
    if (it.link && it.link.length > 0) {
      let playedTimes = []
      it.link.forEach(file => {
        if (file.playedTimes !== undefined) {
          playedTimes.push(file.playedTimes || 0)
        }
      })
      lisCount = playedTimes
    }
    return lisCount
  }
  getTabItem(it, answer) {
    if (answer && typeof answer !== "string" && [1, 4, 5, 16, 17, 19].includes(it.type)) {
      answer = answer.join("") || ""
    }
    let item = {
      ID: it.questionid,
      answer: answer || "",
      type: it.type,
      score: it.score
    }
    if (it.record && it.record.grade) {
      item.grade = it.record.grade
    }
    if (it.type === 5 && this.enableUpload && it.record.attachments) {
      let studentFiles = []
      it.record.attachments.forEach((file, index) => {
        let stuFile = new Attach(file)
        stuFile.index = index
        stuFile.questionId = it.questionid
        stuFile = stuFile.handleOldAttach(stuFile)
        const { location, contentSize, title, mimeType, markedImage, angle, progress, type } = stuFile
        studentFiles.push({ location, contentSize, title, mimeType, markedImage, angle, progress, type })
        // 检测全部附件是否上传完成
        if (location.indexOf("http") !== 0) {
          this.allUploadedMsg = file.status === 3 ? 'uploadFailTipNew' : 'saveTipAboutUpload'
        }
      })
      item.studentFiles = studentFiles
    }
    return item
  }
  getAnswer() {
    let tabs = []
    let index = 1
    this.choiceItems = []
    this.allUploadedMsg = ''
    this.part.forEach((part) => {
      part.children.forEach((question) => {
        if (question.subQuestions && question.subQuestions.length > 0) {
          // 添加大题的顺序
          if (this.questionOrderBreak) {
            tabs.push({
              ID: question.questionid,
              orderIndex: index,
              answer: "",
              type: question.type,
              score: 0
            });
            index++
          }
          let parentLisCount = this.getTitleLisCount(question)
          question.subQuestions.forEach((it, i) => {
            let answer = question.type === 24 ? it.record.answer : question.record.answer[i]
            let item = this.getTabItem(it, answer)
            if (question.type === 24) {
              item.lisCount = this.getTitleLisCount(it)
            }
            item.parentLisCount = parentLisCount
            if (this.questionOrderBreak) {
              item.orderIndex = index;
              index++
            }
            if (question.type === 24) {
              this.collectOptionsOrder(it, item)
            }
            tabs.push(item);
          });
        } else {
          let item = this.getTabItem(question, question.record.answer)
          item.lisCount = this.getTitleLisCount(question)
          if (this.questionOrderBreak) {
            item.orderIndex = index;
            index++
          }
          this.collectOptionsOrder(question, item)
          tabs.push(item);
        }
      });
    });
    return tabs
  }
  checkNotAnswerList() {
    let notAnswer = [];
    this.part &&
      this.part.forEach((item) => {
        item.children &&
          item.children.forEach((question) => {
            if (
              question.type === 24 &&
              question.subQuestions &&
              question.subQuestions.length > 0
            ) {
              question.subQuestions.forEach((it) => {
                if (!it.isEdit) {
                  notAnswer.push(it.index);
                }
              });
            } else if (question.type !== 24) {
              if (!question.isEdit) {
                notAnswer.push(question.index);
              }
            }
          });
      });
    return notAnswer;
  }
  /**
 * 检查答案是否正确
 * @param {number} type 题目类型
 * @param {*} studentAnswer 学生答案
 * @param {*} referAnswer 参考答案
 * @param {number} blankOrder 填空题相关
 */
  checkAnswer(type, studentAnswer, referAnswer, blankOrder, subQuestions) {
    if (type === 3) {
      const checkResult = new Array(referAnswer.length).fill(false)
      // 半角字符转全角字符
      var charH2FUtil = (hAngleChar) => {
        let fAngleChar = '';
        var arr = hAngleChar.split('')
        for (var i = 0; i < arr.length; i++) {
          // /**
          //  * 特殊字符跳过处理：将对应的字符编码放入数组中
          //  * 例：65292为中文逗号，保留该符号不被转换
          //  */
          // if ([65292].indexOf(hAngleChar[i].charCodeAt(i)) > -1) {
          //   fAngleChar += String.fromCharCode(hAngleChar[i].charCodeAt(i));
          //   continue;
          // }
          if (arr[i].charCodeAt() > 65248 && arr[i].charCodeAt() < 65375) {
            fAngleChar += String.fromCharCode(arr[i].charCodeAt() - 65248);
          } else {
            fAngleChar += String.fromCharCode(arr[i].charCodeAt());
          }
        }
        return fAngleChar;
      };
      if (blankOrder === 0) {
        // 不可以互换
        const length = Math.min(studentAnswer.length, referAnswer.length)
        for (let i = 0; i < length; i++) {
          const refers = (referAnswer[i] || '').split('//')
          const stu = (studentAnswer[i] || '').trim().replace(/\s+/g, " ").replace(/[.。,，\"\\:]/g, "")
          const status = refers.some(it => {
            const subRefer = (it || '').trim().replace(/\s+/g, " ").replace(/[.。,，\"\\:]/g, "")
            return subRefer && charH2FUtil(subRefer.toLowerCase()) === charH2FUtil(stu.toLowerCase())
          })
          checkResult[i] = status
        }
      } else {
        // 填空可以互换
        for (let i = 0; i < referAnswer.length; i++) {
          const refers = (referAnswer[i] || '').split('//')
          for (let j = 0; j < refers.length; j++) {
            const subRefer = refers[j].trim().replace(/\s+/g, " ").replace(/[.。,，\"\\:]/g, "")
            if (subRefer) {
              const index = studentAnswer.findIndex((it, index) => {
                const stu = (it || '').trim().replace(/\s+/g, " ").replace(/[.。,，\"\\:]/g, "")
                return charH2FUtil(subRefer.toLowerCase()) === charH2FUtil(stu.toLowerCase()) && !checkResult[index]
              })
              if (index >= 0) {
                checkResult[index] = true
                break
              }
            }
          }
        }
      }
      return checkResult
    } else if (type === 12) {
      let checkResult = new Array(referAnswer.length).fill(false)
      referAnswer.forEach((it, index) => {
        if (it === studentAnswer[index]) {
          checkResult[index] = true
        }
      })
      return checkResult
    } else if ([11, 23, 17].includes(type)) {
      let checkResult = []
      if (subQuestions && subQuestions.length > 0) {
        checkResult = new Array(subQuestions.length).fill(false)
        subQuestions.forEach((it, index) => {
          if (it.correctAnswer[0] === studentAnswer[index]) {
            checkResult[index] = true
          }
        })
      }
      return checkResult
    } else if (type !== 25) {
      studentAnswer.sort()
      referAnswer.sort()
      if (type === 4) {
        return studentAnswer.join('').toLowerCase() === referAnswer.join('').toLowerCase()
      }
      return studentAnswer.join('') === referAnswer.join('')
    }
  }
}

export class Section {
  constructor({
    paperpartid,
    partname = "",
    score = 0,
    count = 0,
    partDesc = "",
    type = 0,
    children = []
  }) {
    this.paperpartid = paperpartid;
    this.partname = partname;
    this.score = score;
    this.count = count;
    this.partDesc = partDesc;
    this.type = type;
    this.children = children;
  }
}