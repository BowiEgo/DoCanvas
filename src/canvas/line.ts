import { isAuto } from '../utils'
import { CanvasElement } from './element'

export interface Line {
  width: number
  height: number
  contentWidth: number // 右边界
  x: number
  y: number // 上
  right: number
  doorClosed: boolean // 是否允许加入
  outerWidth: number
  container: CanvasElement | null
  elements: CanvasElement[]
  start: CanvasElement | null // 起点，行最左边第一个
  end: CanvasElement | null // 结束
  offsetX: number
  id: number
  _initHeight(el: CanvasElement): void
  _initLayout(el: CanvasElement): void
  _getOffsetY(el: CanvasElement): number
  _refreshWidthHeight(el: CanvasElement): void
  _closeLine(): void
  _getPrevLine(el: CanvasElement): { x: number; y: number }
  _refreshXAlign(): void
  bindElement(el: CanvasElement): void
  refreshElementPosition(el: CanvasElement): void
  addElement(el: CanvasElement): void
  canIEnter(el: CanvasElement): boolean
}

let id = 0

export function createLine() {
  let line: Line = {
    width: 0,
    height: 0,
    contentWidth: 0, // 右边界
    x: 0,
    y: 0, // 上
    right: 0,
    doorClosed: false, // 是否允许加入
    outerWidth: 0,
    container: null,
    elements: [] as CanvasElement[],
    start: null, // 起点，行最左边第一个
    end: null, // 结束
    offsetX: 0,
    id: ++id,

    _initHeight(el) {
      line.height =
        (el.parent && el.parent.context.renderStyles.lineHeight) || 0
    },

    _initLayout(el) {
      line.right = el.getContainerLayout().contentX || 0
      line.x = el.getContainerLayout().contentX || 0
      line.y = line._getPrevLine(el).y
    },

    _getOffsetY(el) {
      if (el.renderStyles.verticalAlign === 'bottom') {
        return line.height - el.renderStyles.height
      } else if (el.renderStyles.verticalAlign === 'middle') {
        return (line.height - el.renderStyles.height) / 2
      } else {
        return 0
      }
    },

    _refreshWidthHeight(el) {
      if (el.renderStyles.height > line.height) {
        line.height = el.renderStyles.height
      }

      line.width += el.renderStyles.width
    },

    _closeLine() {
      // new line
      line.end = line.elements[line.elements.length - 1]
      line._refreshXAlign()
    },

    _getPrevLine(el: CanvasElement) {
      if (el.prev) {
        const prevLine = el.prev.context.line
        if (prevLine) {
          return { y: prevLine.height + prevLine.y, x: prevLine.x }
        } else {
          const prevLayout = el.getPrevLayout()
          return {
            y: prevLayout.y + prevLayout.height,
            x: prevLayout.x
          }
        }
      } else {
        return {
          y: el.getContainerLayout().contentY,
          x: el.getContainerLayout().contentX
        }
      }
    },

    _refreshXAlign() {
      if (line.outerWidth > 5000) return
      if (!line.end) return
      if (!line.end.parent) return
      let offsetX = line.outerWidth - line.width
      if (line.end.parent.context.renderStyles.textAlign === 'center') {
        offsetX = offsetX / 2
      } else if (line.end.parent.context.renderStyles.textAlign === 'left') {
        offsetX = 0
      }
      line.offsetX = offsetX
    },

    bindElement(el) {
      line.container = el.parent?.context
      line._initHeight(el)

      line.outerWidth =
        el.parent && isAuto(el.parent.context.styles.width)
          ? Infinity
          : el.parent?.context.renderStyles.contentWidth

      line.start = el
      line.addElement(el)
    },

    refreshElementPosition(el) {
      if (line.start === el) {
        line._initLayout(el)
      }
      // 刷新位置，首先以左边计算
      el.x = line.right + line.offsetX
      el.y = line.y + line._getOffsetY(el)
      // + (line.height - el.renderStyles.height) / 2
      line.right += el.renderStyles.width
    },

    addElement(el: CanvasElement) {
      line.elements.push(el)
      el.line = line
      line._refreshWidthHeight(el)

      if (!el.next || el.next.context.renderStyles.display !== 'inline-block') {
        line._closeLine()
      }
    },

    canIEnter(el: CanvasElement) {
      if (el.renderStyles.width + line.width > line.outerWidth) {
        line._closeLine()
        return false
      } else {
        return true
      }
    }
  }

  return line
}
