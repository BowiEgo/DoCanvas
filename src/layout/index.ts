import { isCanvasTextNode } from '../element/textNode'
import { LayoutBlock } from './layoutBlock'
import { LayoutInline } from './layoutInline'
import { LayoutInlineBlock } from './layoutInlineBlock'
import { LayoutText } from './layoutText'

export function createLayoutObject(element) {
  if (element.type === 'body') {
    return new LayoutBlock(element)
  }
  if (isCanvasTextNode(element)) {
    return new LayoutText(element)
  }

  switch (element.getComputedStyles().display) {
    case 'block':
      return new LayoutBlock(element)
    case 'inline':
      return new LayoutInline(element)
    case 'inline-block':
      return new LayoutInlineBlock(element)
    default:
      return new LayoutBlock(element)
  }
}
