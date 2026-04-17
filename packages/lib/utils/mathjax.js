import { loadScript } from "@/utils"

// 渲染所有预览区域的公式（标题 + 选项内容）
export function renderMath() {
  try {
    if (!window.MathJax) return

    setTimeout(() => {
      
      const selectors = [
        '.preview-title',
        '.math-render-target',
        '.completion-preview',
        '.choice-content',
        '.rich-text'
      ]
      const elements = document.querySelectorAll(selectors.join(', '))

      console.log(elements)

      elements.forEach((el) => {
        if (el && el.textContent.trim() && window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([el]).catch(() => {})
        }
      })
    }, 100)
  } catch (error) {
    console.error('renderMath error:', error)
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
          ],
          extensions: ['mhchem.js', 'extpfeil.js'],
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
    loadScript('3rdlib/mathjax-3.2.2/tex-mml-chtml.js', () => {
      loadScript('3rdlib/mathjax-3.2.2/input/tex/extensions/extpfeil.js')
      loadScript('3rdlib/mathjax-3.2.2/input/tex/extensions/mhchem.js')
      loadScript('3rdlib/mathjax-3.2.2/input/tex/extensions/autoload.js')
    });
  } catch (err) {
    console.log(err)
  }
}
