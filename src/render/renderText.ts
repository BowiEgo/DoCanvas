// import { splitGraphemes } from '../text/graphemeBreak'
import { LineBreaker } from '../text/lineBreak'
import { fromCodePoint, toCodePoints } from '../text/Util'
import { createLayoutBox } from '../layout'

export function toRenderText(renderObject) {
  renderObject.type = 'text'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize
  renderObject.getTextStyles = getTextStyles
  renderObject.textLines = []

  function layout() {
    console.log('layout-text', renderObject.element)
    const { width, height } = renderObject.computedStyles
    const parentBox = renderObject.parent.layoutBox

    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(parentBox, 0, 0, 100, 18)
    } else {
      let top = parentBox.top
      let left = parentBox.left
      renderObject.layoutBox.setTop(top)
      renderObject.layoutBox.setLeft(left)
      renderObject.layoutBox.setWidth(width)
      renderObject.layoutBox.setHeight(height)
    }
  }

  function measureBoxSize() {
    console.log('measureBoxSize-text', renderObject.element)
    const ctx = renderObject.parent.element.context.renderer.ctx
    ctx.save()
    ctx.font = `normal ${renderObject.getTextStyles().fontSize}px PingFang SC`

    const words = breakWords(renderObject.element, renderObject.computedStyles)

    const textLines = wrapText(
      ctx,
      words,
      0,
      0,
      renderObject.parent.parent.computedStyles.width,
      renderObject.getTextStyles().lineHeight || 23
    )
    ctx.restore()
    renderObject.textLines = textLines
    renderObject.computedStyles.width = textLines.maxLineWidth
    renderObject.computedStyles.height = textLines.outerHeight
  }

  function getTextStyles() {
    const parentStyles = renderObject.parent.computedStyles
    const { color, fontSize, fontWeight } = parentStyles

    return {
      color,
      fontSize,
      fontWeight
    }
  }

  function wrapText(ctx, words, x, y, maxWidth, lineHeight) {
    let line = ''
    let testLine = ''
    let lineArray = []
    let maxLineWidth = 0
    y = lineHeight

    for (var n = 0; n < words.length; n++) {
      testLine += words[n]
      let metrics = ctx.measureText(testLine)
      let testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        lineArray.push([line.trim(), x, y])

        y += lineHeight
        line = words[n]
        testLine = words[n]
      } else {
        line += words[n]
      }
      if (n === words.length - 1) {
        lineArray.push([line.trim(), x, y])
      }
    }
    return {
      lines: lineArray,
      maxLineWidth,
      outerHeight: lineArray[lineArray.length - 1][2]
    }
  }

  // https://drafts.csswg.org/css-text/#word-separator
  const wordSeparators = [
    0x0020, 0x00a0, 0x1361, 0x10100, 0x10101, 0x1039, 0x1091
  ]

  const breakWords = (str: string, styles): string[] => {
    const breaker = LineBreaker(str, {
      lineBreak: styles.lineBreak,
      wordBreak: 'normal'
    })

    const words = []
    let bk

    while (!(bk = breaker.next()).done) {
      if (bk.value) {
        const value = bk.value.slice()
        const codePoints = toCodePoints(value)
        let word = ''
        codePoints.forEach((codePoint) => {
          if (wordSeparators.indexOf(codePoint) === -1) {
            word += fromCodePoint(codePoint)
          } else {
            if (word.length) {
              words.push(word)
            }
            words.push(fromCodePoint(codePoint))
            word = ''
          }
        })

        if (word.length) {
          words.push(word)
        }
      }
    }

    return words
  }

  return renderObject
}
