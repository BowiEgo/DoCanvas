import { CanvasBodyElement, CanvasElement, Layout, isCanvasElement } from '../element/element'
import { Point, createPoint } from '../geometry/point'
import { Rect, createRect } from '../geometry/rect'
import { Size, createSize } from '../geometry/size'
import { NOOP, breakPipe, isAuto, pipe, pipeLine, when, withConstructor } from '../utils'
import { isAnonymousLayoutBlock } from './layoutBlock'
import { LayoutBoxModelObject, createLayoutBoxModelObject } from './layoutBoxModelObject'
import { LayoutType, isLayoutObject } from './layoutObject'

// LayoutBox implements the full CSS box model.
//
// LayoutBoxModelObject only introduces some abstractions for LayoutInline and
// LayoutBox. The logic for the model is in LayoutBox, e.g. the storage for the
// rectangle and offset forming the CSS box (frame_location_ and frame_size_)
// and the getters for the different boxes.
//
// LayoutBox is also the uppermost class to support scrollbars, however the
// logic is delegated to PaintLayerScrollableArea.
// Per the CSS specification, scrollbars should "be inserted between the inner
// border edge and the outer padding edge".
// (see http://www.w3.org/TR/CSS21/visufx.html#overflow)
// Also the scrollbar width / height are removed from the content box. Taking
// the following example:
//
// <!DOCTYPE html>
// <style>
// ::-webkit-scrollbar {
//     /* Force non-overlay scrollbars */
//     width: 10px;
//     height: 20px;
// }
// </style>
// <div style="overflow:scroll; width: 100px; height: 100px">
//
// The <div>'s content box is not 100x100 as specified in the style but 90x80 as
// we remove the scrollbars from the box.
//
// The presence of scrollbars is determined by the 'overflow' property and can
// be conditioned on having layout overflow (see OverflowModel for more details
// on how we track overflow).
//
// There are 2 types of scrollbars:
// - non-overlay scrollbars take space from the content box.
// - overlay scrollbars don't and just overlay hang off from the border box,
//   potentially overlapping with the padding box's content.
// For more details on scrollbars, see PaintLayerScrollableArea.
//
//
// ***** THE BOX MODEL *****
// The CSS box model is based on a series of nested boxes:
// http://www.w3.org/TR/CSS21/box.html
//
//       |----------------------------------------------------|
//       |                                                    |
//       |                   margin-top                       |
//       |                                                    |
//       |     |-----------------------------------------|    |
//       |     |                                         |    |
//       |     |             border-top                  |    |
//       |     |                                         |    |
//       |     |    |--------------------------|----|    |    |
//       |     |    |                          |    |    |    |
//       |     |    |       padding-top        |####|    |    |
//       |     |    |                          |####|    |    |
//       |     |    |    |----------------|    |####|    |    |
//       |     |    |    |                |    |    |    |    |
//       | ML  | BL | PL |  content box   | PR | SW | BR | MR |
//       |     |    |    |                |    |    |    |    |
//       |     |    |    |----------------|    |    |    |    |
//       |     |    |                          |    |    |    |
//       |     |    |      padding-bottom      |    |    |    |
//       |     |    |--------------------------|----|    |    |
//       |     |    |                      ####|    |    |    |
//       |     |    |     scrollbar height ####| SC |    |    |
//       |     |    |                      ####|    |    |    |
//       |     |    |-------------------------------|    |    |
//       |     |                                         |    |
//       |     |           border-bottom                 |    |
//       |     |                                         |    |
//       |     |-----------------------------------------|    |
//       |                                                    |
//       |                 margin-bottom                      |
//       |                                                    |
//       |----------------------------------------------------|
//
// BL = border-left
// BR = border-right
// ML = margin-left
// MR = margin-right
// PL = padding-left
// PR = padding-right
// SC = scroll corner (contains UI for resizing (see the 'resize' property)
// SW = scrollbar width
//
// Note that the vertical scrollbar (if existing) will be on the left in
// right-to-left direction and horizontal writing-mode. The horizontal scrollbar
// (if existing) is always at the bottom.
//
// Those are just the boxes from the CSS model. Extra boxes are tracked by Blink
// (e.g. the overflows). Thus it is paramount to know which box a function is
// manipulating. Also of critical importance is the coordinate system used (see
// the COORDINATE SYSTEMS section in LayoutBoxModelObject).

export interface LayoutBox extends LayoutBoxModelObject {
  element: CanvasElement
  size: Size
  location: Point
  rect: Rect
  firstChildBox(): null
  firstInFlowChildBox(): null
  lastChildBox(): null
  clientWidth(): number
  clientHeight(): number
  setWidth(width: number): void
  setHeight(height: number): void
  setX(x: number): void
  setY(y: number): void
  moveX(distance: number): void
  moveY(distance: number): void
  updateSize(): void
  updateLocation(): void
}

export function generateBoxModelType() {
  let type = LayoutType.BOX_MODEL
  type |= LayoutType.BOX
  return type
}

export function isLayoutBox(value: any): value is LayoutBox {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.BOX)
}

export const createLayoutBox = function LayoutBox(element?: CanvasElement) {
  return pipe(
    createBaseLayoutBox(),
    withConstructor(LayoutBox)
  )(createLayoutBoxModelObject(element))
}

export const createBaseLayoutBox =
  () =>
  (o: LayoutBoxModelObject): LayoutBox => {
    let size = createSize()
    let location = createPoint()
    let rect = createRect(location, size)

    let layoutBox: LayoutBox = {
      ...o,
      element: o.element as CanvasElement,
      type: generateBoxModelType(),
      size,
      location,
      rect,
      firstChildBox() {
        return null
      },
      firstInFlowChildBox() {
        return null
      },
      lastChildBox() {
        return null
      },
      clientWidth() {
        return this.size.width - this.borderLeft - this.borderRight
      },
      clientHeight() {
        return this.size.height - this.borderTop - this.borderBottom
      },
      setWidth,
      setHeight,
      setX,
      setY,
      moveX,
      moveY,
      updateSize,
      updateLocation
    }

    return layoutBox
  }

function setWidth(this: LayoutBox, width) {
  if (width === this.size.width) return
  this.size.setWidth(width)
}

function setHeight(this: LayoutBox, height) {
  if (height === this.size.height) return
  this.size.setHeight(height)
}

function setX(this: LayoutBox, x) {
  console.log('setX', this, x, this.location.x)
  if (x === this.location.x) return
  this.location.setX(x)
}

function setY(this: LayoutBox, y) {
  if (y === this.location.y) return
  this.location.setY(y)
}

function moveX(this: LayoutBox, distance) {
  this.location.moveX(distance)
}

function moveY(this: LayoutBox, distance) {
  this.location.moveY(distance)
}

function updateSize(this: LayoutBox) {
  const size = _measureSize(this)
  this.size.setWidth(size.width)
  this.size.setHeight(size.height)
  console.log('updateSize', this.size)
}

function updateLocation(this: LayoutBox) {
  console.log('updateLocation', this)

  if (isAnonymousLayoutBlock(this.getContainer())) {
    const container = this.getContainer() as LayoutBox
    this.moveX(container.rect.start)
    this.moveY(container.rect.before)
    return
  }

  let location = _calcPos(this)

  this.setX(location.x)
  this.setY(location.y)
}

const _measureSize = (layoutBox: LayoutBox): Size =>
  pipeLine(
    _initSize(layoutBox.element),
    when(
      () => layoutBox.element.isBody(),
      _calcBodySize(layoutBox.element as CanvasBodyElement),
      breakPipe
    ),
    when(() => !layoutBox.hasChildNode(), NOOP, breakPipe),
    when(() => isAuto(layoutBox.getStyles().width), _calcWidthByChild(layoutBox)),
    when(() => isAuto(layoutBox.getStyles().height), _calcHeightByChild(layoutBox))
  )(createSize())

const _calcPos = (layoutBox: LayoutBox): Point =>
  pipeLine(
    when(() => layoutBox.element && layoutBox.element.isBody(), NOOP, breakPipe),
    _calcPosByParentAndPrevSibling(layoutBox)
  )(createPoint())

const _calcPosByParentAndPrevSibling =
  (layoutBox: LayoutBox) =>
  (o): Point => {
    const parentBox = layoutBox.getContainer() as LayoutBox
    const prevSiblingBox = layoutBox.previousSibling as LayoutBox
    const parentBoxBefore = parentBox ? parentBox.rect.before : 0

    let x = parentBox ? parentBox.rect.start : 0
    let y =
      (prevSiblingBox ? prevSiblingBox.rect.after : parentBoxBefore) +
      (isAnonymousLayoutBlock(layoutBox) ? 0 : layoutBox.getBoxModel().marginTop)
    console.log(
      'updateLocation-2222',
      layoutBox,
      isAnonymousLayoutBlock(layoutBox),
      parentBoxBefore
    )

    o.setX(x)
    o.setY(y)

    return o
  }

// const calcBounds =
//   (renderBlock: RenderBlock) =>
//   (o): Bounds => {
//     const {
//       borderTopWidth,
//       borderBottomWidth,
//       borderLeftWidth,
//       borderRightWidth,
//       paddingTop,
//       paddingBottom,
//       paddingLeft,
//       paddingRight,
//       marginTop,
//       width,
//       height
//     } = renderBlock.element.computedStyles

//     const parentBox = renderBlock.getContainer().layoutBox
//     const prevSiblingBox = renderBlock.previousSibling
//       ? renderBlock.previousSibling.layoutBox
//       : null

//     let _top = (prevSiblingBox ? prevSiblingBox.bottom : parentBox.top) + marginTop
//     let _left = parentBox.left
//     let _width =
//       Number(borderLeftWidth) +
//       Number(paddingLeft) +
//       Number(width) +
//       Number(paddingRight) +
//       Number(borderRightWidth)
//     let _height =
//       Number(borderTopWidth) +
//       Number(paddingTop) +
//       Number(height) +
//       Number(paddingBottom) +
//       Number(borderBottomWidth)

//     o.parentBox = parentBox
//     o.top = _top
//     o.left = _left
//     o.width = _width
//     o.height = _height
//     return o
//   }

// const initLayout = (renderBlock: RenderBlock, bounds: Bounds): void => {
//   renderBlock.layoutBox = createLayoutBox(
//     bounds.parentBox,
//     bounds.top,
//     bounds.left,
//     bounds.width,
//     bounds.height
//   )
// }

// const updateLayout = (renderBlock: RenderBlock, bounds: Bounds): void => {
//   renderBlock.layoutBox.setTop(bounds.top)
//   renderBlock.layoutBox.setLeft(bounds.left)
//   renderBlock.layoutBox.setWidth(bounds.width)
//   renderBlock.layoutBox.setHeight(bounds.height)
// }

const _initSize =
  (element: CanvasElement) =>
  (o: Size): Size => {
    o.setWidth(Number(element.getComputedStyles().width))
    o.setHeight(Number(element.getComputedStyles().height))
    return o
  }

const _calcBodySize =
  (element: CanvasBodyElement) =>
  (o: Size): Size => {
    o.setWidth(element.context.viewport.width)
    o.setHeight(element.context.viewport.height)
    return o
  }

const _calcWidthByChild =
  (layoutBox: LayoutBox) =>
  (o: Size): Size => {
    o.width = layoutBox.children
      .filter((item): item is LayoutBox => isLayoutBox(item))
      .reduce((acc, curr) => {
        return Number(curr.size.width) > acc ? Number(curr.size.width) : acc
      }, 0)
    return o
  }

const _calcHeightByChild =
  (layoutBox: LayoutBox) =>
  (o: Size): Size => {
    o.height = layoutBox.children
      .filter((item): item is LayoutBox => isLayoutBox(item))
      .reduce((acc, curr) => {
        console.log(curr)
        return acc + Number(curr.size ? curr.size.height : 0)
      }, 0)
    return o
  }
