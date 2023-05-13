import { TreeNode } from '../canvas/tree-node'
import { CanvasElement } from '../canvas/element'
import { TravedElementList } from '../canvas/layer'
import { isArray } from './general'

type Queue<T> = T[]

type TraversalFn = (node: TreeNode | CanvasElement) => TravedElementList

export const deepTraversal: TraversalFn = (node) => {
  const nodes = <any>[]

  if (node != null) {
    const queue: Queue<TreeNode | CanvasElement> = []
    let item
    let children
    queue.unshift(node)

    while (queue.length != 0) {
      item = queue.shift()
      nodes.push(item)

      children = item.children
      if (isArray(children)) {
        for (let i = children.length - 1; i >= 0; i--) queue.push(children[i])
      }
    }
  }
  return nodes
}

export const wideTraversal: TraversalFn = (node) => {
  const nodes = <any>[]

  if (node != null) {
    const queue: Queue<TreeNode | CanvasElement> = []
    let item
    let children

    queue.unshift(node)

    while (queue.length != 0) {
      item = queue.shift()
      nodes.push(item)

      children = item.children
      if (isArray(children)) {
        for (let i = 0; i < children.length; i++) queue.push(children[i])
      }
    }
  }

  return nodes
}
