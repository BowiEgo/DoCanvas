import { TreeNode } from '../Canvas/treeNode'
import { TravedElementList } from '../canvas/layer'

type Queue<T> = T[]

type TraversalFn = (node: TreeNode) => TravedElementList

export const deepTraversal: TraversalFn = (node) => {
  const nodes = <any>[]

  if (node != null) {
    const queue: Queue<TreeNode> = []
    let item
    let children
    queue.unshift(node)

    while (queue.length != 0) {
      item = queue.shift()
      nodes.push(item.elementInstance)

      children = item.children

      for (let i = children.length - 1; i >= 0; i--)
        queue.push(children[i].elementInstance)
    }
  }
  return nodes
}

export const wideTraversal: TraversalFn = (node) => {
  const nodes = <any>[]

  if (node != null) {
    const queue: Queue<TreeNode> = []
    let item
    let children

    queue.unshift(node)

    while (queue.length != 0) {
      item = queue.shift()
      nodes.push(item.elementInstance)

      children = item.children

      for (let i = 0; i < children.length; i++)
        queue.push(children[i].elementInstance)
    }
  }

  return nodes
}
