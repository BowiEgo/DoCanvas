import { isString } from '../utils'

export type TreeNodeChildren = Array<TreeNode>

export type TreeNodeOptions = {
  children?: TreeNode[]
  textContent?: string
}

export interface TreeNode {
  __v_isTreeNode: boolean
  _children: TreeNodeChildren
  children: TreeNodeChildren
  parentNode: TreeNode | null
  previousSibling: TreeNode | null
  nextSibling: TreeNode | null
  setParentNode(parent: TreeNode): void
  getRootNode(): TreeNode | null
  appendChildNode(child: TreeNode): void
  prependChildNode(child: TreeNode): void
  removeChildNode(child: TreeNode): void
  hasChildNode(): boolean
  append(): void
  prepend(): void
  remove(): void
}

export function isTreeNode(value: any): value is TreeNode {
  return value ? value.__v_isTreeNode === true : false
}

export function isEndNode(node) {
  return node.parentNode && !node.next && !node.hasChildNode()
}

export const createTreeNode =
  (options?: TreeNodeOptions) =>
  (o): TreeNode => {
    const treeNode: TreeNode = {
      ...o,
      __v_isTreeNode: true,
      textContent: options ? options.textContent : null,
      parentNode: null,
      _children: options ? options.children : [],
      previousSibling: null,
      nextSibling: null,
      set children(val) {
        this._children = val
      },
      get children() {
        return this._children || []
      },
      setParentNode,
      getRootNode,
      appendChildNode,
      prependChildNode,
      removeChildNode,
      hasChildNode,
      append,
      prepend,
      remove
    }

    function setParentNode(node) {
      this.parentNode = node
    }

    function getRootNode() {
      return _getRoot(this)
    }

    function hasChildNode() {
      return Array.isArray(this._children) && this._children.length ? true : false
    }

    function appendChildNode(child) {
      if (!isTreeNode(child)) throw Error('Unknown treeNode type')

      const prev = this._children[this._children.length - 1] || null
      if (prev && isTreeNode(prev)) {
        _setSiblingNode(prev, prev.previousSibling, child)
      }

      Array.isArray(this._children) && this._children.push(child)

      child.setParentNode(this)
      _setSiblingNode(child, prev, null)
    }

    function prependChildNode(child) {
      if (!isTreeNode(child)) throw Error('Unknown treeNode type')
    }

    function removeChildNode(child) {
      if (!isTreeNode(child)) throw Error('Unknown treeNode type')
    }

    function append() {}

    function prepend() {}

    function remove() {}

    // if (treeNode.instance && !isString(treeNode.instance)) {
    //   treeNode.instance.node = treeNode
    // }
    return treeNode
  }

function _getRoot(node) {
  if (node.parentNode) {
    return _getRoot(node.parentNode)
  } else {
    return node
  }
}

function _setSiblingNode(node: TreeNode, prev: TreeNode | null, next: TreeNode | null): void {
  node.previousSibling = prev
  node.nextSibling = next
}

export function connectChildren(node) {
  if (node.hasChildNode()) {
    node._children.map((child, index) => {
      child.setParentNode(node)
      _setSiblingNode(child, node._children[index - 1], node._children[index + 1])
      connectChildren(child)
    })
  }
}
