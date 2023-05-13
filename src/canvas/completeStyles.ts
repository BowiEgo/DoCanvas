import { isExact, isAuto, isOuter } from '../utils'
import CONSTANT from './styleConstant'

export default function completeStyles(styles, containerStyles, isInFlow) {
  _completeFlex(styles, containerStyles)

  _completeWidth(styles, containerStyles, isInFlow)

  _completeBorder(styles)

  _completeFont(styles)

  _completePaddingMargin(styles)
}

function _completeFlex(styles, containerStyles) {
  if (containerStyles.display === CONSTANT.DISPLAY.FLEX) {
    // flex布局内 width 和flex需要有一个
    if (!styles.flex) {
      if (!isExact(styles.height) && !isExact(styles.width)) {
        styles.flex = 1
      }
    } else {
      if (containerStyles.flexDirection === 'column' && isExact(styles.flex)) {
        styles.height = 0
      } else if (
        containerStyles.flexDirection === 'row' &&
        isExact(styles.flex)
      ) {
        styles.width = 0
      }
    }
  }
}

function _completeWidth(styles, containerStyles, isInFlow) {
  if (!styles.width) {
    if (
      styles.display === CONSTANT.DISPLAY.INLINE_BLOCK ||
      styles.display === CONSTANT.DISPLAY.INLINE ||
      !isInFlow
    ) {
      styles.width = CONSTANT.WIDTH.AUTO
    } else if (
      styles.display === CONSTANT.DISPLAY.BLOCK ||
      styles.display === CONSTANT.DISPLAY.FLEX
    ) {
      styles.width = CONSTANT.WIDTH.OUTER
    } else {
      styles.width = 0
    }
  }

  if (isOuter(styles.width)) {
    if (isAuto(containerStyles.width)) {
      styles.width = CONSTANT.WIDTH.AUTO
    }
  }

  if (isOuter(styles.height)) {
    if (isAuto(containerStyles.height)) {
      styles.height = CONSTANT.WIDTH.AUTO
    }
  }
}

/**
 * borderwidth到各个边
 */
function _completeBorder(styles) {
  let {
    borderWidth,
    borderLeftWidth,
    borderRightWidth,
    borderBottomWidth,
    borderTopWidth,
    borderRadius
  } = styles
  if (!borderWidth) {
    styles.borderWidth = 0
    borderWidth = 0
  }
  if (Array.isArray(borderWidth)) {
    styles.borderTopWidth = borderWidth[0]
    styles.borderRightWidth = borderWidth[1]
    styles.borderBottomWidth = borderWidth[2]
    styles.borderLeftWidth = borderWidth[3]
  } else {
    if (!borderLeftWidth) {
      styles.borderLeftWidth = borderWidth
    }
    if (!borderRightWidth) {
      styles.borderRightWidth = borderWidth
    }
    if (!borderBottomWidth) {
      styles.borderBottomWidth = borderWidth
    }
    if (!borderTopWidth) {
      styles.borderTopWidth = borderWidth
    }
  }
  if (borderRadius) {
    styles.overflow = 'hidden'
  }
}

function _completeFont(styles) {
  if (styles.fontSize && !styles.lineHeight) {
    styles.lineHeight = styles.fontSize * 1.4
  }
}

function _completePaddingMargin(styles) {
  if (styles.padding) {
    if (isExact(styles.padding)) {
      styles.paddingLeft = styles.padding
      styles.paddingBottom = styles.padding
      styles.paddingRight = styles.padding
      styles.paddingTop = styles.padding
    } else if (Array.isArray(styles.padding)) {
      // 支持数组[10,20]相当于padding:10px 20px;
      if (styles.padding.length === 2) {
        styles.paddingLeft = styles.paddingRight = styles.padding[1]
        styles.paddingBottom = styles.paddingTop = styles.padding[0]
      } else if (styles.padding.length === 4) {
        styles.paddingLeft = styles.padding[3]
        styles.paddingBottom = styles.padding[2]
        styles.paddingRight = styles.padding[1]
        styles.paddingTop = styles.padding[0]
      }
    }
  }

  if (isExact(styles.margin)) {
    styles.marginLeft = styles.margin
    styles.marginBottom = styles.margin
    styles.marginRight = styles.margin
    styles.marginTop = styles.margin
  } else if (Array.isArray(styles.margin)) {
    // 支持数组[10,20]相当于padding:10px 20px;
    if (styles.margin.length === 2) {
      styles.marginLeft = styles.marginRight = styles.margin[1]
      styles.marginBottom = styles.marginTop = styles.margin[0]
    } else if (styles.margin.length === 4) {
      styles.marginLeft = styles.margin[3]
      styles.marginBottom = styles.margin[2]
      styles.marginRight = styles.margin[1]
      styles.marginTop = styles.margin[0]
    }
  }
}
