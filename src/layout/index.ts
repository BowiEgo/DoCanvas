// RenderBlock {HTML} at (0, 0) size 640x480
// |—— RenderBody {BODY} at (0, 80) size 640x480 [bgcolor=# FFFFFF]
// | |—— RenderBlock {P} at (0, 0) size 640x80
// | | |—— RenderText {#text} at (0, 0) size 48x24 "First line."
// | | |—— RenderBR {BR} at (20, 20) size 0x0
// | | |—— RenderText {#text} at (0, 24) size 48x24 "Second one."

import { TreeNode, createTreeNode } from '../tree-node'

// BoxModel
// |-------------------------------------------------|
// |                                                 |
// |                  margin-top                     |
// |                                                 |
// |    |---------------------------------------|    |
// |    |                                       |    |
// |    |             border-top                |    |
// |    |                                       |    |
// |    |    |--------------------------|--|    |    |
// |    |    |                          |  |    |    |
// |    |    |       padding-top        |##|    |    |
// |    |    |                          |##|    |    |
// |    |    |    |----------------|    |##|    |    |
// |    |    |    |                |    |  |    |    |
// | ML | BL | PL |  content box   | PR |SW| BR | MR |
// |    |    |    |                |    |  |    |    |
// |    |    |    |----------------|    |  |    |    |
// |    |    |                          |  |    |    |
// |    |    |      padding-bottom      |  |    |    |
// |    |    |                          |  |    |    |
// |    |    |--------------------------|--|    |    |
// |    |    |     scrollbar height ####|SC|    |    |
// |    |    |-----------------------------|    |    |
// |    |                                       |    |
// |    |           border-bottom               |    |
// |    |                                       |    |
// |    |---------------------------------------|    |
// |                                                 |
// |                margin-bottom                    |
// |                                                 |
// |-------------------------------------------------|

// BL = border-left
// BR = border-right
// ML = margin-left
// MR = margin-right
// PL = padding-left
// PR = padding-right
// SC = scroll corner
// SW = scrollbar width

export interface LayoutBox {
  __v_isLayoutBox: boolean
  node: TreeNode | null
  parent: LayoutBox | null
  top: number
  left: number
  width: number
  height: number
  appendChild(child: LayoutBox): void
  setTop(val: number): void
  setLeft(val: number): void
  setWidth(val: number): void
  setHeight(val: number): void
}

export function createLayoutBox(parent, top, left, width, height): LayoutBox {
  let layoutBox = {
    __v_isLayoutBox: true,
    node: null,
    parent: null,
    top,
    left,
    width,
    height,
    appendChild,
    setTop,
    setLeft,
    setWidth,
    setHeight
  }

  let treeNode = createTreeNode({ instance: layoutBox })
  parent && parent.appendChild(layoutBox)

  Object.defineProperty(layoutBox, 'parent', {
    get() {
      return treeNode.parent ? treeNode.parent.instance : null
    }
  })

  Object.defineProperty(layoutBox, 'children', {
    get() {
      return treeNode.children.map((item) => item.instance)
    }
  })

  Object.defineProperty(layoutBox, 'bottom', {
    get() {
      return layoutBox.top + layoutBox.height
    }
  })

  Object.defineProperty(layoutBox, 'right', {
    get() {
      return layoutBox.left + layoutBox.width
    }
  })

  function appendChild(child) {
    treeNode.appendChild(child.node)
  }

  function setTop(val) {
    layoutBox.top = val
  }

  function setLeft(val) {
    layoutBox.left = val
  }

  function setWidth(val) {
    layoutBox.width = val
  }

  function setHeight(val) {
    layoutBox.height = val
  }

  return layoutBox
}
