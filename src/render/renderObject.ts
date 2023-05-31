import { createCSSDeclaration } from '../css'
import { BODY_STYLES, EXTEND_STYLE_KEYS } from '../css/constant'
import { CanvasElement } from '../element/element'
import { isCanvasTextNode } from '../element/textNode'
import { LayoutBox } from '../layout/layoutBox-bp'
import { TreeNode, createTreeNode } from '../tree-node'
import { NOOP, isString, mergeDeep, pipe, withConstructor } from '../utils'
import { BoundCurves, createBoundCurves } from './canvas/boundCurves'
import { createRenderBlock } from './renderBlock'
import { createBaseRenderInline, createRenderInline } from './renderInline'
import { createRenderInlineBlock } from './renderInlineBlock'
import { createRenderText } from './renderText'

export type RenderObjectOptions = {}

export type CreateRenderObjectFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => CanvasElement

export interface RenderObject extends TreeNode<RenderObject> {
  // TODO: enum type
  __v_isRenderObject: boolean
  type: string
  element: CanvasElement
  viewport: { width: number; height: number } | null
  layoutBox: LayoutBox | null
  curves: BoundCurves
  children: RenderObject[]
  previousSibling: RenderObject | null
  nextSibling: RenderObject | null
  getContainer(): RenderObject
  measureBoxSize(): void
  layout(): void
  flow(): void
  reflow(): void
  isRoot(): boolean
}

export const createRenderObject = (element, options = {}) => {
  if (element.type === 'body') {
    return createRenderBlock(element, options)
  }
  if (isCanvasTextNode(element)) {
    return createRenderText(element, options)
  }

  switch (element.renderStyles.display) {
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
      getContainer,
      appendChild,
      measureBoxSize: NOOP,
      layout: NOOP,
      flow,
      reflow,
      isRoot
    }

    function getContainer() {
      return this.parentNode
    }

    function appendChild(child) {
      this.appendChildNode(child)
    }

    function flow() {
      this.layout()
      this.curves = createBoundCurves(this)
      this.children.forEach((child) => child.flow())
    }

    function reflow() {}

    function isRoot() {
      return this.parentNode === null
    }

    return renderObject
  }
