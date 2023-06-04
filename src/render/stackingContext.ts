import { CanvasElement } from '../element/element'
import { BFS, PostOrderDFS } from '../utils/treeSearch'

// constructing...
interface StackingContext {
  element: CanvasElement // 层叠上下文顶端节点
  negativeZIndex: StackingContext[] // z-index为负的次级上下文
  // z-index为0|auto || 设置了tranform || 设置了Opacity的次级上下文
  zeroOrAutoZIndexOrTransformedOrOpacity: StackingContext[]
  positiveZIndex: StackingContext[] // z-index为正的次级层叠
  nonPositionedFloats: StackingContext[] // 浮动次级层叠
  nonPositionedInlineLevel: StackingContext[] // 内联次级层叠
  inlineLevel: CanvasElement[] // 内联子元素 非上下文
  nonInlineLevel: CanvasElement[] // 块级子元素 非上下文
}

export function createStackingContext(
  container: CanvasElement
): StackingContext {
  let stackingContext = {
    element: container,
    negativeZIndex: [],
    zeroOrAutoZIndexOrTransformedOrOpacity: [],
    positiveZIndex: [],
    nonPositionedFloats: [],
    nonPositionedInlineLevel: [],
    inlineLevel: [],
    nonInlineLevel: []
  }

  let breathArr = BFS(container)
  let postOrderDeepArr = PostOrderDFS(container)

  return stackingContext
}
