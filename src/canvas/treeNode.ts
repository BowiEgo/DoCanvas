export type TreeNodeChildren = Array<TreeNode>

export interface TreeNode {
  __v_isTreeNode: boolean
  _children: TreeNode[]
  parent: TreeNode | null
  root: TreeNode | null
  prev: TreeNode | null
  next: TreeNode | null
  children: TreeNodeChildren
  context: any
  _setParent(node: TreeNode): void
  _setSibling(prev: TreeNode | null, next: TreeNode | null): void
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

export function createTreeNode(context) {
  const treeNode: TreeNode = {
    __v_isTreeNode: true,
    _children: [] as TreeNode[],
    parent: null,
    root: null,
    prev: null,
    next: null,
    context,

    get children() {
      return treeNode.hasChildren() ? treeNode._children : []
    },

    _setParent(node) {
      console.log('_setParent', this, node)
      this.parent = treeNode.parent = node
      this.root = treeNode.root = node.root
    },

    _setSibling(prev, next) {
      this.prev = treeNode.prev = prev
      this.next = treeNode.next = next
    },

    hasChildren() {
      return Array.isArray(treeNode._children) && treeNode._children.length
        ? true
        : false
    },

    appendChild(child) {
      if (!isTreeNode(child)) throw Error('Unknown treeNode type')

      const prev = this.children[this.children.length - 1] || null
      prev && prev._setSibling(prev.prev, child)

      this._children.push(child)

      child._setParent(this)
      child._setSibling(prev, null)
    },

    prependChild(child) {
      if (!isTreeNode(child)) throw Error('Unknown treeNode type')
    },

    removeChild(child) {
      if (!isTreeNode(child)) throw Error('Unknown treeNode type')
    },

    append() {},

    prepend() {},

    remove() {}
  }

  return treeNode
}

export function connectChildren(el) {
  console.warn('connectChildren', el)
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
