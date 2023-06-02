import { LayoutObject } from './layoutObject'

// ***** COORDINATE SYSTEMS *****
//
// In order to fully understand LayoutBoxModelObject and the inherited classes,
// we need to introduce the concept of coordinate systems.
// There are 4 coordinate systems:
// - physical coordinates: it is the coordinate system used for painting and
//   correspond to physical direction as seen on the physical display (screen,
//   printed page). In CSS, 'top', 'right', 'bottom', 'left' are all in physical
//   coordinates. The code matches this convention too.
//
// - logical coordinates: this is the coordinate system used for layout. It is
//   determined by 'writing-mode' and 'direction'. Any property using 'before',
//   'after', 'start' or 'end' is in logical coordinates. Those are also named
//   respectively 'logical top', 'logical bottom', 'logical left' and
//   'logical right'.
//
// Example with writing-mode: vertical-rl; direction: ltr;
//
//                    'top' / 'start' side
//
//                     block-flow direction
//           <------------------------------------ |
//           ------------------------------------- |
//           |        c   |          s           | |
// 'left'    |        o   |          o           | |   inline     'right'
//    /      |        n   |          m           | |  direction      /
// 'after'   |        t   |          e           | |              'before'
//  side     |        e   |                      | |                side
//           |        n   |                      | |
//           |        t   |                      | |
//           ------------------------------------- v
//
//                 'bottom' / 'end' side
//
// See https://drafts.csswg.org/css-writing-modes-3/#text-flow for some
// extra details.
//
// - physical coordinates with flipped block-flow direction: those are physical
//   coordinates but we flipped the block direction. Almost all geometries
//   in box layout use this coordinate space, except those having explicit
//   "Logical" or "Physical" prefix in their names, or the name implies logical
//   (e.g. InlineStart, BlockEnd) or physical (e.g. Top, Left), or the return
//   type is PhysicalRect.
//
// - logical coordinates without flipping inline direction: those are "logical
//   block coordinates", without considering text direction. Examples are
//   "LogicalLeft" and "LogicalRight".
//
// For more information, see the following doc about coordinate spaces:
// https://chromium.googlesource.com/chromium/src.git/+/main/third_party/blink/renderer/core/layout/README.md#coordinate-spaces

// export interface LayoutBoxModelObject<T> extends LayoutObject<T> {}

// export const createLayoutBoxModelObject = function LayoutBoxModelObject<T>(element: CanvasElement) {
//   return pipe(
//     createBaseLayoutObject<T>(element),
//     createBaseLayoutBoxModelObject<T>(),
//     withConstructor(LayoutBoxModelObject)
//   )(new TreeNode())
// }

export class LayoutBoxModelObject extends LayoutObject {
  offsetLeft: number = 0
  offsetTop: number = 0
  offsetWidth: number = 0
  offsetHeight: number = 0
  get paddingTop() {
    return super.getStyles().paddingTop || 0
  }
  get paddingBottom() {
    return super.getStyles().paddingBottom || 0
  }
  get paddingLeft() {
    return super.getStyles().paddingLeft || 0
  }
  get paddingRight() {
    return super.getStyles().paddingRight || 0
  }
  get paddingBefore() {
    return this.physicalPaddingToLogical().before()
  }
  get paddingAfter() {
    return this.physicalPaddingToLogical().after()
  }
  get paddingEnd() {
    return this.physicalPaddingToLogical().end()
  }
  get borderTop() {
    return super.getStyles().borderTopWidth || 0
  }
  get borderBottom() {
    return super.getStyles().borderBottomWidth || 0
  }
  get borderLeft() {
    return super.getStyles().borderLeftWidth || 0
  }
  get borderRight() {
    return super.getStyles().borderRightWidth || 0
  }
  get borderBefore() {
    return this.physicalBorderToLogical().before()
  }
  get borderAfter() {
    return this.physicalBorderToLogical().after()
  }
  get borderStart() {
    return this.physicalBorderToLogical().start()
  }
  get borderEnd() {
    return this.physicalBorderToLogical().end()
  }
  get borderWidth() {
    return this.borderLeft + this.borderRight
  }
  get borderHeight() {
    return this.borderTop + this.borderBottom
  }
  get borderBoxOutsets() {
    const { borderTop, borderRight, borderBottom, borderLeft } = this
    return { borderTop, borderRight, borderBottom, borderLeft }
  }
  get paddingOutsets() {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = this
    return { paddingTop, paddingRight, paddingBottom, paddingLeft }
  }
  get marginTop() {
    return super.getStyles().marginTop
  }
  constructor(element) {
    super(element)
  }
  physicalPaddingToLogical() {
    return {
      before: () => 0,
      after: () => 0,
      end: () => 0
    }
  }
  physicalBorderToLogical() {
    return {
      before: () => 0,
      after: () => 0,
      start: () => 0,
      end: () => 0
    }
  }
  physicalMarginToLogical() {
    return {
      before: () => 0,
      after: () => 0,
      start: () => 0,
      end: () => 0,
      lineLeft: () => 0
    }
  }
}
