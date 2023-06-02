export type TreeNodeOptions<T> = {
  children?: TreeNode<T>[]
}

type Node<T> = TreeNode<T> & T

export function isTreeNode(value: any): value is TreeNode<any> {
  return value instanceof TreeNode
}

export function isEndNode<T>(node: TreeNode<T>) {
  return node.parentNode && !node.nextSibling && !node.hasChildNode()
}

export class TreeNode<T> {
  __v_isTreeNode: boolean
  _parentNode: Node<T> | null
  _previousSibling: Node<T> | null
  _nextSibling: Node<T> | null
  private _children: Node<T>[]
  parentNode: Node<T> | null
  previousSibling: Node<T> | null
  nextSibling: Node<T> | null
  get children() {
    return this._children
  }
  set children(val) {
    this._children = val
  }
  constructor(options?) {
    this._children = options ? options.children : []
  }
  setParentNode(node: Node<T>) {
    this._parentNode = node
  }
  getRootNode(this: Node<T>): Node<T> {
    return _getRoot(this)
  }
  hasChildNode() {
    return Array.isArray(this._children) && this._children.length ? true : false
  }
  appendChildNode(this: Node<T>, child: Node<T>) {
    if (!isTreeNode(child)) throw Error('Unknown treeNode type')
    const node = this

    const prev = node._children[node._children.length - 1] || null
    if (prev && isTreeNode(prev)) {
      _setSiblingNode<T>(prev, prev.previousSibling, child)
    }

    Array.isArray(node._children) && node._children.push(child)

    child.setParentNode(node)
    _setSiblingNode(child, prev, null)
  }
  prependChildNode(child: Node<T>) {
    if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  }
  removeChildNode(child: Node<T>) {
    if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  }
}

function _getRoot<T>(node: Node<T>): Node<T> {
  if (node.parentNode) {
    return _getRoot(node.parentNode)
  } else {
    return node
  }
}

function _setSiblingNode<T>(node: Node<T>, prev: Node<T> | null, next: Node<T> | null): void {
  node.previousSibling = prev
  node.nextSibling = next
}

export function connectChildren<T>(node: Node<T>) {
  if (node.hasChildNode()) {
    node._children.map((child, index) => {
      child.setParentNode(node)
      _setSiblingNode(child, node._children[index - 1], node._children[index + 1])
      connectChildren(child)
    })
  }
}
