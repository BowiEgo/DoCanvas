export type TreeNodeOptions<T> = {
  children?: TreeNode<T>[]
  textContent?: string
}

export interface TreeNode<T> {
  __v_isTreeNode: boolean
  _parentNode: TreeNode<T> | null
  _previousSibling: TreeNode<T> | null
  _nextSibling: TreeNode<T> | null
  _children: TreeNode<T>[]
  parentNode: T | null
  previousSibling: T | null
  nextSibling: T | null
  children: T[]
  textContent: string | null
  setParentNode(node: TreeNode<T>): void
  getRootNode(): T | null
  appendChildNode(child: TreeNode<T>): void
  prependChildNode(child: TreeNode<T>): void
  removeChildNode(child: TreeNode<T>): void
  hasChildNode(): boolean
  append(): void
  prepend(): void
  remove(): void
}

export function isTreeNode(value: any): value is TreeNode<any> {
  return value ? value.__v_isTreeNode === true : false
}

export function isEndNode<T>(node: TreeNode<T>) {
  return node.parentNode && !node.nextSibling && !node.hasChildNode()
}

export const createTreeNode =
  <T>(options?: TreeNodeOptions<T>) =>
  (o): TreeNode<T> => {
    const treeNode: TreeNode<T> = {
      ...o,
      __v_isTreeNode: true,
      textContent: options ? options.textContent : null,
      _parentNode: null,
      _previousSibling: null,
      _nextSibling: null,
      _children: options ? options.children : [],
      set parentNode(val) {
        this._parentNode = val
      },
      get parentNode() {
        return this._parentNode
      },
      set previousSibling(val) {
        this._previousSibling = val
      },
      get previousSibling() {
        return this._previousSibling
      },
      set nextSibling(val) {
        this._nextSibling = val
      },
      get nextSibling() {
        return this._nextSibling
      },
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

    return treeNode
  }

function setParentNode<T>(node: TreeNode<T>) {
  this.parentNode = node
}

function getRootNode<T>(): TreeNode<T> | T {
  return _getRoot<T>(this)
}

function hasChildNode() {
  return Array.isArray(this._children) && this._children.length ? true : false
}

function appendChildNode<T>(child: T) {
  if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  const node = this as TreeNode<T>

  const prev = node._children[node._children.length - 1] || null
  if (prev && isTreeNode(prev)) {
    _setSiblingNode<T>(prev, prev.previousSibling, child)
  }

  Array.isArray(node._children) && node._children.push(child)

  child.setParentNode(node)
  _setSiblingNode(child, prev, null)
}

function prependChildNode<T>(child: TreeNode<T>) {
  if (!isTreeNode(child)) throw Error('Unknown treeNode type')
}

function removeChildNode<T>(child: TreeNode<T>) {
  if (!isTreeNode(child)) throw Error('Unknown treeNode type')
}

function append() {}

function prepend() {}

function remove() {}

function _getRoot<T>(node: TreeNode<T>): TreeNode<T> | T {
  if (node.parentNode) {
    return _getRoot(node.parentNode as TreeNode<T>)
  } else {
    return node
  }
}

function _setSiblingNode<T>(node: TreeNode<T>, prev: T | null, next: T | null): void {
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
