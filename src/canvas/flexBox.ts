import { CanvasElement } from './element'
import { isExact, isAuto } from '../utils'
import STYLE_CONSTANT from './styleConstant'

const KEY = {
  [STYLE_CONSTANT.FLEX_DIRECTION.ROW]: {
    width: 'width',
    contentWidth: 'contentWidth',
    x: 'x',
    y: 'y',
    contentX: 'contentX',
    height: 'height',
    contentHeight: 'contentHeight'
  },
  [STYLE_CONSTANT.FLEX_DIRECTION.COLUMN]: {
    width: 'height',
    contentWidth: 'contentHeight',
    x: 'y',
    y: 'x',
    contentX: 'contentY',
    height: 'width',
    contentHeight: 'contentWidth'
  }
}

export interface FlexBox {
  key: null | string
  exactValue: number
  flexTotal: number
  _closeLine(): void
  _initHeight(): void
  _refreshWidthHeight(el: CanvasElement): void
  _initLayout(el: CanvasElement): void
  _refreshElementPosition(el: CanvasElement): void
  _calcFlex(): void
  _refreshXAlign(): void
  _getOffsetY(el: CanvasElement): number
  bindElement(el: CanvasElement): void
  addElement(el: CanvasElement): void
}

// 目前flex是基于inline-block的简单实现，只支持row方向width + flex混用
export function createFlexBox(): FlexBox {
  let flexBox: FlexBox = {
    key: null,
    exactValue: 0,
    flexTotal: 0,
    _closeLine() {
      super.closeLine()
      this.calcFlex()
    },

    _initHeight() {
      this[this.key.height] = 0
    },

    _refreshWidthHeight(el) {
      if (el.renderStyles[this.key.height] > this[this.key.height]) {
        this[this.key.height] = el.renderStyles[this.key.height]
      }

      this[this.key.width] += el.renderStyles[this.key.width]
    },

    _initLayout(el) {
      this.right = el.getContainerLayout()[this.key.contentX]
      this[this.key.x] = el.getContainerLayout()[this.key.contentX]
      this[this.key.y] = this.getPreLine(el)[this.key.y]
    },

    _refreshElementPosition(el) {
      if (this.start === el) {
        this.initLayout(el)
      }
      // 刷新位置，首先以左边计算
      el[this.key.x] = this.right + this.offsetX
      el[this.key.y] = this[this.key.y] + this.getOffsetY(el)
      // + (this.height - el.renderStyles.height) / 2
      this.right += el.renderStyles[this.key.width]
    },

    _calcFlex() {
      const { [this.key.contentWidth]: containerWidth } =
        this.container.renderStyles
      this.elements.forEach((child) => {
        if (isExact(child.styles.flex)) {
          child.renderStyles[this.key.width] =
            (child.styles.flex / this.flexTotal) *
            (containerWidth - this.exactValue)
          child._refreshContentWithLayout()
        }
      })
    },

    _refreshXAlign() {
      if (!this.end.parent) return
      let offsetX = this.outerWidth - this[this.key.width]
      if (this.end.parent.renderStyles.justifyContent === 'center') {
        offsetX = offsetX / 2
      } else if (this.end.parent.renderStyles.justifyContent === 'flex-start') {
        offsetX = 0
      }
      this.offsetX = offsetX
    },

    _getOffsetY(el) {
      if (el.renderStyles.alignSelf === 'flex-end') {
        return (
          this.container.renderStyles[this.key.contentHeight] -
          el.renderStyles[this.key.height]
        )
      } else if (el.renderStyles.alignSelf === 'center') {
        return (
          (this.container.renderStyles[this.key.contentHeight] -
            el.renderStyles[this.key.height]) /
          2
        )
      } else {
        return 0
      }
    },

    bindElement(el) {
      this.container = el.parent
      if (el.parent) {
        this.key = KEY[el.parent.context.renderStyles.flexDirection]
      }
      this.initHeight(el)
      this.outerWidth =
        el.parent && isAuto(el.parent.context.styles[this.key.width])
          ? Infinity
          : el.parent?.context.renderStyles[this.key.contentWidth]
      this.start = el
      this.add(el)
    },

    addElement(el) {
      if (isExact(el.styles[this.key.width])) {
        this.exactValue += el.renderStyles[this.key.width]
      } else if (isExact(el.styles.flex)) {
        this.flexTotal += el.renderStyles.flex
      }

      this.elements.push(el)
      el.line = this
      this.refreshWidthHeight(el)

      if (!el.next) {
        this.closeLine()
      }
    }
  }

  return flexBox
}
