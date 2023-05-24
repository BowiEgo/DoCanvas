import { createLayoutBox } from '../layout'
import { isAuto } from '../utils'

export function toRenderBlock(renderObject) {
  renderObject.type = 'block'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize

  function layout() {
    console.log('layout-block', renderObject.element.id)
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
        ? renderObject.prevSibling.layoutBox
        : null

      let top = parentBox.top + (prevSiblingBox ? prevSiblingBox.bottom : 0)
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

      if (!renderObject.layoutBox) {
        renderObject.layoutBox = createLayoutBox(parentBox, top, left, w, h)
      } else {
        renderObject.layoutBox.setTop(top)
        renderObject.layoutBox.setLeft(left)
        renderObject.layoutBox.setWidth(w)
        renderObject.layoutBox.setHeight(h)
      }
    }
  }

  // measure box size
  function measureBoxSize() {
    console.log('measureBoxSize-block', renderObject.element.id)
    let { width, height } = renderObject.renderStyles

    if (renderObject.isRoot()) {
      renderObject.computedStyles.width = renderObject.viewport.width
      renderObject.computedStyles.height = renderObject.viewport.height
    }

    if (renderObject.hasChildren()) {
      if (isAuto(width)) {
        if (renderObject.children.length > 1) {
          renderObject.computedStyles.width = renderObject.children.reduce(
            (acc, curr) => {
              return Number(curr.computedStyles.width) > acc
                ? Number(curr.computedStyles.width)
                : acc
            },
            0
          )
        } else {
          renderObject.computedStyles.width = Number(
            renderObject.children[0].computedStyles.width
          )
        }
      }

      if (isAuto(height)) {
        if (renderObject.children.length > 1) {
          renderObject.computedStyles.height = renderObject.children.reduce(
            (acc, curr) => {
              return acc + Number(curr.computedStyles.height), 0
            }
          )
        } else {
          renderObject.computedStyles.height = Number(
            renderObject.children[0].computedStyles.height
          )
        }
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
