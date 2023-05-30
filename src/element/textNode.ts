import { Engine } from '../engine'
import { RenderObject, RenderStyle } from '../render/renderObject'
import { TreeNode, createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { CanvasElement, _createRenderObject } from './element'

export function isCanvasTextNode(value: any): value is CanvasTextNode {
  return value ? value.__v_isCanvasTextNode === true : false
}

export interface CanvasTextNode extends TreeNode {
  __v_isCanvasTextNode: boolean
  text: string
  debugColor: string | null
  renderObject: RenderObject
  getContainer(): CanvasElement
  attach(parent: CanvasTextNode): void
}

export type CreateTextNodeAPI = (context: Engine) => CreateTextNodeFn

export type CreateTextNodeFn = (text: string) => CanvasTextNode

export const createBaseTextNode =
  () =>
  (o): CanvasTextNode => {
    let textNode = {
      ...o,
      __v_isCanvasTextNode: true,
      computedStyles: { width: 0, height: 0 },
      getContainer,
      attach
    }

    function getContainer() {
      return this.parentNode
    }

    function attach(parent) {
      if (!this.renderObject) {
        _createRenderObject(this)
      }
      parent.renderObject.appendChild(this.renderObject)
    }

    return textNode
  }

export const createTextNode = function CanvasTextNode(text: string) {
  return pipe(
    createTreeNode({ textContent: text }),
    createBaseTextNode(),
    withConstructor(CanvasTextNode)
  )({} as CanvasTextNode)
}
