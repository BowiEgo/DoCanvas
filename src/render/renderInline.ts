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
  console.log('layout-inline', this, this.element.id)
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
  console.log('measureBoxSize-inline', this)

  if (this.hasChildNode()) {
    this.element.computedStyles.width = this.children.reduce((acc, curr) => {
      return acc + Number(curr.element.computedStyles.width)
    }, 0)

    this.element.computedStyles.height = this.children.reduce((acc, curr) => {
      return acc + Number(curr.element.computedStyles.height)
    }, 0)
  }
}
