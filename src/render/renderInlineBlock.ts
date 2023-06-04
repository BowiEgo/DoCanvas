import { CanvasElement } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { RenderBlock, initCurves } from './renderBlock'
import {
  RenderInline,
  createBaseRenderInline,
  isRenderInline
} from './renderInline'
import {
  RenderObject,
  RenderObjectOptions,
  RenderType,
  createBaseRenderObject
} from './renderObject'

export type CreateRenderInlineBlockFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderInlineBlock

export interface RenderInlineBlock extends RenderInline, RenderBlock {}

export function isRenderInlineBlock(value: any): value is RenderInlineBlock {
  if (!isRenderInline(value)) return false
  return !!(value.type & RenderType.INLINE_BLOCK)
}

export const createRenderInlineBlock: CreateRenderInlineBlockFn =
  function RenderInlineBlock(element, options) {
    return pipe(
      createTreeNode<RenderObject>(),
      createBaseRenderObject(element, (options = {})),
      createBaseRenderInline(),
      createBaseRenderInlineBlock(),
      withConstructor(RenderInlineBlock)
    )({} as RenderInlineBlock)
  }

export const createBaseRenderInlineBlock =
  () =>
  (o: RenderInline): RenderInlineBlock => {
    let renderInlineBlock: RenderInlineBlock = {
      ...o,
      type: RenderType.INLINE_BLOCK,
      initCurves
    }

    return renderInlineBlock
  }
