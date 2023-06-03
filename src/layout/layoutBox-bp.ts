import { TreeNode, createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'

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

export type CreateLayoutFn = (
  parent: LayoutBox,
  top: number,
  left: number,
  width: number,
  height: number
) => LayoutBox

export interface LayoutBox extends TreeNode<LayoutBox> {
  __v_isLayoutBox: boolean
  top: number
  left: number
  bottom: number
  right: number
  width: number
  height: number
  appendChild(child: LayoutBox): void
  setTop(val: number): void
  setLeft(val: number): void
  setWidth(val: number): void
  setHeight(val: number): void
}

export const createBaseLayoutBox =
  (parent, top, left, width, height) =>
  (o): LayoutBox => {
    let layoutBox = {
      __v_isLayoutBox: true,
      ...o,
      top,
      left,
      width,
      height,
      get bottom() {
        return this.top + this.height
      },
      get right() {
        return this.left + this.width
      },
      appendChild,
      setTop,
      setLeft,
      setWidth,
      setHeight
    }

    function appendChild(child) {
      this.appendChildNode(child)
    }

    function setTop(val) {
      this.top = val
    }

    function setLeft(val) {
      this.left = val
    }

    function setWidth(val) {
      this.width = val
    }

    function setHeight(val) {
      this.height = val
    }

    return layoutBox
  }

export const createLayoutBox: CreateLayoutFn = function LayoutBox(
  parent,
  top,
  left,
  width,
  height
) {
  return pipe(
    createTreeNode(),
    createBaseLayoutBox(parent, top, left, width, height),
    withConstructor(LayoutBox)
  )({} as any)
}
