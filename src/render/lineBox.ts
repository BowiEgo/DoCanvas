import { LayoutBox, createLayoutBox } from '../layout'
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

  function _init(renderInline) {
    const parentBox = renderInline.parent.layoutBox
    const prevSiblingBox = renderInline.prevSibling
      ? renderInline.prevSibling.layoutBox
      : null
    // const prevLineBox = renderInline.prevSibling ? renderInline.prevSibling.lineBox : null

    let top = prevSiblingBox ? prevSiblingBox.bottom : parentBox.top
    let left = parentBox.left
    let w = Number(renderInline.computedStyles.width)
    let h = Number(renderInline.computedStyles.height)

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
      _init(renderInline)
      return
    }
    const {
      borderLeftWidth,
      borderRightWidth,
      paddingLeft,
      paddingRight,
      width
    } = renderInline.computedStyles

    let w =
      Number(borderLeftWidth) +
      Number(paddingLeft) +
      Number(width) +
      Number(paddingRight) +
      Number(borderRightWidth)

    let testWidth = lineBox.layoutBox.width + w
    if (testWidth > renderInline.parent.computedStyles.width) {
      console.log(
        'h:',
        testWidth,
        renderInline,
        lineBox.layoutBox.height,
        Number(renderInline.computedStyles.height)
      )

      renderInline.lineBox = createLineBox(renderInline.parent.layoutBox)
      renderInline.lineBox.add(renderInline)
    } else {
      lineBox.lines.push(renderInline)
      renderInline.layoutBox.setTop(lineBox.layoutBox.top)
      renderInline.layoutBox.setLeft(renderInline.prevSibling.layoutBox.right)

      lineBox.layoutBox.setWidth(
        lineBox.layoutBox.width + Number(renderInline.computedStyles.width)
      )
    }
  }

  lineBox.layoutBox = createLayoutBox(parentLayoutBox, 0, 0, 0, 0)

  return lineBox
}
