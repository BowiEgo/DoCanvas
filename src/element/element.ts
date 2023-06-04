import { isString, pipe, withConstructor } from '../utils'
import { ElementStyleType } from '../styleConstant'
import { TreeNode, createTreeNode } from '../tree-node'
import { RenderObject, createRenderObject } from '../render/renderObject'
import { Engine } from '../engine'
import { createCSSDeclaration } from '../css'
import { BODY_STYLES, EXTEND_STYLE_KEYS } from '../css/constant'
import { CanvasTextNode, createTextNode, isCanvasTextNode } from './textNode'
import { LayoutObject, createLayoutObject } from '../layout/layoutObject'
import { LayoutBlock } from '../layout/layoutBlock'
import { LayoutInline } from '../layout/layoutInline'
import { LayoutText } from '../layout/layoutText'

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

export type ElementStyles = {
  display: string
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
  backgroundColor: string
  color: string
  fontSize: number
  fontWeight: string
  lineHeight: number
  // contentWidth: number
  // contentHeight: number
  // fullBoxWidth: number
  // fullBoxHeight: number
  // lineCap: string // butt round square
  // visible: boolean
}

export type ComputedStyles = {
  display: string
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
  backgroundColor: string
  color: string
  fontSize: number
  fontWeight: string
  lineHeight: number
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

export interface CanvasBodyElement extends CanvasElement {
  context: Engine
}

export interface CanvasElement extends TreeNode<CanvasElement> {
  __v_isCanvasElement: boolean
  type: string
  id: string | null
  options: ElementOptions
  styles: ElementStyles
  // children: Array<CanvasElement | CanvasTextNode>
  renderObject: RenderObject
  debugColor: string | null
  initLayoutObject(): void
  attach(parent: CanvasElement): void
  appendChild(child: CanvasElement): void
  computeStyles(): void
  hasChildren(): boolean
  getRootElement(): CanvasElement
  getContainerStyle(styleName: string): ComputedStyles
  getContainer(): CanvasElement | null
  getLayoutObject(): LayoutObject | null
  getComputedStyles(): ComputedStyles
  setComputedStyles(styleName: string, value: any): void
  isBody(): boolean
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
      createTreeNode<CanvasElement>(),
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
    o.initLayoutObject()
    textNode.setParentNode(o)
    textNode.attach(o)
  }

  return o
}

export function isCanvasElement(value: any): value is CanvasElement {
  return value ? value.__v_isCanvasElement === true : false
}

export const createBaseElement =
  (context: Engine, type: string, options: ElementOptions = {}, children?) =>
  (o: TreeNode<CanvasElement>): CanvasElement => {
    let _layoutObject, _computedStyles
    let element = {
      __v_isCanvasElement: true,
      type,
      id: options.id || null,
      options,
      styles: null,
      renderObject: null,
      debugColor: null,
      get children() {
        return o.children
      },
      initLayoutObject,
      attach,
      appendChild,
      computeStyles,
      hasChildren,
      getRootElement,
      getContainerStyle,
      getContainer,
      getLayoutObject,
      getComputedStyles,
      setComputedStyles,
      isBody,
      isVisible
    } as CanvasElement

    Object.setPrototypeOf(element, o)

    Object.defineProperty(element, 'styles', {
      get() {
        return _computedStyles || options.style || {}
      },
      set() {
        throw Error('styles is not writable')
      }
    })

    function initLayoutObject() {
      _layoutObject = createLayoutObject(this)
    }

    function getLayoutObject() {
      return _layoutObject
    }

    function getComputedStyles() {
      return _computedStyles
    }

    function setComputedStyles(propName, value) {
      _computedStyles = {
        ..._computedStyles,
        [propName]: value
      }
      Object.freeze(_computedStyles)
    }

    if (children) {
      o.children = children
    }

    _computedStyles = { ..._createRenderStyles(element) }

    if (element.type === 'body') {
      ;(<CanvasBodyElement>element).context = context
      setComputedStyles('width', context.viewport.width)
      setComputedStyles('height', context.viewport.width)
      _layoutObject = createLayoutObject(element)
      _initRenderObject(element)
    }

    return element
  }

function attach(this: CanvasElement, parent: CanvasElement) {
  if (!this.getLayoutObject()) {
    this.initLayoutObject()
  }
  if (!this.renderObject) {
    _initRenderObject(this)
  }
  parent.getLayoutObject().appendChild(this.getLayoutObject())
  parent.renderObject.appendChild(this.renderObject)
  if (this.hasChildren()) {
    this.children.forEach((child) => {
      child.attach(this)
    })
  }
}

function appendChild(this: CanvasElement, child: CanvasElement) {
  this.appendChildNode(child)

  // attach to renderTree
  const rootElm = this.getRootElement()
  if (rootElm && rootElm.type === 'body') {
    child.attach(this)
    ;(<CanvasBodyElement>rootElm).context.flow(this)
  }
}

function computeStyles(this: CanvasElement) {
  if (this.getContainer()) {
    EXTEND_STYLE_KEYS.forEach((key) => {
      const value = this.getContainerStyle(key)
      if (value) this.getComputedStyles()[key] = value
    })

    Object.freeze(this.getComputedStyles())
  }

  if (this.hasChildren()) {
    this.children.forEach((child) => {
      child.computeStyles()
    })
  }
}

function hasChildren(this: CanvasElement) {
  return this.hasChildNode()
}

function getRootElement(this: CanvasElement) {
  return this.getRootNode()
}

function getContainerStyle(
  this: CanvasElement,
  styleName: string
): ComputedStyles {
  const container = this.getContainer()

  if (!container) return
  if (this.getComputedStyles()[styleName] === 'transparent') {
    return container.getComputedStyles()[styleName]
  } else {
    return container.getContainerStyle(styleName)
  }
}

function getContainer(this: CanvasElement) {
  return this.parentNode
}

export function isBody(this: CanvasElement | CanvasTextNode) {
  return !isCanvasTextNode(this) && this.type === 'body'
}

function isVisible() {
  return true
  // return (
  //   this.styles.display > 0 &&
  //   this.styles.opacity > 0 &&
  //   this.style.visibility === VISIBILITY.VISIBLE
  // )
}

function _createRenderStyles(element: CanvasElement) {
  if (element.type === 'body') {
    return createCSSDeclaration(element.type, BODY_STYLES)
  } else {
    return createCSSDeclaration(element.type, element.styles)
  }
}

export function _initRenderObject(element: CanvasElement | CanvasTextNode) {
  element.renderObject = createRenderObject(element)
}
