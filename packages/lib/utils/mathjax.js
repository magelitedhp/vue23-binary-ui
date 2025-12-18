export function renderMath(el = document.body) {
  try {
    if (!window.MathJax) return
    window.MathJax.typesetPromise && window.MathJax.typesetPromise([el]).catch(() => { })
  } catch (error) {
    console.log(error, 'error')
  }
}