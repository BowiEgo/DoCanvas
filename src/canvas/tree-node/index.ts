export type TreeNodeChildren = Array<any> | string

export interface TreeNode {
  __v_isTreeNode: boolean
  _children: TreeNodeChildren
  children: TreeNodeChildren
  parent: TreeNode | null
  root: TreeNode | null
  prev: TreeNode | string | null
  next: TreeNode | string | null
  context: any
  hasChildren(): boolean
  appendChild(child: TreeNode): void
  prependChild(child: TreeNode): void
  removeChild(child: TreeNode): void
  append(): void
  prepend(): void
  remove(): void
}

export function isTreeNode(value: any): value is TreeNode {
  return value ? value.__v_isTreeNode === true : false
}

export function isEndNode(node) {
  return node.parent && !node.next && !node.hasChildren()
}

export function createTreeNode(options) {
  const treeNode: TreeNode = {
    __v_isTreeNode: true,
    _children: [],
    parent: null,
    root: null,
    prev: null,
    next: null,
    context: options.context,
    get children() {
      return treeNode._children
    },
    hasChildren,
    appendChild,
    prependChild,
    removeChild,
    append,
    prepend,
    remove
  }

  function _setParent(child: TreeNode, parent): void {
    child.parent = parent
  }

  function _setSibling(
    node: TreeNode,
    prev: TreeNode | string | null,
    next: TreeNode | null
  ): void {
    node.prev = prev
    node.next = next
  }

  function hasChildren() {
    return Array.isArray(treeNode._children) && treeNode._children.length
      ? true
      : false
  }

  function appendChild(child) {
    if (!isTreeNode(child)) throw Error('Unknown treeNode type')

    const prev = treeNode._children[treeNode._children.length - 1] || null
    if (prev && isTreeNode(prev)) {
      _setSibling(prev, prev.prev, child)
    }

    Array.isArray(treeNode._children) && treeNode._children.push(child)

    _setParent(child, treeNode)
    _setSibling(child, prev, null)
  }

  function prependChild(child) {
    if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  }

  function removeChild(child) {
    if (!isTreeNode(child)) throw Error('Unknown treeNode type')
  }

  function append() {}

  function prepend() {}

  function remove() {}

  return treeNode
}

export function connectChildren(el) {
  if (el.hasChildren()) {
    el.children = el.children.filter((item) => {
      isTreeNode(item)
    })
    el._getChildren().map((child, index) => {
      child._setParent(el)
      child._setSibling(
        el._getChildren()[index - 1],
        el._getChildren()[index + 1]
      )
      connectChildren(child)
    })
  }
}
