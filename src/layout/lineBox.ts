import { CanvasBodyElement } from '../element/element'
import { createPoint } from '../geometry/point'
import { Rect, createRect } from '../geometry/rect'
import { createSize } from '../geometry/size'
import { fromCodePoint, toCodePoints } from '../text/Util'
import { LineBreaker } from '../text/lineBreak'
import { pipeLine, when } from '../utils'
import { LayoutInlineBlock } from './layoutInlineBlock'
import { isLayoutText } from './layoutText'

export type Line = {
  children: Array<LayoutInlineBlock | TextLine>
  rect: Rect
}

export type TextLine = {
  text: string
  rect: Rect
}

export interface LineBox {
  lineArray: []
  end: number
  after: number
  maxWidth: number
  height: number
  currLineHeight: number
  lastLineBefore: number
  currLine: Line
  lastLine: Line
}

export function createLineBox(childLayout, maxWidth) {
  let lineBox = {
    lineArray: [],
    end: 0,
    after: 0,
    maxWidth,
    currLine: createLine(),
    currLineHeight: 0,
    get height() {
      return this.after
    },
    get lastLine() {
      return this.lineArray[this.lineArray.length - 1]
    },
    get lastLineBefore() {
      return this.after - (this.lastLine ? this.lastLine.rect.height : 0)
    }
  }

  _breakLines(childLayout)(lineBox)

  console.log('createLineBox', lineBox)

  return lineBox
}

const _breakLines = (childLayout) => (lineBox) => {
  const walk = (lineBox) =>
    childLayout.forEach((child, index) => {
      const grandChild = child.children[0]

      pipeLine(
        when(() => !isLayoutText(grandChild), _breakBlockLines(child, index, childLayout)),
        when(() => isLayoutText(grandChild), _breakTextLines(grandChild)),
        when(
          () => !isLayoutText(grandChild) && isLayoutText(childLayout[index + 1]),
          () => {
            lineBox.lineArray.push(lineBox.currLine)
          }
        )
      )(lineBox)
    })

  walk(lineBox)
}

function createLine(
  relativeX: number = 0,
  relativeY: number = 0,
  width: number = 0,
  height: number = 0,
  child?
) {
  let line = {
    children: [],
    rect: createRect(createPoint(relativeX, relativeY), createSize(width, height)),
    addChild(child) {
      this.children.push(child)
    }
  }

  child && line.addChild(child)

  return line
}

function createTextLine(text, relativeX, relativeY, width, height) {
  let textLine = {
    text,
    rect: createRect(createPoint(relativeX, relativeY), createSize(width, height))
  }

  return textLine
}

const logger = (message) => (lineBox) => {
  console.log(message, lineBox.currLine, lineBox.after, lineBox.lastLineBefore)
  return lineBox
}

const _breakBlockLines = (child, index, childLayout) => (lineBox) => {
  console.log('_breakBlockLines', child, index, childLayout)
  let testWidth = lineBox.end
  let isOutOfBox = false

  const initTest = () => (lineBox) => {
    testWidth += child.size.width
    return lineBox
  }

  const appendChildToCurrLine = () => (lineBox) => {
    lineBox.currLine.addChild(child)
    lineBox.end += child.size.width
    lineBox.currLineHeight = Math.max(lineBox.currLineHeight, child.size.height)
    lineBox.currLine.rect.size.setHeight(lineBox.currLineHeight)

    if (index === 0) {
      lineBox.currLineHeight = child.size.height
      lineBox.after += lineBox.currLineHeight
    }
    return lineBox
  }

  const appendChildToNewLine = () => {
    lineBox.currLine.addChild(child)
    lineBox.end = child.size.width
  }

  const createNewLine = () => (lineBox) => {
    lineBox.lineArray.push(lineBox.currLine)
    lineBox.currLine = createLine(0, lineBox.after, child.size.width, child.size.height)
    appendChildToNewLine()
    lineBox.currLineHeight = child.size.height
    lineBox.after += lineBox.currLineHeight
    return lineBox
  }

  const checkIfOutOfBox = () => (lineBox) => {
    isOutOfBox = testWidth > lineBox.maxWidth && index > 0
    return lineBox
  }

  const checkIsLastChild = () => (lineBox) => {
    if (index === childLayout.length - 1) {
      lineBox.lineArray.push(lineBox.currLine)
    }
    return lineBox
  }

  const resetChildLocation = () => (lineBox) => {
    console.log('resetChildLocation-11', childLayout[index + 1])
    if (childLayout[index + 1] && isLayoutText(childLayout[index + 1].children[0])) {
      lineBox.lineArray.push(lineBox.currLine)
    }
    child.setX(lineBox.end - child.size.width)
    console.log('resetChildLocation', lineBox.lastLineBefore, lineBox.after, lineBox.lastLine)
    child.setY(lineBox.lastLineBefore)
    return lineBox
  }

  pipeLine(
    initTest(),
    checkIfOutOfBox(),
    logger('after-block-checkIfOutOfBox:'),
    when(() => !isOutOfBox, appendChildToCurrLine()),
    when(() => !isOutOfBox, logger('after-block-addChild:')),
    when(() => isOutOfBox, createNewLine()),
    when(() => isOutOfBox, logger('after-block-createNewLine:')),
    checkIsLastChild(),
    resetChildLocation(),
    logger('after-block-resetChildLocation:')
  )(lineBox)

  return lineBox
}

// TODO: 用二分法进行优化，减少ctx.measureText()调用次数
const _breakTextLines = (layoutText) => (lineBox) => {
  // TODO: cache context
  const body = layoutText.element.getContainer().getRootNode() as CanvasBodyElement
  const ctx = body.context.renderer.ctx
  const defaultFontFamily = body.context.renderer.defaultFontFamily
  let { fontSize, lineHeight, fontFamily } = layoutText.getTextStyles()
  lineHeight = Number(lineHeight)

  ctx.save()
  ctx.font = `normal ${fontSize}px ${fontFamily || defaultFontFamily}`

  const words = _breakWords(
    layoutText.element.text,
    layoutText.element.getContainer().getComputedStyles()
  )

  let testLineText = ''
  let metrics = null
  let testWidth = lineBox.end
  let currTextLine = createTextLine(
    '',
    lineBox.end,
    lineBox.lastLineBefore + lineBox.currLineHeight,
    0,
    0
  )
  let isOutOfBox = false

  const initTest = (word) => (lineBox) => {
    testLineText += word
    metrics = ctx.measureText(word)
    testWidth += metrics.width

    return lineBox
  }

  const addWord = (word) => (lineBox) => {
    currTextLine.text += word
    currTextLine.rect.size.addWidth(metrics.width)
    lineBox.currLineHeight = Math.max(lineBox.currLineHeight, lineHeight)
    lineBox.end += metrics.width
    return lineBox
  }

  const createNewLine = (word) => (lineBox) => {
    lineBox.currLine.addChild(currTextLine)
    lineBox.lineArray.push(lineBox.currLine)
    lineBox.currLine = createLine(0, lineBox.after, metrics.width, lineBox.currLineHeight)
    lineBox.currLineHeight = lineHeight
    lineBox.after += lineBox.currLineHeight
    lineBox.end = metrics.width

    currTextLine = createTextLine(
      word,
      0,
      lineBox.after,
      metrics.width,
      metrics.fontBoundingBoxAscent
    )
    testWidth = metrics.width

    return lineBox
  }

  const checkIfOutOfBox = (index) => (lineBox) => {
    isOutOfBox = testWidth >= lineBox.maxWidth && index > 0
    return lineBox
  }

  const checkIsLastWord = (index) => (lineBox) => {
    if (index === words.length - 1) {
      lineBox.currLine.addChild(currTextLine)
      lineBox.lineArray.push(lineBox.currLine)
      lineBox.end += metrics.width
    }
    return lineBox
  }

  words.forEach((word, index) =>
    pipeLine(
      initTest(word),
      checkIfOutOfBox(index),
      when(() => !isOutOfBox, addWord(word)),
      when(() => isOutOfBox, createNewLine(word)),
      checkIsLastWord(index)
    )(lineBox)
  )

  return lineBox
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
