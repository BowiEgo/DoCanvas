import { CanvasElement } from '../element/element'
import { createLayoutBox } from '../layout/layoutBox-bp'
import { createTreeNode } from '../tree-node'
import { NOOP, isAuto, pipe, pipeWithBreak, withConstructor } from '../utils'
import {
  RenderObject,
  RenderObjectOptions,
  createBaseRenderObject
} from './renderObject'

export type CreateRenderBlockFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderBlock

export interface RenderBlock extends RenderObject {}

export const createBaseRenderBlock = () => (o) => {
  let renderBlock = {
    ...o,
    type: 'block',
    layout,
    measureBoxSize
  }

  function layout() {
    console.log('layout', this)
    const {
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      marginTop,
      width,
      height
    } = this.element.computedStyles

    if (this.isRoot()) {
      if (!this.layoutBox) {
        this.layoutBox = createLayoutBox(
          null,
          0,
          0,
          this.viewport.width,
          this.viewport.height
        )
      }
    } else {
      const parentBox = this.getContainer().layoutBox
      const prevSiblingBox = this.previousSibling
        ? this.previousSibling.layoutBox
        : null

      let top =
        (prevSiblingBox ? prevSiblingBox.bottom : parentBox.top) + marginTop
      let left = parentBox.left
      let w =
        Number(borderLeftWidth) +
        Number(paddingLeft) +
        Number(width) +
        Number(paddingRight) +
        Number(borderRightWidth)
      let h =
        Number(borderTopWidth) +
        Number(paddingTop) +
        Number(height) +
        Number(paddingBottom) +
        Number(borderBottomWidth)

      if (!this.layoutBox) {
        this.layoutBox = createLayoutBox(parentBox, top, left, w, h)
      } else {
        this.layoutBox.setTop(top)
        this.layoutBox.setLeft(left)
        this.layoutBox.setWidth(w)
        this.layoutBox.setHeight(h)
      }
    }
  }

  // measure box size
  function measureBoxSize() {
    console.log('measureBoxSize', this)

    let size = {
      width: this.element.computedStyles.width,
      height: this.element.computedStyles.height
    }
    let stream = pipeWithBreak()

    const measure = (renderBlock) =>
      stream.pipe(
        _whenWithBreak(
          () => renderBlock.isRoot(),
          setRootSize(renderBlock),
          stream.breakPipe
        ),
        _whenWithBreak(
          () => !renderBlock.hasChildNode(),
          NOOP,
          stream.breakPipe
        ),
        _when(
          () => isAuto(renderBlock.element.computedStyles.width),
          calcWidthByChild(renderBlock)
        ),
        _when(
          () => isAuto(renderBlock.element.computedStyles.height),
          calcHeightByChild(renderBlock)
        )
      )(size)

    measure(this)

    this.element.computedStyles.width = size.width
    this.element.computedStyles.height = size.height
  }

  return renderBlock
}

const setRootSize = (renderBlock) => (o) => {
  o.width = renderBlock.viewport.width
  o.height = renderBlock.viewport.height
  return o
}

const calcWidthByChild = (renderBlock) => (o) => {
  o.width = renderBlock.children.reduce((acc, curr) => {
    return Number(curr.element.computedStyles.width) > acc
      ? Number(curr.element.computedStyles.width)
      : acc
  }, 0)
  return o
}

const calcHeightByChild = (renderBlock) => (o) => {
  o.height = renderBlock.children.reduce((acc, curr) => {
    return acc + Number(curr.element.computedStyles.height)
  }, 0)
  return o
}

const _when = (cond, f) => (x) => cond() ? f(x) : x

const _whenWithBreak = (cond, f, breakPipe) => (x) =>
  cond()
    ? (() => {
        breakPipe()
        return f(x)
      })()
    : x

export const createRenderBlock: CreateRenderBlockFn = function RenderBlock(
  element,
  options
) {
  return pipe(
    createTreeNode(),
    createBaseRenderObject(element, (options = {})),
    createBaseRenderBlock(),
    withConstructor(RenderBlock)
  )({} as RenderBlock)
}
