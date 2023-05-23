import { createLayoutBox } from '../layout'

export function toRenderText(renderObject) {
  renderObject.type = 'text'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize
  renderObject.getTextStyles = getTextStyles
  renderObject.textLines = []
  console.log('3333toRenderText', renderObject)

  function layout() {
    const parentBox = renderObject.parent.layoutBox

    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(parentBox, 0, 0, 100, 18)
    } else {
      renderObject.layoutBox.setTop(0)
      renderObject.layoutBox.setLeft(0)
      renderObject.layoutBox.setWidth(100)
      renderObject.layoutBox.setHeight(18)
    }

    const ctx = renderObject.parent.element.context.renderer.ctx

    ctx.save()
    ctx.font = `300 ${renderObject.getTextStyles().fontSize}px Arial`

    const textLines = wrapText(
      ctx,
      renderObject.element,
      0,
      18,
      parentBox.width,
      renderObject.getTextStyles().lineHeight || 20
    )
    ctx.restore()
    // const lineWidth = ctx.measureText(renderObject.element)
    renderObject.textLines = textLines
    console.log(
      '3333layout-text',
      renderObject.element,
      renderObject.layoutBox,
      parentBox.width,
      textLines
    )
  }

  function measureBoxSize() {
    console.log('measureBoxSize-text')
    renderObject.computedStyles.width = 100
    renderObject.computedStyles.height = 18
  }

  function getTextStyles() {
    const parentStyles = renderObject.parent.computedStyles
    const { color, fontSize, fontWeight } = parentStyles
    console.log('4444getTextStyles', renderObject.parent)

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

    for (var n = 0; n < words.length; n++) {
      testLine += `${words[n]} `
      let metrics = ctx.measureText(testLine)
      let testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
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
    return lineArray
  }

  return renderObject
}
