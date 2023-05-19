import { createLayoutBox } from '../layout'
import { isAuto } from '../utils'

export function toRenderBlock(renderObject) {
  renderObject.type = 'block'
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

    if (renderObject.isRoot()) {
      if (!renderObject.layoutBox) {
        renderObject.layoutBox = createLayoutBox(
          null,
          0,
          0,
          renderObject.viewport.width,
          renderObject.viewport.height
        )
      }
    } else {
      const parentBox = renderObject.parent.layoutBox
      const prevSiblingBox = renderObject.prevSibling
        ? renderObject.layoutBox
        : null

      let top = parentBox.top + (prevSiblingBox ? prevSiblingBox.bottom : 0)
      let left = parentBox.left + (prevSiblingBox ? prevSiblingBox.right : 0)
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

      if (!renderObject.layoutBox) {
        renderObject.layoutBox = createLayoutBox(parentBox, top, left, w, h)
      } else {
        renderObject.layoutBox.setTop(top)
        renderObject.layoutBox.setLeft(left)
        renderObject.layoutBox.setWidth(w)
        renderObject.layoutBox.setHeight(h)
      }
    }
    console.log(
      '3333layout-block',
      renderObject.element.type,
      renderObject.element,
      renderObject.layoutBox
    )
  }

  // measure box size
  function measureBoxSize() {
    console.log('1111computeStyle')
    let { width, height } = renderObject.renderStyles

    if (renderObject.isRoot()) {
      renderObject.computedStyles.width = renderObject.viewport.width
      renderObject.computedStyles.height = renderObject.viewport.height
    }

    if (renderObject.hasChildren()) {
      if (isAuto(width)) {
        renderObject.computedStyles.width = renderObject.children.reduce(
          (prev, curr) => {
            console.log('1111prev', prev)
            return (
              (prev ? Number(prev.computedStyles.width) : 0) +
              Number(curr.computedStyles.width)
            )
          }
        )
      }

      if (isAuto(height)) {
        renderObject.computedStyles.height = renderObject.children.reduce(
          (prev, curr) => {
            return (
              (prev ? Number(prev.computedStyles.height) : 0) +
              Number(curr.computedStyles.height)
            )
          }
        )
      }
    } else {
      if (isAuto(width)) {
        renderObject.computedStyles.width = 0
      }

      if (isAuto(height)) {
        renderObject.computedStyles.height = 0
      }
    }
  }

  return renderObject
}
