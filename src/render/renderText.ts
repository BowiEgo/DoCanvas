import { pipe, withConstructor } from '../utils'
import { createTreeNode } from '../tree-node'
import {
  RenderObject,
  RenderObjectOptions,
  RenderType,
  createBaseRenderObject,
  isRenderObject
} from './renderObject'
import { CanvasTextNode } from '../element/textNode'

type TextStyles = {
  color: string
  fontSize: number
  fontWeight: string
  lineHeight: number
}

export type CreateRenderTextFn = (
  element: CanvasTextNode,
  options?: RenderObjectOptions
) => RenderText

export interface RenderText extends RenderObject {
  getTextStyles(): TextStyles
}

export function isRenderText(value: any): value is RenderText {
  if (!isRenderObject(value)) return false
  return !!(value.type & RenderType.TEXT)
}

export const createRenderText: CreateRenderTextFn = function RenderText(
  element,
  options
) {
  return pipe(
    createTreeNode<RenderObject>(),
    createBaseRenderObject(element, (options = {})),
    createBaseRenderText(),
    withConstructor(RenderText)
  )({} as RenderText)
}

export const createBaseRenderText =
  () =>
  (o: RenderObject): RenderText => {
    let renderText: RenderText = {
      ...o,
      type: RenderType.TEXT,
      getTextStyles
    }

    return renderText
  }

function getTextStyles(this: RenderText) {
  const parentStyles = this.element.getContainer().getComputedStyles()
  const { color, fontSize, fontWeight, lineHeight } = parentStyles

  return {
    color,
    fontSize,
    fontWeight,
    lineHeight
  }
}
