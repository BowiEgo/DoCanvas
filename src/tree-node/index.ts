export type TreeNodeChildren = Array<TreeNode>

export interface TreeNode {
  __v_isTreeNode: boolean
  _children: TreeNodeChildren
  children: TreeNodeChildren
  parent: TreeNode | null
  root: TreeNode | null
  prev: TreeNode | null
  next: TreeNode | null
  instance: any
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

export function createTreeNode(options?) {
  const treeNode: TreeNode = {
    __v_isTreeNode: true,
    _children: options.children || [],
    parent: null,
    prev: null,
    next: null,
    instance: options.instance || null,
    set children(value) {
      treeNode._children = value
    },
    get children() {
      return treeNode._children || []
    },
    get root() {
      return getRoot(this)
    },
    hasChildren,
    appendChild,
    prependChild,
    removeChild,
    append,
    prepend,
    remove
  }

  function getRoot(node) {
    if (node.parent) {
      return getRoot(node.parent)
    } else {
      return node
    }
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

function _setParent(child: TreeNode, parent): void {
  child.parent = parent
}

function _setSibling(
  node: TreeNode,
  prev: TreeNode | null,
  next: TreeNode | null
): void {
  node.prev = prev
  node.next = next
}

export function connectChildren(node) {
  console.log('connectChildren', node)
  if (node.hasChildren()) {
    node._children.map((child, index) => {
      _setParent(child, node)
      _setSibling(child, node._children[index - 1], node._children[index + 1])
      connectChildren(child)
    })
  }
}
