import { CanvasElement } from '../element/element'
import { createLayoutBox } from '../layout/layoutBox-bp'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { LineBox, createLineBox } from './lineBox'
import { RenderObject, RenderObjectOptions, createBaseRenderObject } from './renderObject'

export type CreateRenderInlineFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderInline

export interface RenderInline extends RenderObject {
  type: string
  lineBox: LineBox | null
  initLayout(): void
  layout(): void
  measureBoxSize(): void
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
      type: 'inline',
      lineBox: null,
      initLayout,
      layout,
      measureBoxSize
    }

    Object.setPrototypeOf(renderInline, o)

    return renderInline
  }

function initLayout(this: RenderInline) {
  this.layoutBox = createLayoutBox(
    this.lineBox.layoutBox,
    this.lineBox.layoutBox.top,
    this.lineBox.layoutBox.left,
    0,
    0
  )
}

function layout(this: RenderInline) {
  const prev = this.previousSibling as RenderInline
  if (prev && prev.type.indexOf('inline') > -1) {
    this.lineBox = prev.lineBox
  } else {
    this.lineBox = createLineBox(this.getContainer().layoutBox)
  }

  if (!this.layoutBox) {
    this.initLayout()
  }

  this.lineBox.add(this)
}

function measureBoxSize(this: RenderInline) {
  if (this.hasChildNode()) {
    this.element.setComputedStyles(
      'width',
      this.children.reduce((acc, curr) => {
        return acc + Number(curr.element.getComputedStyles().width)
      }, 0)
    )
    // this.element.getComputedStyles().width = this.children.reduce((acc, curr) => {
    //   return acc + Number(curr.element.getComputedStyles().width)
    // }, 0)

    this.element.setComputedStyles(
      'height',
      this.children.reduce((acc, curr) => {
        return acc + Number(curr.element.getComputedStyles().height)
      }, 0)
    )
  }
}
