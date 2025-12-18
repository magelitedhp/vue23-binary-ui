import MyButton from './button'
import MyTinyButton from './tiny-button'
import MyTinyRadio from './tiny-radio'
import Choice from './components/QuestionType/Choice'
import Completion from './components/QuestionType/Completion'
import Judge from './components/QuestionType/Judge'
import { loadScript } from "@/utils"
import "@/styles/opentiny.scss"
import "@/styles/index.scss"
import "@/styles/variables.scss"
import "@/styles/mixin.scss"
// window.MathJax = {
//   tex: {
//     inlineMath: [['$', '$'], ['\\(', '\\)']]
//   },
//   options: {
//     skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'annotation', 'annotation-xml'],
//     skipHtmlClass: 'no-math', // 跳过带有这个 class 的元素
//     ignoreHtmlClass: 'tex2jax_ignore' // 也可以用这个
//   }
// };
loadScript('3rdlib/mathjax-3.2.2/tex-mml-svg.js')
export { 
  MyButton, 
  MyTinyButton,
  MyTinyRadio,
  Choice,
  Completion,
  Judge
}

const components = [
  MyButton, 
  MyTinyButton,
  MyTinyRadio,
  Choice,
  Completion,
  Judge
]

const install = app => {
  components.forEach(comp => app.use(comp))
}

export default { install }