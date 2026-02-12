import Choice from './components/QuestionType/Choice'
import Completion from './components/QuestionType/Completion'
import Judge from './components/QuestionType/Judge'
import "@/styles/opentiny.scss"
import "@/styles/index.scss"
import "@/styles/variables.scss"
import "@/styles/mixin.scss"
import "@/styles/fluent-editor.scss"
import { initMathJax } from './utils/mathjax'
initMathJax()
export { 
  Choice,
  Completion,
  Judge
}

const components = [
  Choice,
  Completion,
  Judge
]

const install = app => {
  components.forEach(comp => app.use(comp))
}

export default { install }