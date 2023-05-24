import { CSSPropertyDescriptor } from './IPropertyDescriptor'
import { DEFAULT_TEXT_STYLES, DEFAULT_VIEW_STYLES } from './constant'
import { backgroundClip } from './property-descriptors/background-clip'
import { backgroundColor } from './property-descriptors/background-color'
import {
  borderBottomColor,
  borderLeftColor,
  borderRightColor,
  borderTopColor
} from './property-descriptors/border-color'
import {
  borderBottomLeftRadius,
  borderBottomRightRadius,
  borderTopLeftRadius,
  borderTopRightRadius
} from './property-descriptors/border-radius'
import {
  borderBottomWidth,
  borderLeftWidth,
  borderRightWidth,
  borderTopWidth
} from './property-descriptors/border-width'
import { color } from './property-descriptors/color'
import { display } from './property-descriptors/display'
import { fontSize } from './property-descriptors/font-size'
import { fontWeight } from './property-descriptors/font-weight'
import { height } from './property-descriptors/height'
import { lineHeight } from './property-descriptors/line-height'
import {
  marginBottom,
  marginLeft,
  marginRight,
  marginTop
} from './property-descriptors/margin'
import { opacity } from './property-descriptors/opacity'
import {
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop
} from './property-descriptors/padding'
import { textAlign } from './property-descriptors/text-align'
import { transform } from './property-descriptors/transform'
import { visibility } from './property-descriptors/visibility'
import { width } from './property-descriptors/width'
import { zIndex } from './property-descriptors/z-index'

export function createCSSDeclaration(type, styles) {
  const DEFAULT_STYLES = getDefaultStyle(type)
  return {
    ...DEFAULT_STYLES,
    backgroundClip: parse(type, backgroundClip, styles.backgroundClip),
    backgroundColor: parse(type, backgroundColor, styles.backgroundColor),
    borderTopColor: parse(type, borderTopColor, styles.borderTopColor),
    borderRightColor: parse(type, borderRightColor, styles.borderRightColor),
    borderBottomColor: parse(type, borderBottomColor, styles.borderBottomColor),
    borderLeftColor: parse(type, borderLeftColor, styles.borderLeftColor),
    // borderTopLeftRadius: parse(
    //   type,
    //   borderTopLeftRadius,
    //   styles.borderTopLeftRadius
    // ),
    // borderTopRightRadius: parse(
    //   type,
    //   borderTopRightRadius,
    //   styles.borderTopRightRadius
    // ),
    // borderBottomRightRadius: parse(
    //   type,
    //   borderBottomRightRadius,
    //   styles.borderBottomRightRadius
    // ),
    // borderBottomLeftRadius: parse(
    //   type,
    //   borderBottomLeftRadius,
    //   styles.borderBottomLeftRadius
    // ),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    // borderTopStyle: parse(type,borderTopStyle, styles.borderTopStyle),
    // borderRightStyle: parse(type,borderRightStyle, styles.borderRightStyle),
    // borderBottomStyle: parse(type,borderBottomStyle, styles.borderBottomStyle),
    // borderLeftStyle: parse(type,borderLeftStyle, styles.borderLeftStyle),
    // borderTopWidth: parse(type, borderTopWidth, styles.borderTopWidth),
    // borderRightWidth: parse(type, borderRightWidth, styles.borderRightWidth),
    // borderBottomWidth: parse(type, borderBottomWidth, styles.borderBottomWidth),
    // borderLeftWidth: parse(type, borderLeftWidth, styles.borderLeftWidth),
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    // boxShadow: parse(type,boxShadow, styles.boxShadow),
    color: parse(type, color, styles.color),
    // direction: parse(type,direction, styles.direction),
    display: parse(type, display, styles.display),
    // float: parse(float, styles.cssFloat),
    // fontFamily: parse(fontFamily, styles.fontFamily),
    fontSize: Number(parse(type, fontSize, styles.fontSize)),
    // fontStyle: parse(type,fontStyle, styles.fontStyle),
    // fontVariant: parse(type,fontVariant, styles.fontVariant),
    fontWeight: parse(type, fontWeight, styles.fontWeight),
    height: parse(type, height, styles.height),
    // letterSpacing: parse(type,letterSpacing, styles.letterSpacing),
    // lineBreak: parse(type,lineBreak, styles.lineBreak),
    lineHeight: parse(type, lineHeight, styles.lineHeight),
    // listStyleImage: parse(type,listStyleImage, styles.listStyleImage),
    // listStylePosition: parse(type,listStylePosition, styles.listStylePosition),
    // listStyleType: parse(type,listStyleType, styles.listStyleType),
    marginTop: Number(parse(type, marginTop, styles.marginTop)),
    marginRight: Number(parse(type, marginRight, styles.marginRight)),
    marginBottom: Number(parse(type, marginBottom, styles.marginBottom)),
    marginLeft: Number(parse(type, marginLeft, styles.marginLeft)),
    opacity: parse(type, opacity, styles.opacity),
    // const overflowTuple: parse(type,overflow, styles.overflow),
    // overflowX: overflowTuple[0],
    // overflowY: overflowTuple[overflowTuple.length > 1 ? 1 : 0],
    // overflowWrap: parse(type,overflowWrap, styles.overflowWrap),
    paddingTop: Number(parse(type, paddingTop, styles.paddingTop)),
    paddingRight: Number(parse(type, paddingRight, styles.paddingRight)),
    paddingBottom: Number(parse(type, paddingBottom, styles.paddingBottom)),
    paddingLeft: Number(parse(type, paddingLeft, styles.paddingLeft)),
    // paintOrder: parse(type,paintOrder, styles.paintOrder),
    // position: parse(type,position, styles.position),
    textAlign: parse(type, textAlign, styles.textAlign),
    // textDecorationColor: parse(type,
    //     context,
    //     textDecorationColor,
    //     styles.textDecorationColor ?? styles.color
    // ),
    // textDecorationLine: parse(type,
    //     context,
    //     textDecorationLine,
    //     styles.textDecorationLine ?? styles.textDecoration
    // ),
    // textShadow: parse(type,textShadow, styles.textShadow),
    // textTransform: parse(type,textTransform, styles.textTransform),
    transform: parse(type, transform, styles.transform),
    // transformOrigin: parse(type,transformOrigin, styles.transformOrigin),
    visibility: parse(type, visibility, styles.visibility),
    // webkitTextStrokeColor: parse(type,webkitTextStrokeColor, styles.webkitTextStrokeColor),
    // webkitTextStrokeWidth: parse(type,webkitTextStrokeWidth, styles.webkitTextStrokeWidth),
    width: parse(type, width, styles.width),
    // wordBreak: parse(type,wordBreak, styles.wordBreak),
    zIndex: parse(type, zIndex, styles.zIndex)
  }
}

const parse = (
  // TODO: enum type
  type: string,
  descriptor: CSSPropertyDescriptor<any>,
  style?: string | null
) => {
  const value =
    style !== null && typeof style !== 'undefined'
      ? style.toString()
      : typeof descriptor.initialValue === 'string'
      ? descriptor.initialValue
      : descriptor.initialValue(type)

  // TODO: finish tokenizer
  return value
}

function getDefaultStyle(type) {
  switch (type) {
    case 'text':
      return DEFAULT_TEXT_STYLES
    default:
      return DEFAULT_VIEW_STYLES
  }
}
