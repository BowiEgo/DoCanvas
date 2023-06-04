import { CanvasElement } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import {
  RenderObject,
  RenderObjectOptions,
  RenderType,
  createBaseRenderObject,
  isRenderObject
} from './renderObject'

export type CreateRenderInlineFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderInline

export interface RenderInline extends RenderObject {}

export function isRenderInline(value: any): value is RenderInline {
  if (!isRenderObject(value)) return false
  return !!(value.type & RenderType.INLINE)
}

export const createRenderInline: CreateRenderInlineFn = function RenderInline(
  element,
  options = {}
) {
  return pipe(
    createTreeNode<RenderObject>(),
    createBaseRenderObject(element, options),
    createBaseRenderInline(),
    withConstructor(RenderInline)
  )({} as RenderInline)
}

export const createBaseRenderInline =
  () =>
  (o: RenderObject): RenderInline => {
    let renderInline: RenderInline = {
      ...o,
      type: RenderType.INLINE
    }

    Object.setPrototypeOf(renderInline, o)

    return renderInline
  }
