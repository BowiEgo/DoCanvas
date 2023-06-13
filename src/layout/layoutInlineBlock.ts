import { CanvasElement } from '../element/element'
import { createPipeLine, pipe, when, withConstructor } from '../utils'
import { LayoutBox, createBaseLayoutBox } from './layoutBox'
import { createLayoutInline } from './layoutInline'
import { LayoutType, isLayoutObject } from './layoutObject'
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

export const _breakBlockLines = (child) => (lineBoxs) => {
  let testWidth = lineBoxs.end
  let isOutOfBox = false

  const initTest = () => (lineBoxs) => {
    testWidth += child.size.width
    return lineBoxs
  }

  const appendChildToCurrLine = () => (lineBoxs) => {
    if (child.size.height > lineBoxs.currLineHeight) {
      lineBoxs.currLine.children.forEach((item) => {
        item.rect.location.moveY(child.size.height - lineBoxs.currLineHeight)
      })
      lineBoxs.after += child.size.height - lineBoxs.currLineHeight
      lineBoxs.currLine.rect.size.setHeight(child.size.height)
      lineBoxs.currLineHeight = child.size.height
    }
    lineBoxs.currLine.addChild(child)
    lineBoxs.end += child.size.width
    lineBoxs.currLine.rect.size.setHeight(lineBoxs.currLineHeight)

    return lineBoxs
  }

  const appendChildToNewLine = () => (lineBoxs) => {
    lineBoxs.currLine.addChild(child)
    lineBoxs.end = child.size.width
  }

  const createNewLine = () => (lineBoxs) => {
    lineBoxs.lineArray.push(lineBoxs.currLine)
    lineBoxs.currLine = createLineBox(
      0,
      lineBoxs.after,
      child.size.width,
      child.size.height
    )
    appendChildToNewLine()(lineBoxs)
    lineBoxs.currLineHeight = child.size.height
    lineBoxs.after += lineBoxs.currLineHeight
    return lineBoxs
  }

  const checkIfOutOfBox = () => (lineBoxs) => {
    const index = lineBoxs.layouts.indexOf(child)
    isOutOfBox = testWidth > lineBoxs.maxWidth && index > 0
    return lineBoxs
  }

  const checkIsLastChild = () => (lineBoxs) => {
    const index = lineBoxs.layouts.indexOf(child)
    if (index === lineBoxs.layouts.length - 1) {
      lineBoxs.lineArray.push(lineBoxs.currLine)
    }
    return lineBoxs
  }

  const resetChildLocation = () => (lineBoxs) => {
    // const index = lineBoxs.layouts.indexOf(child)
    // if (
    //   lineBoxs.layouts[index + 1] &&
    //   isLayoutText(lineBoxs.layouts[index + 1])
    // ) {
    //   console.log('_breakBlockLines-resetChildLocation', child, lineBoxs)
    //   lineBoxs.lineArray.push(lineBoxs.currLine)
    // }
    child.setX(lineBoxs.end - child.size.width)
    child.setY(lineBoxs.after - child.size.height)
    return lineBoxs
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
  )(lineBoxs)

  return lineBoxs
}
