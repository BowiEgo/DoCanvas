import { RenderObject } from '../render/renderObject'
import { TreeNode } from '../tree-node/index'
import { CanvasElement, ComputedStyles, _initRenderObject } from './element'

export type CreateTextNodeFn = (text: string) => CanvasTextNode

export const createTextNodeAPI = (): CreateTextNodeFn => (text: string) => new CanvasTextNode(text)

export function isCanvasTextNode(value: any) {
  return value instanceof CanvasTextNode
}

export class CanvasTextNode extends TreeNode<CanvasTextNode> {
  text: string
  _computedStyles: { width: number; height: 0 } = { width: 0, height: 0 }
  renderObject: RenderObject
  debugColor: string
  readonly isBody: boolean = false
  constructor(text) {
    super()
    this.text = text
  }
  getContainer(this: TreeNode<CanvasTextNode>) {
    return this._parentNode
  }
  getComputedStyles() {
    return this._computedStyles as ComputedStyles
  }
  attach(this: CanvasTextNode, parent: CanvasElement) {
    // if (!this.renderObject) {
    //   _initRenderObject(this)
    // }
    // parent.renderObject.appendChild(this.renderObject)
  }
}
