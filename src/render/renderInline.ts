import { createLayoutBox } from '../layout'

export function toRenderInline(renderObject) {
  renderObject.type = 'inline'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize

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

    console.log(
      '3333layout-inline',
      renderObject.element.type,
      renderObject.layoutBox
    )
  }

  function measureBoxSize() {
    console.log('measureBoxSize-inline')
    renderObject.computedStyles.width = 100
    renderObject.computedStyles.height = 18
  }

  return renderObject
}
