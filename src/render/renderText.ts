// import { splitGraphemes } from '../text/graphemeBreak'
import { LineBreaker } from '../text/lineBreak'
import { fromCodePoint, toCodePoints } from '../text/Util'
import { createLayoutBox } from '../layout/layoutBox-bp'
import { pipe, withConstructor } from '../utils'
import { createTreeNode } from '../tree-node'
import { RenderObject, RenderObjectOptions, createBaseRenderObject } from './renderObject'
import { CanvasTextNode } from '../element/textNode'

type TextStyles = {
  color: string
  fontSize: number
  fontWeight: string
  lineHeight: number
  fontFamily: string
}

type TextLines = {
  lines: string[]
  maxLineWidth: number
  outerHeight: number
}

export type CreateRenderTextFn = (
  element: CanvasTextNode,
  options?: RenderObjectOptions
) => RenderText

export interface RenderText extends RenderObject {
  type: string
  element: CanvasTextNode
  textLines: TextLines
  layout(): void
  measureBoxSize(): void
  getTextStyles(): TextStyles
}

export const createRenderText: CreateRenderTextFn = function RenderText(element, options) {
  return pipe(
    createTreeNode<RenderObject>(),
    createBaseRenderObject(element, (options = {})),
    createBaseRenderText(element),
    withConstructor(RenderText)
  )({} as RenderText)
}

export const createBaseRenderText =
  (element: CanvasTextNode) =>
  (o: RenderObject): RenderText => {
    let renderText: RenderText = {
      ...o,
      type: 'text',
      element,
      textLines: { lines: [], maxLineWidth: 0, outerHeight: 0 },
      layout,
      measureBoxSize,
      getTextStyles
    }

    return renderText
  }

function layout(this: RenderText) {
  console.log('layout-text', this.element)
  const { width, height } = this.element.computedStyles
  const parentBox = this.getContainer().layoutBox
  let top = parentBox.top
  let left = parentBox.left

  if (!this.layoutBox) {
    this.layoutBox = createLayoutBox(parentBox, top, left, width, height)
  } else {
    this.layoutBox.setTop(top)
    this.layoutBox.setLeft(left)
    this.layoutBox.setWidth(width)
    this.layoutBox.setHeight(height)
  }
}

function measureBoxSize(this: RenderText) {
  console.log('measureBoxSize', this.element, this.element.getContainer())
  const renderer = this.element.getContext().renderer
  const ctx = renderer.ctx
  const defaultFontFamily = renderer.defaultFontFamily
  ctx.save()
  ctx.font = `normal ${this.getTextStyles().fontSize}px ${defaultFontFamily}`

  const words = _breakWords(this.element.textContent, this.element.getContainer().computedStyles)

  const textLines = _wrapText(
    ctx,
    words,
    0,
    0,
    this.element.getContainer().getContainer().computedStyles.width,
    Number(this.getTextStyles().lineHeight) || this.getTextStyles().fontSize
  )
  ctx.restore()
  this.textLines = textLines
  this.element.computedStyles.width = textLines.maxLineWidth
  this.element.computedStyles.height = textLines.outerHeight
}

function getTextStyles(this: RenderText) {
  const parentStyles = this.element.getContainer().computedStyles
  const { color, fontSize, fontWeight, lineHeight, fontFamily } = parentStyles

  return {
    color,
    fontSize,
    fontWeight,
    lineHeight,
    fontFamily
  }
}

// TODO: 用二分法进行优化，减少ctx.measureText()调用次数
function _wrapText(
  ctx: CanvasRenderingContext2D,
  words: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): TextLines {
  let line = ''
  let testLine = ''
  let lineArray = []
  let maxLineWidth = 0
  y = lineHeight

  for (var n = 0; n < words.length; n++) {
    testLine += words[n]
    let metrics = ctx.measureText(testLine)
    let testWidth = metrics.width

    if (testWidth > maxWidth && n > 0) {
      lineArray.push([line.trim(), x, y])

      y += lineHeight
      line = words[n]
      testLine = words[n]
    } else {
      line += words[n]
    }
    if (n === words.length - 1) {
      lineArray.push([line.trim(), x, y])
    }
  }

  return {
    lines: lineArray,
    maxLineWidth,
    outerHeight: lineArray[lineArray.length - 1][2]
  }
}

// https://drafts.csswg.org/css-text/#word-separator
const wordSeparators = [0x0020, 0x00a0, 0x1361, 0x10100, 0x10101, 0x1039, 0x1091]

const _breakWords = (str: string, styles): string[] => {
  const breaker = LineBreaker(str, {
    lineBreak: styles.lineBreak,
    wordBreak: 'normal'
  })

  const words = []
  let bk

  while (!(bk = breaker.next()).done) {
    if (bk.value) {
      const value = bk.value.slice()
      const codePoints = toCodePoints(value)
      let word = ''
      codePoints.forEach((codePoint) => {
        if (wordSeparators.indexOf(codePoint) === -1) {
          word += fromCodePoint(codePoint)
        } else {
          if (word.length) {
            words.push(word)
          }
          words.push(fromCodePoint(codePoint))
          word = ''
        }
      })

      if (word.length) {
        words.push(word)
      }
    }
  }

  return words
}
