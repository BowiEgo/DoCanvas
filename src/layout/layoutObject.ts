import { TreeNode } from '../tree-node'

export interface LayoutObject extends TreeNode<LayoutObject> {
  _setPreviousSibling(previous: LayoutObject): void
  _setNextSibling(next: LayoutObject): void
  _setParentSibling(parent: LayoutObject): void
}

export const createLayoutObject =
  () =>
  (o): LayoutObject => {
    let layoutObject = {
      ...o,
      _setPreviousSibling,
      _setNextSibling,
      _setParentSibling
    }

    function _setPreviousSibling(previous: LayoutObject) {}
    function _setNextSibling(next: LayoutObject) {}
    function _setParentSibling(parent: LayoutObject) {}

    return layoutObject
  }
