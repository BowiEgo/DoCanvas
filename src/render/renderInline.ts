import { createLayoutBox } from '../layout'
import { LineBox, createLineBox } from './lineBox'
import { RenderObject } from './renderObject'

export interface RenderInline extends RenderObject {
  type: string
  layout(): void
  measureBoxSize(): void
  lineBox: LineBox | null
}

export function toRenderInline(renderObject): RenderInline {
  renderObject.type = 'inline'
  renderObject.layout = layout
  renderObject.measureBoxSize = measureBoxSize
  renderObject.lineBox = null
  renderObject.initLayout = initLayout

  function initLayout() {
    if (!renderObject.layoutBox) {
      renderObject.layoutBox = createLayoutBox(
        renderObject.lineBox.layoutBox,
        renderObject.lineBox.layoutBox.top,
        renderObject.lineBox.layoutBox.left,
        0,
        0
      )
    }
  }

  function layout() {
    console.log('layout-inline', renderObject.element.id)
    console.log('layout-inline:prevSibling', renderObject.prevSibling)

    if (
      renderObject.prevSibling &&
      renderObject.prevSibling.type.indexOf('inline') > -1
    ) {
      renderObject.lineBox = renderObject.prevSibling.lineBox
    } else {
      renderObject.lineBox = createLineBox(renderObject.parent.layoutBox)
    }

    renderObject.initLayout()
    renderObject.lineBox.add(renderObject)
  }

  function measureBoxSize() {
    console.log('measureBoxSize-inline', renderObject.element.id)

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
  }
  return renderObject
}
