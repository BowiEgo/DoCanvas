import { createPoint } from '../geometry/point'
import { Rect, createRect } from '../geometry/rect'
import { createSize } from '../geometry/size'
import { fromCodePoint, toCodePoints } from '../text/Util'
// import { splitGraphemes } from '../text/graphemeBreak'
import { createPipeLine, when } from '../utils'
import {
  LayoutInlineBlock,
  _breakBlockLines,
  isLayoutInlineBlock
} from './layoutInlineBlock'
import { LayoutObject, LayoutType } from './layoutObject'
import { _breakTextLines, isLayoutText } from './layoutText'

// https://www.w3.org/TR/CSS21/visuren.html#inline-formatting
// https://www.w3.org/TR/2002/WD-css3-linebox-20020515/
// https://www.w3.org/TR/css-inline-3/#line-box
export type LineBox = {
  children: Array<LayoutInlineBlock | TextLine>
  rect: Rect
}

export type TextLine = {
  text: string
  rect: Rect
}

export interface LineBoxs {
  type: LayoutType
  layouts: LayoutObject[]
  lineArray: any[]
  end: number
  after: number
  maxWidth: number
  height: number
  currLineHeight: number
  lastLineBefore: number
  currLine: LineBox
  lastLine: LineBox
  breakLines(): void
  addLayout(layout: LayoutObject): void
}

export function isLineBoxs(value: any): value is LineBoxs {
  return value && !!(value.type & LayoutType.LINE_BOXS)
}

export function createLineBoxs(maxWidth): LineBoxs {
  let lineBoxs = {
    type: LayoutType.LINE_BOXS,
    layouts: [],
    lineArray: [],
    end: 0,
    after: 0,
    maxWidth,
    currLine: createLineBox(),
    currLineHeight: 0,
    get height() {
      return this.after
    },
    get lastLine() {
      return this.lineArray[this.lineArray.length - 1]
    },
    get lastLineBefore() {
      return this.lastLine ? this.after - this.lastLine.rect.height : 0
    },
    init() {
      this.lineArray = []
      this.end = 0
      this.after = 0
      this.currLine = createLineBox()
      this.currLineHeight = 0
    },
    breakLines() {
      this.init()
      const lineBoxs = this
      const { pipeLine, breakPipe } = createPipeLine()

      lineBoxs.layouts.forEach((layout, index) => {
        pipeLine(
          when(() => !isLayoutText(layout), _breakBlockLines(layout)),
          when(() => isLayoutText(layout), _breakTextLines(layout))
        )(lineBoxs)
      })
    },
    addLayout(layout) {
      this.layouts.push(layout)
    }
  }

  return lineBoxs
}

export function createLineBox(
  relativeX: number = 0,
  relativeY: number = 0,
  width: number = 0,
  height: number = 0,
  child?
) {
  let lineBox = {
    children: [],
    rect: createRect(
      createPoint(relativeX, relativeY),
      createSize(width, height)
    ),
    addChild(child) {
      this.children.push(child)
    }
  }

  child && lineBox.addChild(child)

  return lineBox
}

export const lineBoxLogger = (message) => (lineBox) => {
  console.log(message, lineBox.currLine, lineBox.after, lineBox.lastLineBefore)
  return lineBox
}
