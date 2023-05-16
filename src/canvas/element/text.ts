import { isAuto, isExact } from '../../utils'
import { CanvasElement } from '.'
import { CanvasRenderer } from '../render'
import STYLE_CONSTANT, { ElementStyleType } from '../styleConstant'

type TextOptions = {}

type Layout = {}

type TextLine = {
  text: string
  layout: Layout
}

export interface TextElement extends CanvasElement {
  // layout: any
  // lines: TextLine[]
  // debugColor: string
  paint(): void
}

export function toTextElement(element: CanvasElement): TextElement {
  function paint() {
    // const renderer = this.getRenderer()
    // renderer._drawBackground(this)
    // renderer._drawText(tetxt)
    // renderer._drawBox(text)
  }

  element.debugColor = 'blue'
  element.paint = paint

  return element
}
