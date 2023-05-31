import { Engine } from '../engine'
import { RenderObject } from '../render/renderObject'
import { TreeNode, createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { CanvasElement, ComputedStyles, _initRenderObject } from './element'

export function isCanvasTextNode(value: any): value is CanvasTextNode {
  return value ? value.__v_isCanvasTextNode === true : false
}

export interface CanvasTextNode extends TreeNode<CanvasElement> {
  __v_isCanvasTextNode: boolean
  computedStyles: ComputedStyles | { width: number; height: number }
  renderObject: RenderObject | null
  debugColor: string | null
  getContainer(): CanvasElement
  attach(parent: CanvasElement): void
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
    let textNode: CanvasTextNode = {
      ...o,
      __v_isCanvasTextNode: true,
      computedStyles: { width: 0, height: 0 },
      renderObject: null,
      debugColor: null,
      getContainer,
      attach
    }

    return textNode
  }

function getContainer(this: CanvasTextNode) {
  return this.parentNode
}

function attach(this: CanvasTextNode, parent: CanvasElement) {
  if (!this.renderObject) {
    _initRenderObject(this)
  }
  parent.renderObject.appendChild(this.renderObject)
}
