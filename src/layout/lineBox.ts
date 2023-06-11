import { createPoint } from '../geometry/point'
import { Rect, createRect } from '../geometry/rect'
import { createSize } from '../geometry/size'
import { fromCodePoint, toCodePoints } from '../text/Util'
// import { splitGraphemes } from '../text/graphemeBreak'
import { pipeLine, when } from '../utils'
import { LayoutInlineBlock, _breakBlockLines } from './layoutInlineBlock'
import { _breakTextLines, isLayoutText } from './layoutText'

// https://www.w3.org/TR/CSS21/visuren.html#inline-formatting
// https://www.w3.org/TR/2002/WD-css3-linebox-20020515/
// https://www.w3.org/TR/css-inline-3/#line-box
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
  console.log('createLineBox', childLayout, maxWidth)
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
      return this.lastLine ? this.after - this.lastLine.rect.height : 0
    }
  }

  _breakLines(childLayout)(lineBox)

  return lineBox
}

const _breakLines = (childLayout) => (lineBox) => {
  console.log('_breakLines', childLayout)
  const walk = (lineBox) =>
    childLayout.forEach((child, index) => {
      const grandChild = child.children[0]

      pipeLine(
        when(
          () => !isLayoutText(grandChild),
          _breakBlockLines(child, index, childLayout)
        ),
        when(() => isLayoutText(grandChild), _breakTextLines(grandChild)),
        when(
          () =>
            !isLayoutText(grandChild) && isLayoutText(childLayout[index + 1]),
          () => {
            lineBox.lineArray.push(lineBox.currLine)
          }
        )
      )(lineBox)
    })

  walk(lineBox)
}

export function createLine(
  relativeX: number = 0,
  relativeY: number = 0,
  width: number = 0,
  height: number = 0,
  child?
) {
  let line = {
    children: [],
    rect: createRect(
      createPoint(relativeX, relativeY),
      createSize(width, height)
    ),
    addChild(child) {
      this.children.push(child)
    }
  }

  child && line.addChild(child)

  return line
}

export function createTextLine(text, relativeX, relativeY, width, height) {
  let location = createPoint(relativeX, relativeY)
  let size = createSize(width, height)

  let textLine = {
    text,
    location,
    size,
    rect: createRect(location, size)
  }

  return textLine
}

export const lineBoxLogger = (message) => (lineBox) => {
  console.log(message, lineBox.currLine, lineBox.after, lineBox.lastLineBefore)
  return lineBox
}
