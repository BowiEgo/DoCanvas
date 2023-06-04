import { CanvasElement, ComputedStyles } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { LayoutObject, LayoutType, createBaseLayoutObject, isLayoutObject } from './layoutObject'

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

export interface LayoutBoxModelObject extends LayoutObject {
  type: LayoutType
  offsetLeft: number
  offsetTop: number
  offsetWidth: number
  offsetHeight: number
  getBoxModel(): any
}

export const createLayoutBoxModelObject = function LayoutBoxModelObject(element?: CanvasElement) {
  return pipe(
    createTreeNode<LayoutObject>(),
    createBaseLayoutObject(element),
    createBaseLayoutBoxModelObject(),
    withConstructor(LayoutBoxModelObject)
  )({})
}

export function isLayoutBoxModel(value: any): value is LayoutBoxModelObject {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.BOX_MODEL)
}

export const createBaseLayoutBoxModelObject = () => (o: LayoutObject) => {
  let layoutBoxModelObject = {
    ...o,
    type: LayoutType.BOX_MODEL,
    offsetLeft: 0,
    offsetTop: 0,
    offsetWidth: 0,
    offsetHeight: 0,
    get element() {
      return o.element
    },
    getBoxModel() {
      const {
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        borderTopWidth,
        borderBottomWidth,
        borderLeftWidth,
        borderRightWidth,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
      } = o.getStyles()

      const paddintBefore = this.physicalPaddingToLogical().before()
      const paddingAfter = this.physicalPaddingToLogical().after()
      const paddingEnd = this.physicalPaddingToLogical().end()
      const paddingOutsets = { paddingTop, paddingRight, paddingBottom, paddingLeft }

      const borderTop = borderTopWidth
      const borderBottom = borderBottomWidth
      const borderLeft = borderLeftWidth
      const borderRight = borderRightWidth
      const borderBefore = this.physicalBorderToLogical().before()
      const borderAfter = this.physicalBorderToLogical().after()
      const borderStart = this.physicalBorderToLogical().start()
      const borderEnd = this.physicalBorderToLogical().end()
      const borderWidth = borderLeftWidth + borderRightWidth
      const borderHeight = borderTopWidth + borderBottomWidth
      const borderBoxOutsets = { borderTop, borderRight, borderBottom, borderLeft }

      const marginBefore = this.physicalMarginToLogical().before()
      const marginAfter = this.physicalMarginToLogical().after()
      const marginStart = this.physicalMarginToLogical().start()
      const marginEnd = this.physicalMarginToLogical().end()
      const marginLineLeft = this.physicalMarginToLogical().lineLeft()
      const marginWidth = marginLeft + marginRight
      const marginHeight = marginTop + marginBottom
      const marginLogicalWidth = marginStart + marginEnd
      const marginLogicalHeight = marginBefore + marginAfter

      return {
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        paddintBefore,
        paddingAfter,
        paddingEnd,
        paddingOutsets,
        borderTop,
        borderBottom,
        borderLeft,
        borderRight,
        borderBefore,
        borderAfter,
        borderStart,
        borderEnd,
        borderWidth,
        borderHeight,
        borderBoxOutsets,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        marginBefore,
        marginAfter,
        marginStart,
        marginEnd,
        marginLineLeft,
        marginWidth,
        marginHeight,
        marginLogicalWidth,
        marginLogicalHeight
      }
    },
    physicalPaddingToLogical,
    physicalBorderToLogical,
    physicalMarginToLogical
  }

  return layoutBoxModelObject
}

function physicalPaddingToLogical() {
  return {
    before: () => 0,
    after: () => 0,
    end: () => 0
  }
}

function physicalBorderToLogical() {
  return {
    before: () => 0,
    after: () => 0,
    start: () => 0,
    end: () => 0
  }
}

function physicalMarginToLogical() {
  return {
    before: () => 0,
    after: () => 0,
    start: () => 0,
    end: () => 0,
    lineLeft: () => 0
  }
}
