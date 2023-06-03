import { Engine } from '../engine'
import { createLayoutObject } from '../layout/layoutObject'
import { LayoutText } from '../layout/layoutText'
import { RenderObject } from '../render/renderObject'
import { TreeNode, createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { CanvasElement, ComputedStyles, isBody, _initRenderObject } from './element'

export function isCanvasTextNode(value: any): value is CanvasTextNode {
  return value ? value.__v_isCanvasTextNode === true : false
}

export interface CanvasTextNode extends TreeNode<CanvasElement> {
  __v_isCanvasTextNode: boolean
  text: string
  renderObject: RenderObject | null
  debugColor: string | null
  getContainer(): CanvasElement
  getComputedStyles(): ComputedStyles | { width: number; height: number }
  getLayoutObject(): LayoutText
  initLayoutObject(): void
  attach(parent: CanvasElement): void
  isBody(): boolean
}

export type CreateTextNodeAPI = (context: Engine) => CreateTextNodeFn

export type CreateTextNodeFn = (text: string) => CanvasTextNode

export const createTextNode = function CanvasTextNode(text: string) {
  return pipe(
    createTreeNode<CanvasTextNode>(),
    createBaseTextNode(text),
    withConstructor(CanvasTextNode)
  )({} as CanvasTextNode)
}

export const createBaseTextNode =
  (text: string) =>
  (o: TreeNode<CanvasElement>): CanvasTextNode => {
    let _layoutObject
    let _computedStyles = { width: 0, height: 0 }
    let textNode: CanvasTextNode = {
      ...o,
      __v_isCanvasTextNode: true,
      text,
      renderObject: null,
      debugColor: null,
      getContainer,
      getComputedStyles,
      getLayoutObject,
      initLayoutObject,
      attach,
      isBody
    }

    function getComputedStyles() {
      return _computedStyles
    }

    function getLayoutObject() {
      return _layoutObject
    }

    function initLayoutObject() {
      _layoutObject = createLayoutObject(this)
    }

    return textNode
  }

function getContainer(this: CanvasTextNode) {
  return this.parentNode
}

function attach(this: CanvasTextNode, parent: CanvasElement) {
  if (!this.getLayoutObject()) {
    this.initLayoutObject()
  }
  parent.getLayoutObject().appendChild(this.getLayoutObject())

  if (!this.renderObject) {
    _initRenderObject(this)
  }
  parent.renderObject.appendChild(this.renderObject)
}
