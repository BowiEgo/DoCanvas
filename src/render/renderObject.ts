import { CanvasElement } from '../element/element'
import { isCanvasTextNode } from '../element/textNode'
import { LayoutBox } from '../layout/layoutBox'
import { TreeNode } from '../tree-node'
import { NOOP } from '../utils'
import { BoundCurves } from './canvas/boundCurves'
import { createRenderBlock } from './renderBlock'
import { createRenderInline } from './renderInline'
import { createRenderInlineBlock } from './renderInlineBlock'
import { createRenderText } from './renderText'

// RenderBlock {HTML} at (0, 0) size 640x480
// |—— RenderBody {BODY} at (0, 80) size 640x480 [bgcolor=# FFFFFF]
// | |—— RenderBlock {P} at (0, 0) size 640x80
// | | |—— RenderText {#text} at (0, 0) size 48x24 "First line."
// | | |—— RenderBR {BR} at (20, 20) size 0x0
// | | |—— RenderText {#text} at (0, 24) size 48x24 "Second one."

export const enum RenderType {
  NONE,
  TEXT = 1 << 1,
  BLOCK = 1 << 2,
  INLINE = 1 << 3,
  INLINE_BLOCK = 1 << 4
}

export type RenderObjectOptions = {}

export type CreateRenderObjectFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => CanvasElement

export interface RenderObject extends TreeNode<RenderObject> {
  // TODO: enum type
  _isRenderObject: boolean
  type: RenderType
  options: RenderObjectOptions
  element: CanvasElement
  viewport: { width: number; height: number } | null
  layoutBox: LayoutBox | null
  curves: BoundCurves
  children: RenderObject[]
  previousSibling: RenderObject | null
  nextSibling: RenderObject | null
  getContainer(): RenderObject
  appendChild(chid: RenderObject): void
  measureBoxSize(): void
  isRoot(): boolean
}

export function isRenderObject(value: any): value is RenderObject {
  return value ? value._isRenderObject === true : false
}

export const createRenderObject = (element, options = {}) => {
  if (element.type === 'body') {
    return createRenderBlock(element, options)
  }
  if (isCanvasTextNode(element)) {
    return createRenderText(element, options)
  }

  switch (element.styles.display) {
    case 'block':
      return createRenderBlock(element, options)
    case 'inline':
      return createRenderInline(element, options)
    case 'inline-block':
      return createRenderInlineBlock(element, options)
    default:
      return createRenderBlock(element, options)
  }
}

export const createBaseRenderObject =
  (element, options = {}) =>
  (o: TreeNode<RenderObject>): RenderObject => {
    let renderObject = {
      ...o,
      _isRenderObject: true,
      type: RenderType.NONE,
      options,
      element,
      get viewport() {
        let rootElm = element.getRootNode()
        return rootElm && rootElm.type === 'body'
          ? rootElm.context.viewport
          : null
      },
      layoutBox: null,
      curves: null,
      get children() {
        return o.children
      },
      getContainer,
      appendChild,
      measureBoxSize: NOOP,
      layout: NOOP,
      reflow,
      isRoot
    }

    Object.setPrototypeOf(renderObject, o)

    return renderObject
  }

function getContainer(this: RenderObject) {
  return this.parentNode
}

function appendChild(this: RenderObject, child: RenderObject) {
  this.appendChildNode(child)
}

function reflow() {}

function isRoot(this: RenderObject) {
  return this.parentNode === null
}
