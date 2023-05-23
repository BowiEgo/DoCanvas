import { createLayoutBox } from '../layout'
import { isAuto } from '../utils'
import { createBoundCurves } from './canvas/boundCurves'

export function toRenderInline(renderObject) {
  renderObject.type = 'inline'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize

  function layout() {
    const {
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      width,
      height
    } = renderObject.computedStyles
    const parentBox = renderObject.parent.layoutBox

    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(parentBox, 0, 0, 200, 18)
    } else {
      const prevSiblingBox = renderObject.prevSibling
        ? renderObject.prevSibling.layoutBox
        : null

      let top = parentBox.top
      let left = parentBox.left
      let w =
        Number(borderLeftWidth) +
        Number(paddingLeft) +
        Number(width) +
        Number(paddingRight) +
        Number(borderRightWidth)
      let h =
        Number(borderTopWidth) +
        Number(paddingTop) +
        Number(height) +
        Number(paddingBottom) +
        Number(borderBottomWidth)

      renderObject.layoutBox.setTop(top)
      renderObject.layoutBox.setLeft(left)
      renderObject.layoutBox.setWidth(w)
      renderObject.layoutBox.setHeight(h)
    }

    console.log(
      '3333layout-inline',
      renderObject.element.type,
      renderObject.layoutBox
    )
  }

  function measureBoxSize() {
    const parentBox = renderObject.parent.layoutBox
    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(parentBox, 0, 0, 200, 18)
    }
    renderObject.children[0].measureBoxSize()

    console.log('3333-measureBoxSize-line', renderObject, renderObject.children)
    if (renderObject.hasChildren()) {
      renderObject.computedStyles.width = renderObject.children.reduce(
        (acc, curr) => {
          return acc + Number(curr.computedStyles.width)
        },
        0
      )

      renderObject.computedStyles.height = renderObject.children.reduce(
        (acc, curr) => {
          return acc + Number(curr.computedStyles.height)
        },
        0
      )
    }
    renderObject.parent.measureBoxSize()
  }
  return renderObject
}
