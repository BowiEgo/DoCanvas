import { Point, createPoint } from '../geometry/point'
import { Rect, createRect } from '../geometry/rect'
import { Size, createSize } from '../geometry/size'
import { pipe } from '../utils'
import { LayoutBoxModelObject, createLayoutBoxModelObject } from './layoutBoxModelObject'

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
  _isLayoutBox: boolean
  size: Size
  location: Point
  rect: Rect
  clientWidth: number
  clientHeight: number
  setWidth(width: number): void
  setHeight(height: number): void
  setX(x: number): void
  setY(y: number): void
}

export const createLayoutBox = function LayoutBox() {
  return pipe(createBaseLayoutBox())(createLayoutBoxModelObject())
}

export const createBaseLayoutBox =
  () =>
  (o: LayoutBoxModelObject): LayoutBox => {
    let size = createSize()
    let location = createPoint()
    let rect = createRect(size, location)

    let layoutBox: LayoutBox = {
      ...o,
      _isLayoutBox: true,
      size,
      location,
      rect,
      get firstChildBox() {
        return null
      },
      get firstInFlowChildBox() {
        return null
      },
      get lastChildBox() {
        return null
      },
      get clientWidth() {
        return this.size.width - this.borderLeft - this.borderRight
      },
      get clientHeight() {
        return this.size.height - this.borderTop - this.borderBottom
      },
      setWidth,
      setHeight,
      setX,
      setY
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
  if (x === this.location.x) return
  this.location.setX(x)
}

function setY(this: LayoutBox, y) {
  if (y === this.location.y) return
  this.location.setY(y)
}
