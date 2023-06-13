import { pipe, withConstructor } from '../utils'

export type TreeNodeOptions<T> = {
  children?: TreeNode<T>[]
  textContent?: string
}

export type CreateTreeNodeFn<T> = (options?: TreeNodeOptions<T>) => TreeNode<T>

export interface TreeNode<T> {
  __v_isTreeNode: boolean
  _parentNode: TreeNode<T> | null
  // _previousSibling: TreeNode<T> | null
  // _nextSibling: TreeNode<T> | null
  _children: TreeNode<T>[]
  parentNode: TreeNode<T> | null
  previousSibling: TreeNode<T> | null
  nextSibling: TreeNode<T> | null
  children: T[]
  options: TreeNodeOptions<T>
  setParentNode(node: TreeNode<T>): void
  getRootNode(): TreeNode<T> | null
  getPreviousNode(): TreeNode<T> | null
  getNextNode(): TreeNode<T> | null
  appendChildNode(child: T): void
  prependChildNode(child: TreeNode<T>): void
  removeChildNode(child: TreeNode<T>): void
  replaceChildNode(child: TreeNode<T>, newChild: TreeNode<T>): void
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

export const createTreeNode = function TreeNode<T>(
  options?
): CreateTreeNodeFn<T> {
  return pipe(createBaseTreeNode<T>(options), withConstructor(TreeNode))
}

const createBaseTreeNode =
  <T>(options?: TreeNodeOptions<T>) =>
  (o): TreeNode<T> => {
    const treeNode: TreeNode<T> = {
      ...o,
      __v_isTreeNode: true,
      _parentNode: null,
      // _previousSibling: null,
      // _nextSibling: null,
      _children: options ? options.children : [],
      options,
      set parentNode(val) {
        this._parentNode = val
      },
      get parentNode() {
        return this._parentNode
      },
      // set previousSibling(val) {
      //   this._previousSibling = val
      // },
      // get previousSibling() {
      //   return this._previousSibling
      // },
      // set nextSibling(val) {
      //   this._nextSibling = val
      // },
      // get nextSibling() {
      //   return this._previousSibling
      // },
      set children(val) {
        this._children = val
      },
      get children() {
        return this._children || []
      },
      setParentNode,
      getRootNode,
      getPreviousNode,
      getNextNode,
      appendChildNode,
      prependChildNode,
      removeChildNode,
      replaceChildNode,
      hasChildNode,
      append,
      prepend,
      remove
    }

    return treeNode
  }

function setParentNode<T>(node: TreeNode<T> | null) {
  this.parentNode = node
}

function getRootNode<T>(): TreeNode<T> | T {
  return _getRoot<T>(this)
}

function getPreviousNode() {
  if (!this.parentNode) return null
  let index = this.parentNode.children.indexOf(this)
  return index > 0 ? this.parentNode.children[index - 1] || null : null
}

function getNextNode() {
  if (!this.parentNode) return null
  let index = this.parentNode.children.indexOf(this)
  return index < this.parentNode.children.length - 1
    ? this.parentNode.children[index + 1] || null
    : null
}

function hasChildNode() {
  return Array.isArray(this._children) && this._children.length ? true : false
}

function appendChildNode<T>(child: T) {
  if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  // const prev = this._children[this._children.length - 1] || null
  // if (prev && isTreeNode(prev)) {
  //   _setSiblingNode<T>(prev, prev.previousSibling, child)
  // }

  Array.isArray(this._children) && this._children.push(child)

  child.setParentNode(this)
  // _setSiblingNode(child, prev, null)
}

function prependChildNode<T>(child: TreeNode<T>) {
  if (!isTreeNode(child)) throw Error('Unknown treeNode type')
}

function removeChildNode<T>(this: TreeNode<T>, child: TreeNode<T>) {
  if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  child.setParentNode(null)
  this._children.splice(this._children.indexOf(child), 1)
}

function replaceChildNode<T>(
  this: TreeNode<T>,
  child: TreeNode<T>,
  newChild: TreeNode<T>
) {
  if (!isTreeNode(child) || !isTreeNode(newChild))
    throw Error('Unknown treeNode type')

  let index = this._children.indexOf(child)

  if (index > -1) {
    this._children.splice(index, 1, newChild)
    // this._children.splice(index, 1)
    child.setParentNode(null)
    newChild.setParentNode(this)
  } else {
    throw Error('Child not found')
  }
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

function _setSiblingNode<T>(
  node: TreeNode<T>,
  prev: TreeNode<T> | null,
  next: TreeNode<T> | null
): void {
  node.previousSibling = prev
  node.nextSibling = next
}

export function connectChildren(node) {
  if (node.hasChildNode()) {
    node._children.map((child, index) => {
      child.setParentNode(node)
      _setSiblingNode(
        child,
        node._children[index - 1],
        node._children[index + 1]
      )
      connectChildren(child)
    })
  }
}
