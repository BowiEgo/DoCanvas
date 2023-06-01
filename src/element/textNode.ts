import { Engine } from '../engine'
import { LayoutObject, createLayoutObject } from '../layout/layoutObject'
import { LayoutText } from '../layout/layoutText'
import { RenderObject, createRenderObject } from '../render/renderObject'
import { TreeNode, createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { CanvasElement, ComputedStyles } from './element'

export function isCanvasTextNode(value: any): value is CanvasTextNode {
  return value ? value.__v_isCanvasTextNode === true : false
}

export interface CanvasTextNode extends TreeNode<CanvasElement> {
  __v_isCanvasTextNode: boolean
  computedStyles: ComputedStyles | { width: number; height: number }
  debugColor: string | null
  getContainer(): CanvasElement
  attach(parent: CanvasElement): void
  isBody(): boolean
  getLayoutObject(): LayoutObject<LayoutText>
  getRenderObject(): RenderObject
  getContext(): Engine
}

export type CreateTextNodeAPI = (context: Engine) => CreateTextNodeFn

export type CreateTextNodeFn = (text: string) => CanvasTextNode

export const createTextNode = function CanvasTextNode(text: string) {
  return pipe(
    createTreeNode<CanvasTextNode>({ textContent: text }),
    createBaseTextNode(),
    withConstructor(CanvasTextNode)
  )({} as CanvasTextNode)
}

export const createBaseTextNode =
  () =>
  (o: TreeNode<CanvasElement>): CanvasTextNode => {
    let layoutObject, renderObject
    let textNode: CanvasTextNode = {
      ...o,
      __v_isCanvasTextNode: true,
      computedStyles: { width: 0, height: 0 },
      debugColor: null,
      isBody: () => false,
      attach,
      getContainer,
      getLayoutObject,
      getRenderObject,
      getContext
    }

    function getLayoutObject() {
      return layoutObject
    }

    function getRenderObject() {
      return renderObject
    }

    layoutObject = createLayoutObject(textNode)
    renderObject = createRenderObject(textNode)

    return textNode
  }

function attach(this: CanvasTextNode, parent: CanvasElement) {
  parent.getRenderObject().appendChild(this.getRenderObject())
}

function getContainer(this: CanvasTextNode) {
  return this.parentNode
}

function getContext(this: CanvasTextNode) {
  return this.getContainer().getContext()
}
