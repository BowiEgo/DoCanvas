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
  isArray,
  mergeDeep,
  isString,
  isNumber,
  extend
} from '../utils'
import { Line, createLine } from './line'
import { createFlexBox } from './flexBox'
import { createViewElement } from './view'
import { createTextElement } from './text'
import { curry, pipe } from '../utils/fp'
import { VISIBILITY } from './property-descriptors/visibility'
import { RenderableElement, createRenderableElement } from './renderableElement'
import { CanvasRenderer } from './renderer'

export const DEFAULT_CONTAINER = {
  styles: {},
  renderStyles: {
    width: 0,
    height: 0,
    paddingWidth: 0,
    paddingHeight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    contentWidth: 0,
    contentHeight: 0,
    fullBoxWidth: 0,
    fullBoxHeight: 0,
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

export type Layout = {
  x: number
  y: number
  contentX?: number
  contentY?: number
}

export type RenderStyle = {
  width: number
  height: number
  paddingWidth: number
  paddingHeight: number
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
  contentWidth: number
  contentHeight: number
  fullBoxWidth: number
  fullBoxHeight: number
  lineCap: string // butt round square
  visible: boolean
}

type DefaultContainer = {
  styles: ElementStyleType
  renderStyles: RenderStyle
  layout: Layout
}

type CanvasElementContainer = CanvasElement | DefaultContainer

export type ElementOptions = {
  style?: ElementStyleType
  text?: string
}

export function isCanvasElement(value: any): value is CanvasElement {
  return value ? value.__v_isCanvasElement === true : false
}

export interface CanvasElement extends TreeNode, RenderableElement {
  __v_isCanvasElement: boolean
  type: string
  options: ElementOptions
  styles: ElementStyleType
  layout: Layout
  renderStyles: any
  debugColor: string | null
  container: CanvasElementContainer
  relativeTo: CanvasElement | null
  layer: Layer | null
  line: Line | null
  // log(): void
  // _getExtendStyles(): ExtendStyles
  // _getDefaultStyles(): ElementStyleType
  // _completeStyles(): void
  // _getChildren(): CanvasElement[]
  // _getChildrenInFlow(): CanvasElement[]
  // _reflow(): void
  // _initWidthHeight(): void
  // _initPosition(): void
  // _InFlexBox(): boolean
  // _refreshLayoutWithContent(): void
  // _refreshContentWithLayout(): void
  // _bindLine(): void
  // _bindFlexBox(): void
  // _measureLayout(): void
  initRenderStyles(): void
  appendChild(child: CanvasElement): void
  getRenderer(): CanvasRenderer
  // getContainerLayout(): Layout
  // getPrevLayout(): Layout
  // isInFlow(): boolean
  isVisible(): boolean
}

export function createElementAPI(layer: Layer) {
  return function createElement(
    type: string,
    options: ElementOptions = {},
    children?: CanvasElement[] | string
  ): CanvasElement {
    let treeNode = createTreeNode(children)
    let renderableElement = createRenderableElement()

    let props = {
      __v_isCanvasElement: true,
      type,
      options,
      styles: {} as ElementStyleType,
      layout: { x: 0, y: 0, contentX: 0, contentY: 0 },
      renderStyles: {},
      debugColor: null,
      container: mergeDeep(DEFAULT_CONTAINER, {
        renderStyles: {
          contentWidth: layer.options.width,
          contentHeight: layer.options.height
        }
      }),
      relativeTo: null,
      layer,
      line: null
    }

    let element = {
      ...props,
      ...treeNode,
      ...renderableElement,
      appendChild,
      initRenderStyles,
      getRenderer,
      isVisible
    }

    function appendChild(child) {
      treeNode.appendChild.call(element, child)
      child.container = element
      layer.onElementAdd(child)
    }

    function initRenderStyles() {
      element.styles = _initStyles(element)
      element.renderStyles = _getRenderStyles(element)
      console.log('initRenderStyles', element, element.renderStyles)
    }

    function getRenderer() {
      return layer.renderer
    }

    function isVisible(): boolean {
      return true
      return (
        this.styles.display > 0 &&
        this.styles.opacity > 0 &&
        this.style.visibility === VISIBILITY.VISIBLE
      )
    }

    element.root = layer.node

    if (element.type === 'root') {
      element.options.style = {
        width: '100%',
        height: '100%'
      } as ElementStyleType
    }

    switch (element.type) {
      case 'text':
        return createTextElement(element)
      default:
        return createViewElement(element)
    }
  }
}

function _initStyles(elm: CanvasElement): ElementStyleType {
  let styles = mergeDeep(
    {},
    _getDefaultStyles(),
    _getExtendStyles(elm),
    elm.options.style || {}
  )

  if (elm.type === 'root') {
    styles.width = '100%'
    styles.height = '100%'
  }

  completeStyles(styles, elm.container.styles, true)
  return styles
}

function _getDefaultStyles() {
  return STYLE_CONSTANT.DEFAULT_STYLES
}

function _getExtendStyles(elm) {
  let extendStyles = {} as ExtendStyles
  const extendKeys = [
    'textAlign',
    'fontFamily',
    'fontWeight',
    'fontSize',
    'lineHeight',
    'wordSpacing',
    'letterSpacing',
    'color',
    'alignItems',
    'visibility'
  ]

  extendKeys.map((key) => {
    const value = elm.container.styles[key]
    if (value) extendStyles[key] = value
  })

  return extendStyles
}

function parsePaddingBox(rawBoxValue, parentBoxValue, margin): number {
  let result = 0

  if (isAuto(rawBoxValue)) {
  } else if (isOuter(rawBoxValue)) {
    result = parseOuter(rawBoxValue) * parentBoxValue - margin
  } else {
    result = rawBoxValue
  }

  return result
}

function _getRenderStyles(elm: CanvasElement): RenderStyle {
  let renderStyles = {} as RenderStyle
  extend(renderStyles, elm.styles)
  const parentWidth = elm.container.renderStyles.contentWidth
  const parentHeight = elm.container.renderStyles.contentHeight

  renderStyles.paddingWidth = parsePaddingBox(
    elm.styles.width,
    parentWidth,
    renderStyles.marginLeft + renderStyles.marginRight
  )

  renderStyles.paddingHeight = parsePaddingBox(
    elm.styles.height,
    parentHeight,
    renderStyles.marginTop + renderStyles.marginBottom
  )

  // 初始化contentWidth
  // https://www.w3schools.com/css/css_boxmodel.asp

  renderStyles.contentWidth = calcContentBox(renderStyles, [
    'paddingWidth',
    'paddingLeft',
    'paddingRight'
  ])

  renderStyles.contentHeight = calcContentBox(renderStyles, [
    'paddingHeight',
    'paddingTop',
    'paddingBottom'
  ])

  renderStyles.fullBoxWidth = calcFullBox(renderStyles, [
    'contentWidth',
    'paddingLeft',
    'paddingRight',
    'borderLeftWidth',
    'borderRightWidth',
    'marginLeft',
    'marginRight'
  ])

  renderStyles.fullBoxHeight = calcFullBox(renderStyles, [
    'contentHeight',
    'paddingTop',
    'paddingBottom',
    'borderTopWidth',
    'borderBottomWidth',
    'marginTop',
    'marginBottom'
  ])

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

  console.log('renderStyles', renderStyles)

  return renderStyles
}

// function getContainerLayout(elm: CanvasElement): Layout {
//   const container = elm.container

//   return {
//     width: container.renderStyles.width,
//     height: container.renderStyles.height,
//     paddingTop: container.renderStyles.paddingTop,
//     paddingBottom: container.renderStyles.paddingBottom,
//     paddingLeft: container.renderStyles.paddingLeft,
//     paddingRight: container.renderStyles.paddingRight,
//     marginLeft: container.renderStyles.marginLeft,
//     marginRight: container.renderStyles.marginRight,
//     marginTop: container.renderStyles.marginTop,
//     marginBottom: container.renderStyles.marginBottom,
//     x: container.layout.x,
//     y: container.layout.y,
//     contentX: container.layout.contentX,
//     contentY: container.layout.contentY,
//     contentWidth: container.layout.contentWidth,
//     contentHeight: container.layout.contentHeight
//   }
// }

function getTotalBorderWidth(renderStyles) {
  return renderStyles.borderLeftWidth + renderStyles.borderRightWidth
}

function getTotalBorderHeight(renderStyles) {
  return renderStyles.borderTopWidth + renderStyles.borderBottomWidth
}

const mapValues = (target, props) => {
  let arr = []
  props.map((prop) => arr.push(target[prop]))
  return arr
}

const calcContentBox = (
  renderStyles: RenderStyle,
  props: [string, string, string]
) => curry((a, b, c) => a - b - c)(...mapValues(renderStyles, props))

const calcFullBox = (
  renderStyles: RenderStyle,
  props: [string, string, string, string, string, string, string]
) =>
  curry((a, b, c, d, e, f, g) => a + b + c + d + e + f + g)(
    ...mapValues(renderStyles, props)
  )
