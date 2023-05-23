import { splitGraphemes } from '../text/graphemeBreak'
import { createLayoutBox } from '../layout'

export function toRenderText(renderObject) {
  renderObject.type = 'text'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize
  renderObject.getTextStyles = getTextStyles
  renderObject.textLines = []
  console.log('3333toRenderText', renderObject)

  function layout() {
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

    console.log(
      '3333layout-text',
      renderObject.element,
      renderObject.layoutBox,
      parentBox.width
    )
  }

  function measureBoxSize() {
    console.log('measureBoxSize-text')
    const parentBox = renderObject.parent.layoutBox
    const ctx = renderObject.parent.element.context.renderer.ctx
    ctx.save()
    ctx.font = `300 ${renderObject.getTextStyles().fontSize}px PingFang SC`

    const textLines = wrapText(
      ctx,
      renderObject.element,
      0,
      16,
      parentBox.width,
      renderObject.getTextStyles().lineHeight || 23
    )
    ctx.restore()
    renderObject.textLines = textLines
    console.log('textLines', textLines)
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

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ')
    let line = ''
    let testLine = ''
    let lineArray = []
    let maxLineWidth = 0

    for (var n = 0; n < words.length; n++) {
      testLine += `${words[n].trim()} `
      let metrics = ctx.measureText(testLine)
      let testWidth = (maxLineWidth = metrics.width)

      if (testWidth > maxWidth && n > 0) {
        if (testWidth > maxLineWidth) {
          maxLineWidth = testWidth
        }
        lineArray.push([line, x, y])
        y += lineHeight
        line = `${words[n]} `
        testLine = `${words[n]} `
      } else {
        line += `${words[n]} `
      }
      if (n === words.length - 1) {
        lineArray.push([line, x, y])
      }
    }
    return {
      lines: lineArray,
      maxLineWidth,
      outerHeight: lineArray[lineArray.length - 1][2]
    }
  }

  return renderObject
}
