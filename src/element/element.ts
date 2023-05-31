import { isString, pipe, withConstructor } from '../utils'
import { ElementStyleType } from '../styleConstant'
import { TreeNode, createTreeNode } from '../tree-node'
import { RenderObject, createRenderObject } from '../render/renderObject'
import { Engine } from '../engine'
import { createCSSDeclaration } from '../css'
import { BODY_STYLES, EXTEND_STYLE_KEYS } from '../css/constant'
import { createTextNode } from './textNode'

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

export type RenderStyles = {
  display: string
  backgroundColor: string
  color: string
  width: number
  height: number
  borderTopWidth: number
  borderBottomWidth: number
  borderLeftWidth: number
  borderRightWidth: number
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  // contentWidth: number
  // contentHeight: number
  // fullBoxWidth: number
  // fullBoxHeight: number
  // lineCap: string // butt round square
  // visible: boolean
}

export type ComputedStyles = {
  display: string
  backgroundColor: string
  color: string
  width: number
  height: number
  borderTopWidth: number
  borderBottomWidth: number
  borderLeftWidth: number
  borderRightWidth: number
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  // contentWidth: number
  // contentHeight: number
  // fullBoxWidth: number
  // fullBoxHeight: number
  // lineCap: string // butt round square
  // visible: boolean
}

export type Layout = {
  x: number
  y: number
  contentX?: number
  contentY?: number
}

// type DefaultContainer = {
//   styles: ElementStyleType
//   renderStyles: RenderStyle
//   layout: Layout
// }

// type CanvasElementContainer = CanvasElement | DefaultContainer

export type ElementOptions = {
  id?: string
  style?: ElementStyleType
  text?: string
}

export function isCanvasElement(value: any): value is CanvasElement {
  return value ? value.__v_isCanvasElement === true : false
}

export interface CanvasElement extends TreeNode<CanvasElement> {
  __v_isCanvasElement: boolean
  type: string
  id: string | null
  options: ElementOptions
  styles: ElementStyleType
  renderStyles: RenderStyles
  computedStyles: ComputedStyles
  debugColor: string | null
  context: Engine
  renderObject: RenderObject
  attach(parent: CanvasElement): void
  appendChild(child: CanvasElement): void
  computeStyles(): void
  hasChildren(): boolean
  getRootElement(): CanvasElement
  getContainerStyle(): ComputedStyles
  getContainer(): CanvasElement | null
  isVisible(): boolean
}

export type CreateElementAPI = (context: Engine) => CreateElementFn

export type CreateElementFn = (
  type: string,
  options?: ElementOptions,
  children?: CanvasElement[] | string
) => CanvasElement

export const createElementAPI = (context: Engine): CreateElementFn => {
  const createElement = function CanvasElement(
    type: string,
    options: ElementOptions = {},
    children?: CanvasElement[] | string
  ) {
    return pipe(
      createTreeNode(),
      createBaseElement(context, type, options, children),
      withConstructor(CanvasElement),
      createTextNodeIfHasText()
    )({} as CanvasElement)
  }

  return createElement
}

const createTextNodeIfHasText = () => (o) => {
  if (isString(o.children)) {
    let textNode = createTextNode(o.children)
    o.children = [textNode]
    _initRenderObject(o)
    textNode.setParentNode(o)
    textNode.attach(o)
  }

  return o
}

export const createBaseElement =
  (context: Engine, type: string, options: ElementOptions = {}, children?) =>
  (o): CanvasElement => {
    let element = {
      ...o,
      __v_isCanvasElement: true,
      type,
      id: options.id || null,
      options,
      styles: options.style || {},
      computedStyles: {},
      renderStyles: null,
      renderObject: null,
      debugColor: null,
      root: null,
      attach,
      appendChild,
      computeStyles,
      hasChildren,
      getRootElement,
      getContainerStyle,
      getContainer,
      isVisible
    }

    if (children) {
      element.children = children
    }

    if (element.type === 'body') {
      element.context = context
      element.styles = {
        width: '100%',
        height: '100%'
      } as ElementStyleType
      _initRenderObject(element)
    }

    _createRenderStyles(element)
    element.computedStyles = { ...element.renderStyles }

    return element
  }

function attach(parent) {
  if (!this.renderObject) {
    _initRenderObject(this)
  }
  parent.renderObject.appendChild(this.renderObject)
  if (this.hasChildren()) {
    this.children.forEach((child) => {
      child.attach(this)
    })
  }
}

function appendChild(child) {
  this.appendChildNode(child)

  // attach to renderTree
  const rootElm = this.getRootElement()
  if (rootElm && rootElm.type === 'body') {
    child.attach(this)
    rootElm.context.flow(this)
  }
}

function computeStyles() {
  if (this.getContainer()) {
    EXTEND_STYLE_KEYS.forEach((key) => {
      const value = this.getContainerStyle(key)
      if (value) this.computedStyles[key] = value
    })
  }

  if (this.hasChildren()) {
    this.children.forEach((child) => {
      child.computeStyles()
    })
  }
}

function hasChildren() {
  return this.hasChildNode()
}

function getRootElement() {
  return this.getRootNode()
}

function getContainerStyle(styleName) {
  const container = this.getContainer()

  if (!container) return
  if (this.computedStyles[styleName] === 'transparent') {
    return container.computedStyles[styleName]
  } else {
    return container.getContainerStyle(styleName)
  }
}

function getContainer() {
  return this.parentNode
}

function isVisible(): boolean {
  return true
  // return (
  //   this.styles.display > 0 &&
  //   this.styles.opacity > 0 &&
  //   this.style.visibility === VISIBILITY.VISIBLE
  // )
}

function _createRenderStyles(element) {
  if (element.type === 'body') {
    element.renderStyles = createCSSDeclaration(element.type, BODY_STYLES)
  } else {
    element.renderStyles = createCSSDeclaration(element.type, element.styles)
  }
}

export function _initRenderObject(element) {
  element.renderObject = createRenderObject(element)
}
