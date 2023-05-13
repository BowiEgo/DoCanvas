import { TreeNode } from '../canvas/tree-node'
import { CanvasElement } from '../canvas/element'
import { isArray } from './general'

type Queue<T> = T[]

type TreeSearchFn = (node: TreeNode) => [TreeNode]

// https://javascript.plainenglish.io/tree-traversal-in-javascript-9b1e92e15abb

export const BFS: TreeSearchFn = (node) => {
  const traversed = <any>[]

  if (node != null) {
    const queue: Queue<TreeNode> = []
    let item
    let children

    queue.unshift(node)

    while (queue.length != 0) {
      item = queue.shift()
      traversed.push(item)
      children = item.children
      if (isArray(children)) {
        for (let i = 0; i < children.length; i++) queue.push(children[i])
      }
    }
  }

  return traversed
}

export const PostOrderDFS: TreeSearchFn = (node) => {
  let traversed = <any>[]

  function traverse(curr) {
    if (curr.children.length !== 0) {
      curr.children.forEach((child) => {
        traverse(child)
      })
    }
    traversed.push(curr)
  }

  traverse(node)

  return traversed
}
