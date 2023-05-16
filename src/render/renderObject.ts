import { createCSSDeclaration } from '../css'
import { CanvasElement } from '../element'
import { TreeNode, createTreeNode } from '../tree-node'

export type RenderStyle = {
  backgroundColor: string
  color: string
  // width: number
  // height: number
  // paddingWidth: number
  // paddingHeight: number
  // paddingTop: number
  // paddingBottom: number
  // paddingLeft: number
  // paddingRight: number
  // marginLeft: number
  // marginRight: number
  // marginTop: number
  // marginBottom: number
  // contentWidth: number
  // contentHeight: number
  // fullBoxWidth: number
  // fullBoxHeight: number
  // lineCap: string // butt round square
  // visible: boolean
}

export interface RenderObject {
  root: RenderObject | null
  container: RenderObject | null
  nextSibling: RenderObject | null
  prevSibling: RenderObject | null
  children: RenderObject[]
  element: CanvasElement
  node: TreeNode
  renderStyle: RenderStyle
  createRenderStyle(elm: CanvasElement): void
  updateRenderStyle(): void
  layout(): void
  appendChild(child: RenderObject): void
}

export function createRenderObject(element, options = {}): RenderObject {
  let renderObject = {
    __v_isRenderObject: true,
    options,
    root: null,
    container: null,
    nextSibling: null,
    prevSibling: null,
    children: [],
    element,
    node: null,
    renderStyle: createRenderStyle(element),
    createRenderStyle,
    updateRenderStyle,
    layout,
    reflow,
    appendChild
  }

  let treeNode = createTreeNode({ instance: renderObject })
  renderObject.node = treeNode

  Object.defineProperty(renderObject, 'root', {
    get() {
      return treeNode.root.instance
    }
  })

  Object.defineProperty(renderObject, 'container', {
    get() {
      return treeNode.parent ? treeNode.parent.instance : null
    }
  })

  Object.defineProperty(renderObject, 'prevSibling', {
    get() {
      return treeNode.prev ? treeNode.prev.instance : null
    }
  })

  Object.defineProperty(renderObject, 'nextSibling', {
    get() {
      return treeNode.next ? treeNode.next.instance : null
    }
  })

  Object.defineProperty(renderObject, 'children', {
    get() {
      return treeNode.children.map((item) => item.instance)
    }
  })

  function createRenderStyle(elm) {
    let renderStyle = createCSSDeclaration(elm.styles)
    console.log('renderStyle', elm, elm.styles, renderStyle)
    return renderStyle
  }

  function updateRenderStyle() {}

  function layout() {}

  function reflow() {}

  function appendChild(child) {
    treeNode.appendChild(child.node)
  }

  return renderObject
}
