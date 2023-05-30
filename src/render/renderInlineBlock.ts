import { CanvasElement } from '../element/element'
import { createLayoutBox } from '../layout/layoutBox-bp'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { LineBox, createLineBox } from './lineBox'
import { RenderInline, createBaseRenderInline } from './renderInline'
import { RenderObjectOptions, createBaseRenderObject } from './renderObject'

export type CreateRenderInlineBlockFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderInlineBlock

export interface RenderInlineBlock extends RenderInline {
  type: string
  initLayout(): void
  layout(): void
  measureBoxSize(): void
  lineBox: LineBox | null
}

export const createBaseRenderInlineBlock =
  () =>
  (o): RenderInlineBlock => {
    let renderInlineBlock = {
      ...o,
      type: 'inline-block',
      initLayout
    }

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
      } = this.element.computedStyles

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

      if (!this.layoutBox) {
        this.layoutBox = createLayoutBox(
          this.lineBox.layoutBox,
          this.lineBox.layoutBox.top,
          this.lineBox.layoutBox.left,
          w,
          h
        )
      }
    }

    return renderInlineBlock
  }

export const createRenderInlineBlock: CreateRenderInlineBlockFn =
  function RenderInlineBlock(element, options) {
    return pipe(
      createTreeNode(),
      createBaseRenderObject(element, (options = {})),
      createBaseRenderInline(),
      createBaseRenderInlineBlock(),
      withConstructor(RenderInlineBlock)
    )({} as RenderInlineBlock)
  }
