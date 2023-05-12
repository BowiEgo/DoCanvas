import { CanvasElement, isCanvasElement } from '../canvas/element'
import { TreeNodeChildren } from '../canvas/treeNode'
import { isArray } from './general'

export function floor(val) {
  return (0.5 + val) << 0
}

export function walk(element, callback) {
  let _continue = false // 是否跳过当前节点以及后面的节点
  let _next = false // 是否跳过当前节点数，子元素都不会遍历
  const _callContinue = () => (_continue = true)
  const _callNext = () => (_next = true)
  if (element != null) {
    const stack: CanvasElement[] = []
    let item: CanvasElement | undefined | null = null
    let children: TreeNodeChildren = []
    stack.push(element)
    while (stack.length !== 0) {
      item = stack.pop()
      if (!item) break
      callback(item, _callContinue, _callNext)
      if (!_next && item) {
        children = item.children
        if (isArray(children)) {
          for (let i = children.length - 1; i >= 0; i--) {
            if (!_continue) {
              stack.push(children[i])
            } else {
              // 复位
              _continue = false
            }
          }
        }
      } else {
        // 复位
        _next = false
      }
    }
  }
}

export function walkParent(element, callback) {
  if (!element) return
  let cur = element
  let stop = false
  const callbreak = () => {
    stop = true
  }
  while (cur.parent) {
    callback(cur.parent, callbreak)
    if (stop) {
      break
    }
    cur = cur.parent
  }
}

export function findRelativeTo(element) {
  if (element.isInFlow()) return element.parent
  if (element.renderStyles.position === 'fixed') return element.root
  let relativeTo = null
  walkParent(element, (parent) => {
    if (parent.renderStyles.position !== 'static' && !relativeTo) {
      relativeTo = parent
    }
  })
  if (!relativeTo) {
    relativeTo = element.root
  }
  return relativeTo
}
