import { CanvasElement } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { initCurves } from './renderBlock'
import { RenderInline, createBaseRenderInline } from './renderInline'
import {
  RenderInlineBlock,
  createBaseRenderInlineBlock,
  isRenderInlineBlock
} from './renderInlineBlock'
import {
  RenderObject,
  RenderObjectOptions,
  RenderType,
  createBaseRenderObject
} from './renderObject'

export type CreateRenderImageFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderImage

export interface RenderImage extends RenderInlineBlock {}

export function isRenderImage(value: any): value is RenderImage {
  if (!isRenderInlineBlock(value)) return false
  return !!(value.type & RenderType.IMAGE)
}

export const createRenderImage: CreateRenderImageFn = function RenderImage(
  element,
  options
) {
  return pipe(
    createTreeNode<RenderObject>(),
    createBaseRenderObject(element, (options = {})),
    createBaseRenderInlineBlock(),
    createBaseRenderImage(element),
    withConstructor(RenderImage)
  )({} as RenderImage)
}

export const createBaseRenderImage =
  (element: CanvasElement) =>
  (o: RenderInline): RenderImage => {
    let renderImage: RenderImage = {
      ...o,
      type: RenderType.IMAGE,
      initCurves
    }

    element
      .getContext()
      .cache.addImage(element._options.src)
      .then((image) => {
        element.setComputedStyles(
          'height',
          (image.naturalHeight / image.naturalWidth) *
            Number(element.getComputedStyles().width)
        )

        element.getContext().reflow(element.getContainer())
      })

    // console.log(element.getContainer().getLayoutObject().rect)

    return renderImage
  }
