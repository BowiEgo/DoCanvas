import { CanvasElement } from '../element/element'
import { LayoutBox } from '../layout/layoutBox-bp'
import { TreeNode } from '../tree-node/index'
import { NOOP } from '../utils/index'
import { BoundCurves, createBoundCurves } from './canvas/boundCurves'
import { createRenderBlock } from './renderBlock'
import { createRenderInline } from './renderInline'
import { createRenderInlineBlock } from './renderInlineBlock'
import { createRenderText } from './renderText'

export type RenderObjectOptions = {}

export type CreateRenderObjectFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => CanvasElement

// export interface RenderObject extends TreeNode<RenderObject> {
//   // TODO: enum type
//   __v_isRenderObject: boolean
//   type: string
//   options: RenderObjectOptions
//   element: CanvasElement
//   viewport: { width: number; height: number } | null
//   layoutBox: LayoutBox | null
//   curves: BoundCurves
//   children: RenderObject[]
//   previousSibling: RenderObject | null
//   nextSibling: RenderObject | null
//   getContainer(): RenderObject
//   appendChild(chid: RenderObject): void
//   measureBoxSize(): void
//   layout(): void
//   flow(): void
//   reflow(): void
//   isRoot(): boolean
// }

export const createRenderObject = (element, options = {}) => {
  if (element.type === 'body') {
    return createRenderBlock(element, options)
  }
  // if (isCanvasTextNode(element)) {
  //   return createRenderText(element, options)
  // }

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

export class RenderObject extends TreeNode<RenderObject> {
  __v_isRenderObject: boolean
  type: string
  options: RenderObjectOptions
  element: CanvasElement
  viewport: { width: number; height: number } | null
  layoutBox: LayoutBox | null
  curves: BoundCurves
  children: RenderObject[]
  previousSibling: RenderObject | null
  nextSibling: RenderObject | null
  constructor(element, options = {}) {
    super()
    this.element = element
    this.options = options
  }
  getContainer() {
    return this.parentNode
  }
  appendChild(child) {
    console.log(this)
    this.appendChildNode(child)
  }
  flow() {
    this.layout()
    this.curves = createBoundCurves(this)
    this.children.forEach((child) => child.flow())
  }
  isRoot() {
    return this.parentNode === null
  }
  measureBoxSize() {}
  layout() {}
}

export const createBaseRenderObject =
  (element, options = {}) =>
  (o: TreeNode<RenderObject>): RenderObject => {
    let renderObject = {
      ...o,
      __v_isRenderObject: true,
      type: null,
      options,
      element,
      get viewport() {
        let rootElm = element.getRootNode()
        return rootElm && rootElm.type === 'body' ? rootElm.context.viewport : null
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
      flow,
      reflow,
      isRoot
    }

    console.log(o)

    Object.setPrototypeOf(renderObject, o)

    function appendChild(this: RenderObject, child: RenderObject) {
      console.log(this)
      this.appendChildNode(child)
    }

    return renderObject
  }

function getContainer(this: RenderObject) {
  return this.parentNode
}

function flow(this: RenderObject) {
  this.layout()
  this.curves = createBoundCurves(this)
  this.children.forEach((child) => child.flow())
}

function reflow() {}

function isRoot(this: RenderObject) {
  return this.parentNode === null
}
