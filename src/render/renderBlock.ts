import { CanvasElement } from '../element/element'
import { LayoutBox, createLayoutBox } from '../layout/layoutBox-bp'
import { createTreeNode } from '../tree-node'
import { NOOP, breakPipe, isAuto, pipe, pipeLine, when, withConstructor } from '../utils'
import { RenderObject, RenderObjectOptions, createBaseRenderObject } from './renderObject'

type Bounds = {
  parentBox: LayoutBox
  top: number
  left: number
  width: number
  height: number
}

type Size = {
  width: number
  height: number
}

export type CreateRenderBlockFn = (
  element: CanvasElement,
  options?: RenderObjectOptions
) => RenderBlock

export interface RenderBlock extends RenderObject {}

export const createRenderBlock: CreateRenderBlockFn = function RenderBlock(element, options = {}) {
  return pipe(
    createTreeNode<RenderObject>(),
    createBaseRenderObject(element, options),
    createBaseRenderBlock(),
    withConstructor(RenderBlock)
  )({} as RenderBlock)
}

export const createBaseRenderBlock =
  () =>
  (o: RenderObject): RenderBlock => {
    let renderBlock: RenderBlock = {
      ...o,
      type: 'block',
      layout,
      measureBoxSize
    }

    return renderBlock
  }

function layout(this: RenderBlock) {
  const calc = (renderBlock: RenderBlock): Bounds =>
    pipeLine(
      when(() => renderBlock.isRoot(), initRootBounds(renderBlock), breakPipe),
      calcBounds(renderBlock)
    )({
      parentBox: null,
      top: 0,
      left: 0,
      width: 0,
      height: 0
    })

  let bounds = calc(this)

  if (!this.layoutBox) {
    initLayout(this, bounds)
  } else {
    updateLayout(this, bounds)
  }
}

// measure box size
function measureBoxSize(this: RenderBlock) {
  const measure = (renderBlock: RenderBlock): Size =>
    pipeLine(
      initSize(renderBlock),
      when(() => renderBlock.isRoot(), setRootSize(renderBlock), breakPipe),
      when(() => !renderBlock.hasChildNode(), NOOP, breakPipe),
      when(
        () => isAuto(renderBlock.element.getComputedStyles().width),
        calcWidthByChild(renderBlock)
      ),
      when(
        () => isAuto(renderBlock.element.getComputedStyles().height),
        calcHeightByChild(renderBlock)
      )
    )({ width: 0, height: 0 })

  let size = measure(this)

  this.element.setComputedStyles('width', size.width)
  this.element.setComputedStyles('height', size.height)
}

const initRootBounds =
  (renderBlock: RenderBlock) =>
  (o): Bounds => {
    o.width = renderBlock.viewport.width
    o.height = renderBlock.viewport.height

    return o
  }

const calcBounds =
  (renderBlock: RenderBlock) =>
  (o): Bounds => {
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
    } = renderBlock.element.getComputedStyles()

    const parentBox = renderBlock.getContainer().layoutBox
    const prevSiblingBox = renderBlock.previousSibling
      ? renderBlock.previousSibling.layoutBox
      : null

    let _top = (prevSiblingBox ? prevSiblingBox.bottom : parentBox.top) + marginTop
    let _left = parentBox.left
    let _width =
      Number(borderLeftWidth) +
      Number(paddingLeft) +
      Number(width) +
      Number(paddingRight) +
      Number(borderRightWidth)
    let _height =
      Number(borderTopWidth) +
      Number(paddingTop) +
      Number(height) +
      Number(paddingBottom) +
      Number(borderBottomWidth)

    o.parentBox = parentBox
    o.top = _top
    o.left = _left
    o.width = _width
    o.height = _height
    return o
  }

const initLayout = (renderBlock: RenderBlock, bounds: Bounds): void => {
  renderBlock.layoutBox = createLayoutBox(
    bounds.parentBox,
    bounds.top,
    bounds.left,
    bounds.width,
    bounds.height
  )
}

const updateLayout = (renderBlock: RenderBlock, bounds: Bounds): void => {
  renderBlock.layoutBox.setTop(bounds.top)
  renderBlock.layoutBox.setLeft(bounds.left)
  renderBlock.layoutBox.setWidth(bounds.width)
  renderBlock.layoutBox.setHeight(bounds.height)
}

const initSize =
  (renderBlock: RenderBlock) =>
  (o: Bounds): Bounds => {
    o.width = renderBlock.element.getComputedStyles().width
    o.height = renderBlock.element.getComputedStyles().height
    return o
  }

const setRootSize =
  (renderBlock: RenderBlock) =>
  (o: Bounds): Bounds => {
    o.width = renderBlock.viewport.width
    o.height = renderBlock.viewport.height
    return o
  }

const calcWidthByChild =
  (renderBlock: RenderBlock) =>
  (o: Size): Size => {
    o.width = renderBlock.children.reduce((acc, curr) => {
      return Number(curr.element.getComputedStyles().width) > acc
        ? Number(curr.element.getComputedStyles().width)
        : acc
    }, 0)
    return o
  }

const calcHeightByChild =
  (renderBlock: RenderBlock) =>
  (o: Size): Size => {
    o.height = renderBlock.children.reduce((acc, curr) => {
      return acc + Number(curr.element.getComputedStyles().height)
    }, 0)
    return o
  }
