import { backgroundColor } from "./property-descriptors/background-color"
import { borderBottomColor, borderLeftColor, borderRightColor, borderTopColor } from "./property-descriptors/border-color"
import { borderBottomLeftRadius, borderBottomRightRadius, borderTopLeftRadius, borderTopRightRadius } from "./property-descriptors/border-radius"
import { borderBottomStyle, borderLeftStyle, borderRightStyle, borderTopStyle } from "./property-descriptors/border-style"
import { borderBottomWidth, borderLeftWidth, borderRightWidth, borderTopWidth } from "./property-descriptors/border-width"


export function createCSSDeclaration(styles) {
  return {
        backgroundColor: parse(backgroundColor, styles.backgroundColor),
        borderTopColor: parse(borderTopColor, styles.borderTopColor),
        borderRightColor: parse(borderRightColor, styles.borderRightColor),
        borderBottomColor: parse(borderBottomColor, styles.borderBottomColor),
        borderLeftColor: parse(borderLeftColor, styles.borderLeftColor),
        borderTopLeftRadius: parse(borderTopLeftRadius, styles.borderTopLeftRadius),
        borderTopRightRadius: parse(borderTopRightRadius, styles.borderTopRightRadius),
        borderBottomRightRadius: parse(borderBottomRightRadius, styles.borderBottomRightRadius),
        borderBottomLeftRadius: parse(borderBottomLeftRadius, styles.borderBottomLeftRadius),
        borderTopStyle: parse(borderTopStyle, styles.borderTopStyle),
        borderRightStyle: parse(borderRightStyle, styles.borderRightStyle),
        borderBottomStyle: parse(borderBottomStyle, styles.borderBottomStyle),
        borderLeftStyle: parse(borderLeftStyle, styles.borderLeftStyle),
        borderTopWidth: parse(borderTopWidth, styles.borderTopWidth),
        borderRightWidth: parse(borderRightWidth, styles.borderRightWidth),
        borderBottomWidth: parse(borderBottomWidth, styles.borderBottomWidth),
        borderLeftWidth: parse(borderLeftWidth, styles.borderLeftWidth),
        boxShadow: parse(boxShadow, styles.boxShadow),
        color: parse(color, styles.color),
        direction: parse(direction, styles.direction),
        display: parse(display, styles.display),
        float: parse(float, styles.cssFloat),
        fontFamily: parse(fontFamily, styles.fontFamily),
        fontSize: parse(fontSize, styles.fontSize),
        fontStyle: parse(fontStyle, styles.fontStyle),
        fontVariant: parse(fontVariant, styles.fontVariant),
        fontWeight: parse(fontWeight, styles.fontWeight),
        letterSpacing: parse(letterSpacing, styles.letterSpacing),
        lineBreak: parse(lineBreak, styles.lineBreak),
        lineHeight: parse(lineHeight, styles.lineHeight),
        listStyleImage: parse(listStyleImage, styles.listStyleImage),
        listStylePosition: parse(listStylePosition, styles.listStylePosition),
        listStyleType: parse(listStyleType, styles.listStyleType),
        marginTop: parse(marginTop, styles.marginTop),
        marginRight: parse(marginRight, styles.marginRight),
        marginBottom: parse(marginBottom, styles.marginBottom),
        marginLeft: parse(marginLeft, styles.marginLeft),
        opacity: parse(opacity, styles.opacity),
        const overflowTuple: parse(overflow, styles.overflow),
        overflowX: overflowTuple[0],
        overflowY: overflowTuple[overflowTuple.length > 1 ? 1 : 0],
        overflowWrap: parse(overflowWrap, styles.overflowWrap),
        paddingTop: parse(paddingTop, styles.paddingTop),
        paddingRight: parse(paddingRight, styles.paddingRight),
        paddingBottom: parse(paddingBottom, styles.paddingBottom),
        paddingLeft: parse(paddingLeft, styles.paddingLeft),
        paintOrder: parse(paintOrder, styles.paintOrder),
        position: parse(position, styles.position),
        textAlign: parse(textAlign, styles.textAlign),
        textDecorationColor: parse(
            context,
            textDecorationColor,
            styles.textDecorationColor ?? styles.color
        ),
        textDecorationLine: parse(
            context,
            textDecorationLine,
            styles.textDecorationLine ?? styles.textDecoration
        ),
        textShadow: parse(textShadow, styles.textShadow),
        textTransform: parse(textTransform, styles.textTransform),
        transform: parse(transform, styles.transform),
        transformOrigin: parse(transformOrigin, styles.transformOrigin),
        visibility: parse(visibility, styles.visibility),
        webkitTextStrokeColor: parse(webkitTextStrokeColor, styles.webkitTextStrokeColor),
        webkitTextStrokeWidth: parse(webkitTextStrokeWidth, styles.webkitTextStrokeWidth),
        wordBreak: parse(wordBreak, styles.wordBreak),
        zIndex: parse(zIndex, styles.zIndex),
  }
}

const parse = (descriptor: CSSPropertyDescriptor<any>, style?: string | null) => {

}