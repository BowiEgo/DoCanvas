import STYLE_CONSTANT, { ElementStyleType } from './styleConstant'
import { TreeNode, createTreeNode } from './treeNode'
import { Layer } from './layer'
import completeStyles from './completeStyles'
import {
  isAuto,
  isOuter,
  isExact,
  parseOuter,
  findRelativeTo,
  floor,
  isArray
} from '../utils'
import { Line, createLine } from './line'
import { createFlexBox } from './flexBox'
import { createViewElement } from './view'
import { createTextElement } from './text'

export const DEFAULT_CONTAINER = {
  renderStyles: {
    width: '100%',
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    contentWidth: 0,
    contentHeight: 0,
    lineCap: 'butt',
    visible: true
  },
  layout: {
    x: 0,
    y: 0,
    contentX: 0,
    contentY: 0
  }
}

// export enum ElementTypes {
//   root = 'root',
//   view = 'view',
//   text = 'text',
//   img = 'img'
// }

export type Layout = {
  width: number
  height: number
  x: number
  y: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
  contentX?: number
  contentY?: number
  contentWidth?: number
  contentHeight?: number
}

type ExtendStyles = {
  textAlign?: string
  lineHeight?: number
  fontSize?: number
  color?: string
  fontFamily?: string
  alignItems?: string
  alignSelf?: string
  visible?: boolean
}

type RenderStyle = {
  width: number | string
  height: number | string
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
  contentWidth: number | string
  contentHeight: number | string
  lineCap: string // butt round square
}

type CanvasElementContainer =
  | {
      renderStyles: RenderStyle
      layout: Layout
    }
  | CanvasElement

export type ElementOptions = {
  style?: ElementStyleType
  text?: string
}

export function isCanvasElement(value: any): value is CanvasElement {
  return value ? value.__v_isElement === true : false
}

export interface CanvasElement extends TreeNode {
  __v_isElement: boolean
  type: string
  options: ElementOptions
  styles: ElementStyleType
  renderStyles: any
  debugColor: string | null
  container: CanvasElementContainer
  root: CanvasElement | null
  layer: Layer | null
  relativeTo: CanvasElement | null
  line: Line | null
  layout: Layout
  left: number
  top: number
  height: number
  width: number
  visible: boolean
  _initStyles(): void
  _getExtendStyles(): ExtendStyles
  _getDefaultStyles(): ElementStyleType
  _completeStyles(): void
  _getChildren(): CanvasElement[]
  _getChildrenInFlow(): CanvasElement[]
  _reflow(): void
  _initWidthHeight(): void
  _initPosition(): void
  _InFlexBox(): boolean
  _refreshLayoutWithContent(): void
  _refreshContentWithLayout(): void
  _bindLine(): void
  _bindFlexBox(): void
  _measureLayout(): void
  init(): void
  appendChild(element: CanvasElement): void
  getContainer(): CanvasElement
  getContainerLayout(): Layout
  getPrevLayout(): Layout
  isInFlow(): boolean
  isVisible(): boolean
  paint(lastPaintTime: number): void
  __proto__: any
}

export function createElementAPI(layer: Layer) {
  return function createElement(
    type: string,
    options: ElementOptions = {},
    children?: CanvasElement[] | string
  ): CanvasElement {
    function _initStyles() {
      console.log('[_initStyles-000000]', this)
      element.styles = Object.assign(
        {},
        element._getDefaultStyles(),
        element._getExtendStyles(),
        element.options.style || {}
      )

      element._completeStyles()

      element.renderStyles = _getRenderStyles(element)
      console.log('_initStyles', element, element.renderStyles)

      if (element._InFlexBox()) {
        element._bindFlexBox()
      } else if (!element.isInFlow()) {
        element.relativeTo = findRelativeTo(element)
      }
    }

    function _getRenderStyles(element) {
      let renderStyles = { ...element.styles }
      const parentWidth = element.getContainerLayout().contentWidth
      const parentHeight = element.getContainerLayout().contentHeight
      console.log(parentWidth, parentHeight)

      if (isAuto(renderStyles.width)) {
        renderStyles.paddingWidth = 0
      } else if (isOuter(renderStyles.width)) {
        renderStyles.paddingWidth =
          parseOuter(renderStyles.width) * parentWidth -
          renderStyles.marginLeft -
          renderStyles.marginRight
      } else {
        renderStyles.paddingWidth = renderStyles.width
      }

      if (isAuto(renderStyles.height)) {
        renderStyles.paddingHeight = 0
      } else if (isOuter(renderStyles.height)) {
        renderStyles.paddingHeight =
          parseOuter(renderStyles.height) * parentHeight -
          renderStyles.marginTop -
          renderStyles.marginBottom
      } else {
        renderStyles.paddingHeight = renderStyles.height
      }

      if (!renderStyles.paddingWidth) renderStyles.paddingWidth = 0
      if (!renderStyles.paddingHeight) renderStyles.paddingHeight = 0

      // 初始化contentWidth
      renderStyles.contentWidth =
        renderStyles.paddingWidth -
        renderStyles.paddingLeft -
        renderStyles.paddingRight
      renderStyles.contentHeight =
        renderStyles.paddingHeight -
        renderStyles.paddingTop -
        renderStyles.paddingBottom

      renderStyles.width =
        renderStyles.paddingWidth +
        renderStyles.marginLeft +
        renderStyles.marginRight +
        getTotalBorderWidth(renderStyles)
      renderStyles.height =
        renderStyles.paddingHeight +
        renderStyles.marginTop +
        renderStyles.marginBottom +
        getTotalBorderHeight(renderStyles)

      return renderStyles
    }

    function _getExtendStyles(): ExtendStyles {
      let extendStyles = {} as ExtendStyles
      const extendKeys = [
        'textAlign',
        'fontSize',
        'color',
        'fontFamily',
        'alignItems',
        'visible'
      ]

      console.log('_getExtendStyles', element, element.getContainer())

      extendKeys.map((key) => {
        const value = element.container.renderStyles[key]
        if (value) extendStyles[key] = value
        if (key === 'visible') extendStyles[key] = value
      })

      return extendStyles
    }

    function _getDefaultStyles() {
      return STYLE_CONSTANT.DEFAULT_STYLES
    }

    function _completeStyles() {
      completeStyles(element)
    }

    function _getChildren() {
      return isArray(this.children) ? this.children : []
    }

    // 获取文档流中的子节点
    function _getChildrenInFlow() {
      return element._getChildren().filter((item) => item.isInFlow())
    }

    /**
     * 实现文档流 需要知道上一个兄弟节点
     */
    function _reflow() {}

    function _initWidthHeight() {
      const {
        width,
        height,
        display,
        flex,
        marginLeft,
        marginRight,
        marginTop,
        marginBottom
      } = element.styles
      if (isAuto(width) || isAuto(height)) {
        // 这一步需要遍历，判断一下
        const layout = element._measureLayout()
        // 初始化宽度高度
        if (isAuto(width)) {
          element.renderStyles.contentWidth = floor(layout.width)
        }

        if (isAuto(height)) {
          // 不填就是auto
          element.renderStyles.contentHeight = floor(layout.height)
        }
      }

      element._refreshLayoutWithContent()

      if (element._InFlexBox()) {
        element.line.refreshWidthHeight(element)
      } else if (display === STYLE_CONSTANT.DISPLAY.INLINE_BLOCK) {
        // 如果是inline-block  这里仅计算高度
        element._bindLine()
      }
    }

    function _initPosition() {
      let { contentX } = element.getContainerLayout()
      const {
        paddingLeft,
        paddingTop,
        borderLeftWidth,
        borderTopWidth,
        marginLeft,
        marginTop
      } = element.renderStyles
      // 初始化ctx位置
      if (!element.isInFlow()) {
        // 不在文档流中
        let { contentX, contentY, contentWidth, contentHeight } =
          element.getContainerLayout(element.relativeTo)
        let { top, bottom, right, left, width, height } = element.renderStyles
        if (isOuter(top)) top = parseOuter(top) * contentHeight
        if (isOuter(bottom)) bottom = parseOuter(bottom) * contentHeight
        if (isOuter(left)) left = parseOuter(left) * contentWidth
        if (isOuter(right)) right = parseOuter(right) * contentWidth
        if (isExact(top)) {
          element.y = contentY + top
        } else if (isExact(bottom)) {
          element.y = contentY + contentHeight - bottom - height
        }

        if (isExact(left)) {
          element.x = contentX + left
        } else if (isExact(right)) {
          element.x = contentX + contentWidth - right - width
        }
      } else if (element._InFlexBox()) {
        element.line.refreshElementPosition(element)
      } else if (
        element.renderStyles.display === STYLE_CONSTANT.DISPLAY.INLINE_BLOCK
      ) {
        // inline-block到line里计算
        // element._bindLine()
        element.line.refreshElementPosition(element)
      } else {
        element.x = contentX
        element.y = element.getPrevLayout().y + element.getPrevLayout().height
      }
      element.x = floor(element.x)
      element.y = floor(element.y)
      element.contentX = element.x + paddingLeft + borderLeftWidth + marginLeft
      element.contentY = element.y + paddingTop + borderTopWidth + marginTop
    }

    function _InFlexBox() {
      if (!element.isInFlow()) return false
      if (!element.container) return false
      if (
        element.container &&
        element.container.renderStyles.display === STYLE_CONSTANT.DISPLAY.FLEX
      )
        return true
    }

    // 父元素根据子元素撑开content后，再计算width
    function _refreshLayoutWithContent() {
      element.renderStyles.height = floor(
        element.renderStyles.contentHeight +
          element.renderStyles.paddingTop +
          element.renderStyles.paddingBottom +
          element.renderStyles.marginTop +
          element.renderStyles.marginBottom +
          getTotalBorderHeight(element.renderStyles)
      )
      element.renderStyles.width = floor(
        element.renderStyles.contentWidth +
          element.renderStyles.paddingLeft +
          element.renderStyles.paddingRight +
          element.renderStyles.marginLeft +
          element.renderStyles.marginRight +
          getTotalBorderWidth(element.renderStyles)
      )
      element.renderStyles.paddingWidth = floor(
        element.renderStyles.contentWidth +
          element.renderStyles.paddingLeft +
          element.renderStyles.paddingRight
      )
      element.renderStyles.paddingHeight = floor(
        element.renderStyles.contentHeight +
          element.renderStyles.paddingTop +
          element.renderStyles.paddingBottom
      )
    }

    // 父元素根据子元素撑开content后，再计算width
    function _refreshContentWithLayout() {
      element.renderStyles.contentHeight =
        element.renderStyles.height -
        element.renderStyles.paddingTop -
        element.renderStyles.paddingBottom -
        element.renderStyles.marginTop -
        element.renderStyles.marginBottom -
        getTotalBorderHeight(element.renderStyles)
      element.renderStyles.contentWidth =
        element.renderStyles.width -
        element.renderStyles.paddingLeft -
        element.renderStyles.paddingRight -
        element.renderStyles.marginLeft -
        element.renderStyles.marginRight -
        getTotalBorderWidth(element.renderStyles)
      element.renderStyles.paddingWidth = floor(
        element.renderStyles.contentWidth +
          element.renderStyles.paddingLeft +
          element.renderStyles.paddingRight
      )
      element.renderStyles.paddingHeight = floor(
        element.renderStyles.contentHeight +
          element.renderStyles.paddingTop +
          element.renderStyles.paddingBottom
      )
    }

    function getTotalBorderWidth(renderStyles) {
      return renderStyles.borderLeftWidth + renderStyles.borderRightWidth
    }

    function getTotalBorderHeight(renderStyles) {
      return renderStyles.borderTopWidth + renderStyles.borderBottomWidth
    }

    function _bindLine() {
      if (
        element.prev &&
        element.prev.line &&
        element.prev.line.canIEnter(element)
      ) {
        element.prev.line.add(element)
      } else {
        // 新行
        createLine().bindElement(element)
        // new Line().bind(element)
      }
    }

    function _bindFlexBox() {
      if (element.pre && element.pre.line) {
        element.pre.line.add(element)
      } else {
        // 新行
        createFlexBox().bindElement(element)
      }
    }

    // 计算自身的高度
    function _measureLayout() {
      let width = 0 // 需要考虑原本的宽度
      let height = 0
      element._getChildrenInFlow().forEach((child) => {
        if (child.line) {
          if (child.line.start === child) {
            if (child.line.width > width) {
              width = child.line.width
            }
            height += child.line.height
          }
        } else if (child.renderStyles.width > width) {
          width = child.renderStyles.width
          height += child.renderStyles.height
        } else {
          height += child.renderStyles.height
        }
      })

      return { width, height }
    }

    function init() {
      element._initStyles()
    }

    function appendChild(child) {
      console.log('appendChild')
      treeNode.appendChild.call(this, child)
      element.layer.onElementAdd(child)
    }

    function getContainer() {
      return treeNode.parent || DEFAULT_CONTAINER
    }

    function getContainerLayout(): Layout {
      const container = element.container

      return {
        width: container.renderStyles.width,
        height: container.renderStyles.height,
        paddingTop: container.renderStyles.paddingTop,
        paddingBottom: container.renderStyles.paddingBottom,
        paddingLeft: container.renderStyles.paddingLeft,
        paddingRight: container.renderStyles.paddingRight,
        marginLeft: container.renderStyles.marginLeft,
        marginRight: container.renderStyles.marginRight,
        marginTop: container.renderStyles.marginTop,
        marginBottom: container.renderStyles.marginBottom,
        x: container.layout.x,
        y: container.layout.y,
        contentX: container.layout.contentX,
        contentY: container.layout.contentY,
        contentWidth: container.layout.contentWidth,
        contentHeight: container.layout.contentHeight
      }
    }

    // 这里前一个节点必须在文档流中
    function getPrevLayout(): Layout {
      let cur = element.prev
      while (cur && !cur.isInFlow()) {
        cur = cur.prev
      }
      // 如果没有前一个或者前面的都不在文档流中，获取容器的
      if (cur) {
        return {
          width: cur.renderStyles.width,
          height: cur.renderStyles.height,
          x: cur.x,
          y: cur.y
        }
      } else {
        return {
          width: 0,
          height: 0,
          x: element.getContainerLayout().contentX,
          y: element.getContainerLayout().contentY
        }
      }
    }

    // 是否在文档流中
    function isInFlow() {
      const { position, display } = element.styles
      return (
        position !== STYLE_CONSTANT.POSITION.ABSOLUTE &&
        position !== STYLE_CONSTANT.POSITION.FIXED
      )
    }

    function isVisible() {
      return element.renderStyles.visible && element.visible
    }

    function getLayer() {
      return this.layer
    }

    function getRenderer() {
      return this.layer.renderer
    }

    function paint(lastPaintTime) {}

    const treeNode = createTreeNode(children)

    const element: CanvasElement = {
      __v_isElement: true,
      type,
      options,
      styles: {} as ElementStyleType,
      renderStyles: {},
      debugColor: null,
      x: 0,
      y: 0,
      contentX: 0,
      contentY: 0,
      left: 0,
      top: 0,
      height: 0,
      width: 0,
      visible: true,
      layer,
      relativeTo: null,
      layout: { x: 0, y: 0, contentX: 0, contentY: 0, width: 0, height: 0 },
      treeNode,
      // __proto__: treeNode,
      get container() {
        console.log('1219219209100', treeNode.parent, treeNode)
        return (
          (treeNode.parent as CanvasElement) || {
            ...DEFAULT_CONTAINER,
            ...{
              layout: {
                contentWidth: layer.options.width,
                contentHeight: layer.options.height
              }
            }
          }
        )
      },
      _initStyles,
      _getExtendStyles,
      _getDefaultStyles,
      _completeStyles,
      _getChildren,
      _getChildrenInFlow,
      _reflow,
      _initWidthHeight,
      _initPosition,
      _InFlexBox,
      _refreshLayoutWithContent,
      _refreshContentWithLayout,
      _bindLine,
      _bindFlexBox,
      _measureLayout,
      init,
      appendChild,
      getContainer,
      getContainerLayout,
      getPrevLayout,
      isInFlow,
      isVisible,
      getLayer,
      getRenderer,
      paint
    }

    // Object.assign(element, Object.create(treeNode))
    // Object.setPrototypeOf(element, treeNode)
    element.__proto__ = Object.create(treeNode.__proto__)
    element.root = layer.node

    switch (element.type) {
      case 'text':
        return createTextElement(element)
      default:
        return createViewElement(element)
    }
  }
}
