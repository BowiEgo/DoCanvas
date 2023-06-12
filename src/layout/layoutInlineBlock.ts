import { CanvasElement } from '../element/element'
import { createPipeLine, pipe, when, withConstructor } from '../utils'
import { LayoutBox, createBaseLayoutBox } from './layoutBox'
import { createLayoutInline } from './layoutInline'
import { LayoutType, isLayoutObject } from './layoutObject'
import { isLayoutText } from './layoutText'
import { createLineBox, lineBoxLogger } from './lineBox'

export interface LayoutInlineBlock extends LayoutBox {
  // updateLayout(): void
}

export function generateInlineBlockType() {
  let type = LayoutType.BOX_MODEL
  type |= LayoutType.BOX
  type |= LayoutType.INLINE
  type |= LayoutType.INLINE_BLOCK
  return type
}

export function isLayoutInlineBlock(value: any): value is LayoutInlineBlock {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.INLINE_BLOCK)
}

export const createLayoutInlineBlock = function LayoutInlineBlock(
  element: CanvasElement
) {
  return pipe(
    createBaseLayoutBox(),
    createBaseLayoutInlineBlock(),
    withConstructor(LayoutInlineBlock)
  )(createLayoutInline(element))
}

const createBaseLayoutInlineBlock =
  () =>
  (o: LayoutBox): LayoutInlineBlock => {
    let layoutInlineBlock = {
      ...o,
      type: generateInlineBlockType()
    }

    return layoutInlineBlock
  }

export const _breakBlockLines = (child, index, childLayout) => (lineBox) => {
  let testWidth = lineBox.end
  let isOutOfBox = false

  const initTest = () => (lineBox) => {
    console.log('initTest', child)
    testWidth += child.size.width
    return lineBox
  }

  const appendChildToCurrLine = () => (lineBox) => {
    if (child.size.height > lineBox.currLineHeight) {
      lineBox.currLine.children.forEach((item) => {
        item.rect.location.moveY(child.size.height - lineBox.currLineHeight)
      })
      lineBox.after += child.size.height - lineBox.currLineHeight
      lineBox.currLine.rect.size.setHeight(child.size.height)
      lineBox.currLineHeight = child.size.height
    }
    lineBox.currLine.addChild(child)
    lineBox.end += child.size.width
    lineBox.currLine.rect.size.setHeight(lineBox.currLineHeight)

    return lineBox
  }

  const appendChildToNewLine = () => (lineBox) => {
    lineBox.currLine.addChild(child)
    lineBox.end = child.size.width
  }

  const createNewLine = () => (lineBox) => {
    lineBox.lineArray.push(lineBox.currLine)
    lineBox.currLine = createLineBox(
      0,
      lineBox.after,
      child.size.width,
      child.size.height
    )
    appendChildToNewLine()(lineBox)
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
    if (
      childLayout[index + 1] &&
      isLayoutText(childLayout[index + 1].children[0])
    ) {
      lineBox.lineArray.push(lineBox.currLine)
    }
    child.setX(lineBox.end - child.size.width)
    child.setY(lineBox.lastLineBefore)
    return lineBox
  }

  const { pipeLine, breakPipe } = createPipeLine()

  pipeLine(
    initTest(),
    checkIfOutOfBox(),
    // lineBoxLogger('after-block-checkIfOutOfBox:'),
    when(() => !isOutOfBox, appendChildToCurrLine()),
    // when(() => !isOutOfBox, lineBoxLogger('after-block-addChild:')),
    when(() => isOutOfBox, createNewLine()),
    // when(() => isOutOfBox, lineBoxLogger('after-block-createNewLine:')),
    checkIsLastChild(),
    resetChildLocation()
    // lineBoxLogger('after-block-resetChildLocation:')
  )(lineBox)

  return lineBox
}
