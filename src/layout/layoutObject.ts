import { TreeNode } from '../tree-node'

export interface LayoutObject extends TreeNode<LayoutObject> {}

export const createLayoutObject =
  () =>
  (o: TreeNode<LayoutObject>): LayoutObject => {
    let layoutObject = {
      ...o
    }

    return layoutObject
  }

function _setPreviousSibling(this: LayoutObject, previous: LayoutObject) {}
function _setNextSibling(this: LayoutObject, next: LayoutObject) {}
function _setParentSibling(this: LayoutObject, parent: LayoutObject) {}
