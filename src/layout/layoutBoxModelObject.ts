import { CanvasElement } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { LayoutObject, createBaseLayoutObject } from './layoutObject'

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

export interface LayoutBoxModelObject<T> extends LayoutObject<T> {}

export const createLayoutBoxModelObject = function LayoutBoxModelObject<T>(element: CanvasElement) {
  return pipe(
    createTreeNode<T>(),
    createBaseLayoutObject<T>(element),
    createBaseLayoutBoxModelObject<T>(),
    withConstructor(LayoutBoxModelObject)
  )({})
}

export const createBaseLayoutBoxModelObject =
  <T>() =>
  (o: LayoutObject<T>) => {
    let layoutBoxModelObject = {
      ...o,
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 0,
      offsetHeight: 0,
      paddingTop() {
        return this.getStyles().paddingTop || 0
      },
      paddingBottom() {
        return this.getStyles().paddingBottom || 0
      },
      paddingLeft() {
        return this.getStyles().paddingLeft || 0
      },
      paddingRight() {
        return this.getStyles().paddingRight || 0
      },
      paddingBefore() {
        return this.physicalPaddingToLogical().before()
      },
      paddingAfter() {
        return this.physicalPaddingToLogical().after()
      },
      paddingEnd() {
        return this.physicalPaddingToLogical().end()
      },
      borderTop() {
        return this.getStyles().borderTopWidth || 0
      },
      borderBottom() {
        return this.getStyles().borderBottomWidth || 0
      },
      borderLeft() {
        return this.getStyles().borderLeftWidth || 0
      },
      borderRight() {
        return this.getStyles().borderRightWidth || 0
      },
      borderBefore() {
        return this.physicalBorderToLogical().before()
      },
      borderAfter() {
        return this.physicalBorderToLogical().after()
      },
      borderStart() {
        return this.physicalBorderToLogical().start()
      },
      borderEnd() {
        return this.physicalBorderToLogical().end()
      },
      borderWidth() {
        return this.borderLeft + this.borderRight
      },
      borderHeight() {
        return this.borderTop + this.borderBottom
      },
      borderBoxOutsets() {
        const { borderTop, borderRight, borderBottom, borderLeft } = this
        return { borderTop, borderRight, borderBottom, borderLeft }
      },
      paddingOutsets() {
        const { paddingTop, paddingRight, paddingBottom, paddingLeft } = this
        return { paddingTop, paddingRight, paddingBottom, paddingLeft }
      },
      marginTop() {
        return this.getStyles().marginTop || 0
      },
      marginBottom() {
        return this.getStyles().marginBottom || 0
      },
      marginLeft() {
        return this.getStyles().marginLeft || 0
      },
      marginRight() {
        return this.getStyles().marginRight || 0
      },
      marginBefore() {
        return this.physicalMarginToLogical().before()
      },
      marginAfter() {
        return this.physicalMarginToLogical().after()
      },
      marginStart() {
        return this.physicalMarginToLogical().start()
      },
      marginEnd() {
        return this.physicalMarginToLogical().end()
      },
      marginLineLeft() {
        return this.physicalMarginToLogical().lineLeft()
      },
      marginWidth() {
        return this.marginLeft + this.marginRight
      },
      marginHeight() {
        return this.marginTop + this.marginBottom
      },
      marginLogicalWidth() {
        return this.marginStart + this.marginEnd
      },
      marginLogicalHeight() {
        return this.marginBefore + this.marginAfter
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
