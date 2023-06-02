// RenderBlock {HTML} at (0, 0) size 640x480
// |—— RenderBody {BODY} at (0, 80) size 640x480 [bgcolor=# FFFFFF]
// | |—— RenderBlock {P} at (0, 0) size 640x80
// | | |—— RenderText {#text} at (0, 0) size 48x24 "First line."
// | | |—— RenderBR {BR} at (20, 20) size 0x0
// | | |—— RenderText {#text} at (0, 24) size 48x24 "Second one."

import { TreeNode } from '../tree-node'
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
    createBaseLayoutBox(parent, top, left, width, height),
    withConstructor(LayoutBox)
  )(new TreeNode())
}
