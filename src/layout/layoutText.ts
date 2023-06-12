import { CanvasBodyElement } from '../element/element'
import { CanvasTextNode } from '../element/textNode'
import { fromCodePoint, toCodePoints } from '../text/Util'
import { LineBreaker } from '../text/lineBreak'
import { createTreeNode } from '../tree-node'
import { createPipeLine, pipe, when, withConstructor } from '../utils'
import {
  LayoutObject,
  LayoutType,
  createBaseLayoutObject,
  isLayoutObject
} from './layoutObject'
import { createLineBox, createTextLine, lineBoxLogger } from './lineBox'

// LayoutText is the root class for anything that represents
// a text node (see core/dom/text.h).
//
// This is a common node in the tree so to the limit memory overhead,
// this class inherits directly from LayoutObject.
// Also this class is used by both CSS and SVG layouts so LayoutObject
// was a natural choice.
//
// The actual layout of text is handled by the containing Text
// (LayoutText) or block (LayoutBlockFlow). They will invoke the Unicode
// Bidirectional Algorithm to break the text into actual lines.
// The result of layout is the line box tree, which represents lines
// on the screen. It is stored into m_firstTextBox and m_lastTextBox.
// To understand how lines are broken by the bidi algorithm, read e.g.
// LayoutBlockFlow::LayoutInlineChildren.
//
//
// This class implements the preferred logical widths computation
// for its underlying text. The widths are stored into min_width_
// and max_width_. They are computed lazily based on
// LayoutObjectBitfields::intrinsic_logical_widths_dirty_.
//
// The previous comment applies also for painting. See e.g.
// BlockFlowPainter::paintContents in particular the use of LineBoxListPainter.

type TextStyles = {
  color: string
  fontSize: number
  fontWeight: string
  lineHeight: number
}

export interface LayoutText extends LayoutObject {
  element: CanvasTextNode
  getTextStyles(): TextStyles
  updateLayout(): void
}

export function isLayoutText(value: any): value is LayoutText {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.TEXT)
}

export const createLayoutText = function LayoutText(element: CanvasTextNode) {
  return pipe(
    createTreeNode<LayoutText>(),
    createBaseLayoutObject(element),
    createBaseLayoutText(),
    withConstructor(LayoutText)
  )({})
}

const createBaseLayoutText =
  () =>
  (o: LayoutObject): LayoutText => {
    let element = o.element as CanvasTextNode
    let layoutText = {
      ...o,
      element,
      type: LayoutType.TEXT,
      getTextStyles,
      updateLayout
    }

    return layoutText
  }

function getTextStyles(this: LayoutText) {
  const parentStyles = this.element.getContainer().getComputedStyles()
  const { color, fontSize, fontWeight, lineHeight } = parentStyles
  console.log('getTextStyles', this.element.getContainer())

  return {
    color,
    fontSize,
    fontWeight,
    lineHeight
  }
}

function updateLayout(this: LayoutText) {}

// TODO: 用二分法进行优化，减少ctx.measureText()调用次数
export const _breakTextLines = (layoutText) => (lineBoxs) => {
  console.log('_breakTextLines', layoutText, lineBoxs)
  // TODO: cache context
  const body = layoutText.element
    .getContainer()
    .getRootNode() as CanvasBodyElement
  const ctx = body.context.renderer.ctx
  const defaultFontFamily = body.context.renderer.defaultFontFamily
  let { fontSize, lineHeight, fontFamily } = layoutText.getTextStyles()
  lineHeight = Number(lineHeight)

  lineBoxs.currLineHeight = Math.max(lineBoxs.currLineHeight, lineHeight)

  ctx.save()
  ctx.font = `normal ${fontSize}px ${fontFamily || defaultFontFamily}`

  console.log(fontSize, lineHeight, body, ctx)

  const words = _breakWords(
    layoutText.element.text,
    layoutText.element.getContainer().getComputedStyles()
  )

  let metrics = null
  let testWidth = lineBoxs.end
  let currTextLine = createTextLine(
    '',
    lineBoxs.end,
    lineBoxs.lastLineBefore + lineBoxs.currLineHeight,
    0,
    0
  )
  let isOutOfBox = false

  const initTest = (word) => (lineBoxs) => {
    metrics = ctx.measureText(word)
    testWidth += metrics.width

    return lineBoxs
  }

  const appendWordToCurrLine = (word, index) => (lineBoxs) => {
    currTextLine.text += word
    currTextLine.rect.size.addWidth(metrics.width)
    lineBoxs.currLineHeight = Math.max(lineBoxs.currLineHeight, lineHeight)

    if (index === 0 && lineBoxs.end === 0) {
      lineBoxs.after += lineBoxs.currLineHeight
    }

    lineBoxs.end += metrics.width
    return lineBoxs
  }

  const appendWordToNewLine = (word) => (lineBoxs) => {
    lineBoxs.currLine = createLineBox(
      0,
      lineBoxs.after,
      metrics.width,
      lineBoxs.currLineHeight
    )
    lineBoxs.currLineHeight = lineHeight
    lineBoxs.after += lineBoxs.currLineHeight
    lineBoxs.end = metrics.width

    currTextLine = createTextLine(
      word,
      0,
      lineBoxs.after,
      metrics.width,
      metrics.fontBoundingBoxAscent
    )
  }

  const createNewLine = (word) => (lineBoxs) => {
    lineBoxs.currLine.addChild(currTextLine)
    lineBoxs.lineArray.push(lineBoxs.currLine)
    appendWordToNewLine(word.trim())(lineBoxs)
    testWidth = metrics.width

    return lineBoxs
  }

  const checkIfOutOfBox = (index) => (lineBoxs) => {
    isOutOfBox = testWidth >= lineBoxs.maxWidth && index > 0

    return lineBoxs
  }

  const checkIsLastWord = (index) => (lineBoxs) => {
    if (index === words.length - 1) {
      lineBoxs.currLine.addChild(currTextLine)
      lineBoxs.lineArray.push(lineBoxs.currLine)
    }
    return lineBoxs
  }

  const { pipeLine, breakPipe } = createPipeLine()

  words.forEach((word, index) =>
    pipeLine(
      initTest(word),
      checkIfOutOfBox(index),
      when(() => !isOutOfBox, appendWordToCurrLine(word, index)),
      when(() => isOutOfBox, createNewLine(word)),
      // when(() => isOutOfBox, lineBoxsLogger('after-text-createNewLine:')),
      checkIsLastWord(index)
    )(lineBoxs)
  )

  return lineBoxs
}

// https://drafts.csswg.org/css-text/#word-separator
const wordSeparators = [
  0x0020, 0x00a0, 0x1361, 0x10100, 0x10101, 0x1039, 0x1091
]

export const _breakWords = (str: string, styles): string[] => {
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
