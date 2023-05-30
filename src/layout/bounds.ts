// RenderBlock {HTML} at (0, 0) size 640x480
// |—— RenderBody {BODY} at (0, 80) size 640x480 [bgcolor=# FFFFFF]
// | |—— RenderBlock {P} at (0, 0) size 640x80
// | | |—— RenderText {#text} at (0, 0) size 48x24 "First line."
// | | |—— RenderBR {BR} at (20, 20) size 0x0
// | | |—— RenderText {#text} at (0, 24) size 48x24 "Second one."

import { TreeNode, createTreeNode } from '../tree-node'

export interface Bounds {
  __v_isBounds: boolean
  top: number
  left: number
  width: number
  height: number
  setTop(val: number): void
  setLeft(val: number): void
  setWidth(val: number): void
  setHeight(val: number): void
}

export function createBounds(top, left, width, height): Bounds {
  let bounds = {
    __v_isBounds: true,
    top,
    left,
    width,
    height,
    setTop,
    setLeft,
    setWidth,
    setHeight
  }

  Object.defineProperty(bounds, 'bottom', {
    get() {
      return bounds.top + bounds.height
    }
  })

  Object.defineProperty(bounds, 'right', {
    get() {
      return bounds.left + bounds.width
    }
  })

  function setTop(val) {
    bounds.top = val
  }

  function setLeft(val) {
    bounds.left = val
  }

  function setWidth(val) {
    bounds.width = val
  }

  function setHeight(val) {
    bounds.height = val
  }

  return bounds
}
