import { LayoutBox, createLayoutBox } from '../layout/layoutBox-bp'
import { RenderInline } from './renderInline'

export interface LineBox {
  lines: RenderInline[]
  layoutBox: LayoutBox
  add(renderInline: RenderInline): void
}

export function createLineBox(parentLayoutBox): LineBox {
  let lineBox = {
    lines: [],
    layoutBox: null,
    add
  }

  function _init(renderInline, parentBox, prevBox) {
    let top = prevBox ? prevBox.bottom : parentBox.top
    let left = parentBox.left
    let w = Number(renderInline.element.getComputedStyles().width)
    let h = Number(renderInline.element.getComputedStyles().height)

    lineBox.layoutBox.setTop(top)
    lineBox.layoutBox.setLeft(left)
    lineBox.layoutBox.setWidth(w)
    lineBox.layoutBox.setHeight(h)

    renderInline.layoutBox.setTop(top)
    renderInline.layoutBox.setLeft(left)
    renderInline.type === 'inline-block' && renderInline.layoutBox.setWidth(w)
    renderInline.type === 'inline-block' && renderInline.layoutBox.setHeight(h)

    lineBox.lines = [renderInline]
  }

  function add(renderInline) {
    if (lineBox.lines.length === 0) {
      _init(
        renderInline,
        renderInline.getContainer().layoutBox,
        renderInline.previousSibling ? renderInline.previousSibling.layoutBox : null
      )
      return
    }
    const { borderLeftWidth, borderRightWidth, paddingLeft, paddingRight, width } =
      renderInline.element.getComputedStyles()

    let w =
      Number(borderLeftWidth) +
      Number(paddingLeft) +
      Number(width) +
      Number(paddingRight) +
      Number(borderRightWidth)

    let testWidth = lineBox.layoutBox.width + w
    if (testWidth > renderInline.getContainer().element.getComputedStyles().width) {
      console.log(
        'h:',
        testWidth,
        renderInline,
        lineBox.layoutBox.height,
        Number(renderInline.element.getComputedStyles().height)
      )

      renderInline.lineBox = createLineBox(renderInline.getContainer().layoutBox)
      renderInline.lineBox.add(renderInline)
    } else {
      lineBox.lines.push(renderInline)
      renderInline.layoutBox.setTop(lineBox.layoutBox.top)
      renderInline.layoutBox.setLeft(renderInline.previousSibling.layoutBox.right)

      lineBox.layoutBox.setWidth(
        lineBox.layoutBox.width + Number(renderInline.element.getComputedStyles().width)
      )
    }
  }

  lineBox.layoutBox = createLayoutBox(parentLayoutBox, 0, 0, 0, 0)

  return lineBox
}
