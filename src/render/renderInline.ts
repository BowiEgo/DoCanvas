import { createLayoutBox } from '../layout'
import { isAuto } from '../utils'
import { createBoundCurves } from './canvas/boundCurves'
import { createLineBox } from './lineBox'
import { RenderObject } from './renderObject'

export interface RenderInline extends RenderObject {
  type: string
  layout(): void
  measureBoxSize(): void
}

export function toRenderInline(renderObject) {
  renderObject.type = 'inline'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize

  function layout() {
    console.log('layout-inline', renderObject.element.id)
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
    const prevSiblingBox = renderObject.prevSibling
      ? renderObject.prevSibling.layoutBox
      : null

    console.log('layout-inline:prevSibling', renderObject.prevSibling)

    if (
      renderObject.prevSibling &&
      renderObject.prevSibling.type === 'inline'
    ) {
      renderObject.line = renderObject.prevSibling.line
      renderObject.line.add(renderObject)
    } else {
      console.log('11111', renderObject)
      renderObject.line = createLineBox(renderObject)
    }

    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(parentBox, 0, 0, 0, 18)
    } else {
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

      let top = renderObject.line.layoutBox.top
      let left = renderObject.line.layoutBox.left

      renderObject.layoutBox.setTop(top)
      renderObject.layoutBox.setLeft(left)
      renderObject.layoutBox.setWidth(w)
      renderObject.layoutBox.setHeight(h)
    }
  }

  function measureBoxSize() {
    console.log('measureBoxSize-inline', renderObject.element.id)
    const parentBox = renderObject.parent.layoutBox
    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(parentBox, 0, 0, 0, 18)
    }

    if (renderObject.hasChildren()) {
      renderObject.computedStyles.width = renderObject.children.reduce(
        (acc, curr) => {
          return acc + Number(curr.computedStyles.width)
        },
        0
      )
      renderObject.layoutBox.setWidth(renderObject.computedStyles.width)

      renderObject.computedStyles.height = renderObject.children.reduce(
        (acc, curr) => {
          return acc + Number(curr.computedStyles.height)
        },
        0
      )

      renderObject.layoutBox.setHeight(renderObject.computedStyles.height)
    }
  }
  return renderObject
}
