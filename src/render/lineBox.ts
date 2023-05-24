import { LayoutBox, createLayoutBox } from '../layout'
import { RenderInline } from './renderInline'

export interface LineBox {
  lines: RenderInline[][]
  layoutBox: LayoutBox
  endX: number
  add(renderInline: RenderInline): void
}

export function createLineBox(firstItem): LineBox {
  let lineBox = {
    lines: [[firstItem]],
    layoutBox: null,
    endX: 0,
    add
  }

  function add(renderInline) {
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
    } = renderInline.computedStyles

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

    let testWidth = lineBox.endX + w
    if (testWidth > renderInline.parent.computedStyles.width) {
      console.log(
        'h:',
        lineBox.layoutBox.height,
        Number(renderInline.computedStyles.height)
      )

      lineBox.lines.push([renderInline])
      lineBox.endX = Number(renderInline.computedStyles.width)
      lineBox.layoutBox.setHeight(
        lineBox.layoutBox.height + Number(renderInline.computedStyles.height)
      )
    } else {
      lineBox.lines[lineBox.lines.length - 1].push(renderInline)
      lineBox.endX += Number(renderInline.computedStyles.width)

      if (lineBox.endX > renderInline.layoutBox.width)
        lineBox.layoutBox.setWidth(renderInline.line.endX)
    }
  }

  const parentBox = firstItem.parent.layoutBox
  const prevSiblingBox = firstItem.prevSibling
    ? firstItem.prevSibling.layoutBox
    : null

  let top = parentBox.top + (prevSiblingBox ? prevSiblingBox.bottom : 0)
  let left = parentBox.left
  let w = Number(firstItem.computedStyles.width)
  let h = Number(firstItem.computedStyles.height)

  lineBox.layoutBox = createLayoutBox(
    firstItem.parent.layoutBox,
    top,
    left,
    w,
    h
  )

  lineBox.endX = w

  return lineBox
}
