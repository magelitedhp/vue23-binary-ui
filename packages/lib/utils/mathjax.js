import { loadScript } from "@/utils"
export function renderMath(el = document.body) {
  try {
    if (!window.MathJax) return
    window.MathJax.typesetPromise && window.MathJax.typesetPromise([el]).catch(() => { })
  } catch (error) {
    console.log(error, 'error')
  }
}
export function initMathJax() {
  try {
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          packages: { '[+]': ['ams'] }, // 加载AMS扩展
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
          ],
          displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]'],
          ]
        },
        // 配置MathML输入
        mathml: {
          displayAlign: 'center', // MathML公式居中显示
        },
        // 配置SVG输出
        svg: {
          fontCache: 'global', // 全局缓存字体以提高性能
          scale: 1.0, // 公式缩放比例
          displayAlign: 'center', // SVG公式居中显示
        },
        options: {
          ignoreHtmlClass: 'script|noscript|style|textarea|pre|code|a', // 忽略带有该类的元素
          enableMenu: false,
        },
        startup: {
          // 禁用自动渲染, 后续通过代码手动控制渲染时机
          typeset: false,
        },
      }
    }
    loadScript('3rdlib/mathjax-3.2.2/tex-mml-svg.js')
  } catch (err) {
    console.log(err)
  }
}
