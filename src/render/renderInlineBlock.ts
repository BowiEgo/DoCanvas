import { createLayoutBox } from '../layout'
import { LineBox, createLineBox } from './lineBox'
import { RenderInline, toRenderInline } from './renderInline'
import { RenderObject } from './renderObject'

export interface RenderInlineBlock extends RenderInline {
  type: string
  initLayout(): void
  layout(): void
  measureBoxSize(): void
  lineBox: LineBox | null
}

export function toRenderInlineBlock(renderObject): RenderInlineBlock {
  renderObject = toRenderInline(renderObject)
  renderObject.type = 'inline-block'
  renderObject.initLayout = initLayout

  function initLayout() {
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
      renderObject.layoutBox = createLayoutBox(
        renderObject.lineBox.layoutBox,
        renderObject.lineBox.layoutBox.top,
        renderObject.lineBox.layoutBox.left,
        w,
        h
      )
    }
  }

  return renderObject
}
