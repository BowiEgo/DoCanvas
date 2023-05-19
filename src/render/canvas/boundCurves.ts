import {
  getAbsoluteValue,
  getAbsoluteValueForTuple
} from '../../css/types/length-percentage'
import { BezierCurve } from './bezierCurve'
import { Path } from './path'
import { Vector } from './vector'

export interface BoundCurves {
  topWidth: number
  rightHeight: number
  bottomWidth: number
  leftHeight: number
  borderTopWidth: number
  borderRightWidth: number
  borderBottomWidth: number
  borderLeftWidth: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  topLeftBorderDoubleOuterBox: Path
  topRightBorderDoubleOuterBox: Path
  bottomRightBorderDoubleOuterBox: Path
  bottomLeftBorderDoubleOuterBox: Path
  topLeftBorderDoubleInnerBox: Path
  topRightBorderDoubleInnerBox: Path
  bottomRightBorderDoubleInnerBox: Path
  bottomLeftBorderDoubleInnerBox: Path
  topLeftBorderStroke: Path
  topRightBorderStroke: Path
  bottomRightBorderStroke: Path
  bottomLeftBorderStroke: Path
  topLeftBorderBox: Path
  topRightBorderBox: Path
  bottomRightBorderBox: Path
  bottomLeftBorderBox: Path
  topLeftPaddingBox: Path
  topRightPaddingBox: Path
  bottomRightPaddingBox: Path
  bottomLeftPaddingBox: Path
  topLeftContentBox: Path
  topRightContentBox: Path
  bottomRightContentBox: Path
  bottomLeftContentBox: Path
}

export function createBoundCurves(renderObject) {
  let styles = renderObject.computedStyles
  let bounds = renderObject.layoutBox

  let [tlh, tlv] = getAbsoluteValueForTuple(
    styles.borderTopLeftRadius,
    bounds.width,
    bounds.height
  )
  let [trh, trv] = getAbsoluteValueForTuple(
    styles.borderTopRightRadius,
    bounds.width,
    bounds.height
  )
  let [brh, brv] = getAbsoluteValueForTuple(
    styles.borderBottomRightRadius,
    bounds.width,
    bounds.height
  )
  let [blh, blv] = getAbsoluteValueForTuple(
    styles.borderBottomLeftRadius,
    bounds.width,
    bounds.height
  )

  const factors = []
  factors.push((tlh + trh) / bounds.width)
  factors.push((blh + brh) / bounds.width)
  factors.push((tlv + blv) / bounds.height)
  factors.push((trv + brv) / bounds.height)
  const maxFactor = Math.max(...factors)

  if (maxFactor > 1) {
    tlh /= maxFactor
    tlv /= maxFactor
    trh /= maxFactor
    trv /= maxFactor
    brh /= maxFactor
    brv /= maxFactor
    blh /= maxFactor
    blv /= maxFactor
  }

  const topWidth = bounds.width - trh
  const rightHeight = bounds.height - brv
  const bottomWidth = bounds.width - brh
  const leftHeight = bounds.height - blv

  // const borderTopWidth = styles.borderTopWidth
  // const borderRightWidth = styles.borderRightWidth
  // const borderBottomWidth = styles.borderBottomWidth
  // const borderLeftWidth = styles.borderLeftWidth
  const borderTopWidth = 0
  const borderRightWidth = 0
  const borderBottomWidth = 0
  const borderLeftWidth = 0

  const paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width)
  const paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width)
  const paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width)
  const paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width)

  console.log('4444-createBoundCurves', styles, bounds, paddingTop)

  let boundCurves = {
    topWidth,
    rightHeight,
    bottomWidth,
    leftHeight,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    topLeftBorderDoubleOuterBox: null,
    topRightBorderDoubleOuterBox: null,
    bottomRightBorderDoubleOuterBox: null,
    bottomLeftBorderDoubleOuterBox: null,
    topLeftBorderDoubleInnerBox: null,
    topRightBorderDoubleInnerBox: null,
    bottomRightBorderDoubleInnerBox: null,
    bottomLeftBorderDoubleInnerBox: null,
    topLeftBorderStroke: null,
    topRightBorderStroke: null,
    bottomRightBorderStroke: null,
    bottomLeftBorderStroke: null,
    topLeftBorderBox: null,
    topRightBorderBox: null,
    bottomRightBorderBox: null,
    bottomLeftBorderBox: null,
    topLeftPaddingBox: null,
    topRightPaddingBox: null,
    bottomRightPaddingBox: null,
    bottomLeftPaddingBox: null,
    topLeftContentBox: null,
    topRightContentBox: null,
    bottomRightContentBox: null,
    bottomLeftContentBox: null
  }

  boundCurves.topLeftBorderDoubleOuterBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth / 3,
          bounds.top + borderTopWidth / 3,
          tlh - borderLeftWidth / 3,
          tlv - borderTopWidth / 3,
          CORNER.TOP_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth / 3,
          bounds.top + borderTopWidth / 3
        )
  boundCurves.topRightBorderDoubleOuterBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + topWidth,
          bounds.top + borderTopWidth / 3,
          trh - borderRightWidth / 3,
          trv - borderTopWidth / 3,
          CORNER.TOP_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - borderRightWidth / 3,
          bounds.top + borderTopWidth / 3
        )
  boundCurves.bottomRightBorderDoubleOuterBox =
    brh > 0 || brv > 0
      ? getCurvePoints(
          bounds.left + bottomWidth,
          bounds.top + rightHeight,
          brh - borderRightWidth / 3,
          brv - borderBottomWidth / 3,
          CORNER.BOTTOM_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - borderRightWidth / 3,
          bounds.top + bounds.height - borderBottomWidth / 3
        )
  boundCurves.bottomLeftBorderDoubleOuterBox =
    blh > 0 || blv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth / 3,
          bounds.top + leftHeight,
          blh - borderLeftWidth / 3,
          blv - borderBottomWidth / 3,
          CORNER.BOTTOM_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth / 3,
          bounds.top + bounds.height - borderBottomWidth / 3
        )
  boundCurves.topLeftBorderDoubleInnerBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + (borderLeftWidth * 2) / 3,
          bounds.top + (borderTopWidth * 2) / 3,
          tlh - (borderLeftWidth * 2) / 3,
          tlv - (borderTopWidth * 2) / 3,
          CORNER.TOP_LEFT
        )
      : new Vector(
          bounds.left + (borderLeftWidth * 2) / 3,
          bounds.top + (borderTopWidth * 2) / 3
        )
  boundCurves.topRightBorderDoubleInnerBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + topWidth,
          bounds.top + (borderTopWidth * 2) / 3,
          trh - (borderRightWidth * 2) / 3,
          trv - (borderTopWidth * 2) / 3,
          CORNER.TOP_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - (borderRightWidth * 2) / 3,
          bounds.top + (borderTopWidth * 2) / 3
        )
  boundCurves.bottomRightBorderDoubleInnerBox =
    brh > 0 || brv > 0
      ? getCurvePoints(
          bounds.left + bottomWidth,
          bounds.top + rightHeight,
          brh - (borderRightWidth * 2) / 3,
          brv - (borderBottomWidth * 2) / 3,
          CORNER.BOTTOM_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - (borderRightWidth * 2) / 3,
          bounds.top + bounds.height - (borderBottomWidth * 2) / 3
        )
  boundCurves.bottomLeftBorderDoubleInnerBox =
    blh > 0 || blv > 0
      ? getCurvePoints(
          bounds.left + (borderLeftWidth * 2) / 3,
          bounds.top + leftHeight,
          blh - (borderLeftWidth * 2) / 3,
          blv - (borderBottomWidth * 2) / 3,
          CORNER.BOTTOM_LEFT
        )
      : new Vector(
          bounds.left + (borderLeftWidth * 2) / 3,
          bounds.top + bounds.height - (borderBottomWidth * 2) / 3
        )
  boundCurves.topLeftBorderStroke =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth / 2,
          bounds.top + borderTopWidth / 2,
          tlh - borderLeftWidth / 2,
          tlv - borderTopWidth / 2,
          CORNER.TOP_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth / 2,
          bounds.top + borderTopWidth / 2
        )
  boundCurves.topRightBorderStroke =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + topWidth,
          bounds.top + borderTopWidth / 2,
          trh - borderRightWidth / 2,
          trv - borderTopWidth / 2,
          CORNER.TOP_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - borderRightWidth / 2,
          bounds.top + borderTopWidth / 2
        )
  boundCurves.bottomRightBorderStroke =
    brh > 0 || brv > 0
      ? getCurvePoints(
          bounds.left + bottomWidth,
          bounds.top + rightHeight,
          brh - borderRightWidth / 2,
          brv - borderBottomWidth / 2,
          CORNER.BOTTOM_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - borderRightWidth / 2,
          bounds.top + bounds.height - borderBottomWidth / 2
        )
  boundCurves.bottomLeftBorderStroke =
    blh > 0 || blv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth / 2,
          bounds.top + leftHeight,
          blh - borderLeftWidth / 2,
          blv - borderBottomWidth / 2,
          CORNER.BOTTOM_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth / 2,
          bounds.top + bounds.height - borderBottomWidth / 2
        )
  boundCurves.topLeftBorderBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT)
      : new Vector(bounds.left, bounds.top)
  boundCurves.topRightBorderBox =
    trh > 0 || trv > 0
      ? getCurvePoints(
          bounds.left + topWidth,
          bounds.top,
          trh,
          trv,
          CORNER.TOP_RIGHT
        )
      : new Vector(bounds.left + bounds.width, bounds.top)
  boundCurves.bottomRightBorderBox =
    brh > 0 || brv > 0
      ? getCurvePoints(
          bounds.left + bottomWidth,
          bounds.top + rightHeight,
          brh,
          brv,
          CORNER.BOTTOM_RIGHT
        )
      : new Vector(bounds.left + bounds.width, bounds.top + bounds.height)
  boundCurves.bottomLeftBorderBox =
    blh > 0 || blv > 0
      ? getCurvePoints(
          bounds.left,
          bounds.top + leftHeight,
          blh,
          blv,
          CORNER.BOTTOM_LEFT
        )
      : new Vector(bounds.left, bounds.top + bounds.height)
  boundCurves.topLeftPaddingBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth,
          bounds.top + borderTopWidth,
          Math.max(0, tlh - borderLeftWidth),
          Math.max(0, tlv - borderTopWidth),
          CORNER.TOP_LEFT
        )
      : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth)
  boundCurves.topRightPaddingBox =
    trh > 0 || trv > 0
      ? getCurvePoints(
          bounds.left + Math.min(topWidth, bounds.width - borderRightWidth),
          bounds.top + borderTopWidth,
          topWidth > bounds.width + borderRightWidth
            ? 0
            : Math.max(0, trh - borderRightWidth),
          Math.max(0, trv - borderTopWidth),
          CORNER.TOP_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - borderRightWidth,
          bounds.top + borderTopWidth
        )
  boundCurves.bottomRightPaddingBox =
    brh > 0 || brv > 0
      ? getCurvePoints(
          bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth),
          bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth),
          Math.max(0, brh - borderRightWidth),
          Math.max(0, brv - borderBottomWidth),
          CORNER.BOTTOM_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - borderRightWidth,
          bounds.top + bounds.height - borderBottomWidth
        )
  boundCurves.bottomLeftPaddingBox =
    blh > 0 || blv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth,
          bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth),
          Math.max(0, blh - borderLeftWidth),
          Math.max(0, blv - borderBottomWidth),
          CORNER.BOTTOM_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth,
          bounds.top + bounds.height - borderBottomWidth
        )
  boundCurves.topLeftContentBox =
    tlh > 0 || tlv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth + paddingLeft,
          bounds.top + borderTopWidth + paddingTop,
          Math.max(0, tlh - (borderLeftWidth + paddingLeft)),
          Math.max(0, tlv - (borderTopWidth + paddingTop)),
          CORNER.TOP_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth + paddingLeft,
          bounds.top + borderTopWidth + paddingTop
        )
  boundCurves.topRightContentBox =
    trh > 0 || trv > 0
      ? getCurvePoints(
          bounds.left +
            Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft),
          bounds.top + borderTopWidth + paddingTop,
          topWidth > bounds.width + borderLeftWidth + paddingLeft
            ? 0
            : trh - borderLeftWidth + paddingLeft,
          trv - (borderTopWidth + paddingTop),
          CORNER.TOP_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - (borderRightWidth + paddingRight),
          bounds.top + borderTopWidth + paddingTop
        )
  boundCurves.bottomRightContentBox =
    brh > 0 || brv > 0
      ? getCurvePoints(
          bounds.left +
            Math.min(
              bottomWidth,
              bounds.width - (borderLeftWidth + paddingLeft)
            ),
          bounds.top +
            Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop),
          Math.max(0, brh - (borderRightWidth + paddingRight)),
          brv - (borderBottomWidth + paddingBottom),
          CORNER.BOTTOM_RIGHT
        )
      : new Vector(
          bounds.left + bounds.width - (borderRightWidth + paddingRight),
          bounds.top + bounds.height - (borderBottomWidth + paddingBottom)
        )
  boundCurves.bottomLeftContentBox =
    blh > 0 || blv > 0
      ? getCurvePoints(
          bounds.left + borderLeftWidth + paddingLeft,
          bounds.top + leftHeight,
          Math.max(0, blh - (borderLeftWidth + paddingLeft)),
          blv - (borderBottomWidth + paddingBottom),
          CORNER.BOTTOM_LEFT
        )
      : new Vector(
          bounds.left + borderLeftWidth + paddingLeft,
          bounds.top + bounds.height - (borderBottomWidth + paddingBottom)
        )

  return boundCurves
}

enum CORNER {
  TOP_LEFT = 0,
  TOP_RIGHT = 1,
  BOTTOM_RIGHT = 2,
  BOTTOM_LEFT = 3
}

const getCurvePoints = (
  x: number,
  y: number,
  r1: number,
  r2: number,
  position: CORNER
): BezierCurve => {
  const kappa = 4 * ((Math.sqrt(2) - 1) / 3)
  const ox = r1 * kappa // control point offset horizontal
  const oy = r2 * kappa // control point offset vertical
  const xm = x + r1 // x-middle
  const ym = y + r2 // y-middle

  switch (position) {
    case CORNER.TOP_LEFT:
      return new BezierCurve(
        new Vector(x, ym),
        new Vector(x, ym - oy),
        new Vector(xm - ox, y),
        new Vector(xm, y)
      )
    case CORNER.TOP_RIGHT:
      return new BezierCurve(
        new Vector(x, y),
        new Vector(x + ox, y),
        new Vector(xm, ym - oy),
        new Vector(xm, ym)
      )
    case CORNER.BOTTOM_RIGHT:
      return new BezierCurve(
        new Vector(xm, y),
        new Vector(xm, y + oy),
        new Vector(x + ox, ym),
        new Vector(x, ym)
      )
    case CORNER.BOTTOM_LEFT:
    default:
      return new BezierCurve(
        new Vector(xm, ym),
        new Vector(xm - ox, ym),
        new Vector(x, y + oy),
        new Vector(x, y)
      )
  }
}

export const calculateBorderBoxPath = (curves: BoundCurves): Path[] => {
  return [
    curves.topLeftBorderBox,
    curves.topRightBorderBox,
    curves.bottomRightBorderBox,
    curves.bottomLeftBorderBox
  ]
}

export const calculateContentBoxPath = (curves: BoundCurves): Path[] => {
  return [
    curves.topLeftContentBox,
    curves.topRightContentBox,
    curves.bottomRightContentBox,
    curves.bottomLeftContentBox
  ]
}

export const calculatePaddingBoxPath = (curves: BoundCurves): Path[] => {
  return [
    curves.topLeftPaddingBox,
    curves.topRightPaddingBox,
    curves.bottomRightPaddingBox,
    curves.bottomLeftPaddingBox
  ]
}
