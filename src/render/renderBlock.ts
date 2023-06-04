import { CanvasElement } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { createBoundCurves } from './canvas/boundCurves'
import { RenderInlineBlock, isRenderInlineBlock } from './renderInlineBlock'
import {
  RenderObject,
  RenderObjectOptions,
  RenderType,
  createBaseRenderObject,
  isRenderObject
} from './renderObject'

export type CreateRenderBlockFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderBlock

export interface RenderBlock extends RenderObject {
  initCurves(): void
}

export function isRenderBlock(value: any): value is RenderBlock {
  if (!isRenderObject(value)) return false
  return !!(value.type & RenderType.BLOCK)
}

export const createRenderBlock: CreateRenderBlockFn = function RenderBlock(
  element,
  options = {}
) {
  return pipe(
    createTreeNode<RenderObject>(),
    createBaseRenderObject(element, options),
    createBaseRenderBlock(),
    withConstructor(RenderBlock)
  )({} as RenderBlock)
}

export const createBaseRenderBlock =
  () =>
  (o: RenderObject): RenderBlock => {
    let renderBlock: RenderBlock = {
      ...o,
      type: RenderType.BLOCK,
      initCurves
    }

    return renderBlock
  }

export function initCurves(this: RenderBlock | RenderInlineBlock) {
  this.curves = createBoundCurves(this.element.getLayoutObject())
  this.children.forEach(
    (child) =>
      (isRenderBlock(child) || isRenderInlineBlock(child)) && child.initCurves()
  )
}
