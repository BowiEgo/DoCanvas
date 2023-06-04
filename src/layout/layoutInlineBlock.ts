import { CanvasElement } from '../element/element'
import { pipe, withConstructor } from '../utils'
import { LayoutBox, createBaseLayoutBox } from './layoutBox'
import { createLayoutInline } from './layoutInline'
import { LayoutType, isLayoutObject } from './layoutObject'

export interface LayoutInlineBlock extends LayoutBox {
  // updateLayout(): void
}

export function generateInlineBlockType() {
  let type = LayoutType.BOX_MODEL
  type |= LayoutType.BOX
  type |= LayoutType.INLINE
  type |= LayoutType.INLINE_BLOCK
  return type
}

export function isLayoutInlineBlock(value: any): value is LayoutInlineBlock {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.INLINE_BLOCK)
}

export const createLayoutInlineBlock = function LayoutInlineBlock(
  element: CanvasElement
) {
  return pipe(
    createBaseLayoutBox(),
    createBaseLayoutInlineBlock(),
    withConstructor(LayoutInlineBlock)
  )(createLayoutInline(element))
}

const createBaseLayoutInlineBlock =
  () =>
  (o: LayoutBox): LayoutInlineBlock => {
    let layoutInlineBlock = {
      ...o,
      type: generateInlineBlockType()
    }

    return layoutInlineBlock
  }
