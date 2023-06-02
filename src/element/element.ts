import { isString } from '../utils/index'
import { ElementStyleType } from '../styleConstant'
import { TreeNode } from '../tree-node/index'
import { RenderObject, createRenderObject } from '../render/renderObject'
import { Engine } from '../engine'
import { createCSSDeclaration } from '../css/index'
import { BODY_STYLES, EXTEND_STYLE_KEYS } from '../css/constant'
import { CanvasTextNode } from './textNode'
import { LayoutBlock } from '../layout/layoutBlock'
import { LayoutInline } from '../layout/layoutInline'
import { LayoutText } from '../layout/layoutText'
import { createLayoutObject } from '../layout/index'

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
  fontFamily: string
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

export interface CanvasBodyElement extends CanvasElement {}

// export interface CanvasElement extends TreeNode<CanvasElement> {
//   __v_isCanvasElement: boolean
//   type: string
//   id: string | null
//   options: ElementOptions
//   styles: ElementStyles
//   // children: Array<CanvasElement | CanvasTextNode>
//   renderObject: RenderObject
//   debugColor: string | null
//   initLayoutObject(): void
//   attach(parent: CanvasElement): void
//   appendChild(child: CanvasElement): void
//   computeStyles(): void
//   hasChildren(): boolean
//   getRootElement(): CanvasElement
//   getContainerStyle(styleName: string): ComputedStyles
//   getContainer(): CanvasElement | null
//   getLayoutObject(): LayoutObject<LayoutBlock | LayoutInline | LayoutInline | LayoutText> | null
//   getComputedStyles(): ComputedStyles
//   setComputedStyles(styleName: string, value: any): void
//   isVisible(): boolean
// }

export type CreateElementAPI = (context: Engine) => CreateElementFn

export type CreateElementFn = (
  type: string,
  options?: ElementOptions,
  children?: CanvasElement[] | string
) => CanvasElement

export const createElementAPI = (context: Engine) => {
  const createElement = (
    type: string,
    options: ElementOptions = {},
    children?: CanvasElement[] | string
  ) => new CanvasElement(context, type, options, children)

  return createElement
}

export class CanvasElement extends TreeNode<CanvasElement> {
  #context: Engine
  type: string
  id: string | null
  options: ElementOptions
  computedStyles: ElementStyles
  #computedStyles: ComputedStyles
  // children: Array<CanvasElement | CanvasTextNode>
  layoutObject: LayoutBlock | LayoutInline | LayoutInline | LayoutText | null
  renderObject: RenderObject
  debugColor: string | null
  get styles(): ElementStyleType {
    return this.options.style || {}
  }
  public get container() {
    return (<TreeNode<CanvasElement>>this)._parentNode
  }
  public get childNodes() {
    return (<TreeNode<CanvasElement>>this).children
  }
  public get isBody() {
    return this.type === 'body'
  }
  constructor(context: Engine, type: string, options: ElementOptions = {}, children?) {
    super()
    this.type = type
    this.id = options.id || null
    this.options = options

    if (children) {
      ;(<TreeNode<CanvasElement>>this).children = children
    }

    this.computedStyles = _createStyles(this)
    this.#context = context

    if (type === 'body') {
      // _initRenderObject(this)
      this.computedStyles.width = context.viewport.width
      this.computedStyles.height = context.viewport.height

      this.#computedStyles = {
        ...this.computedStyles,
        fontFamily: context.renderer.defaultFontFamily
      }
      this.initLayoutObject()
    }

    _createTextNodeIfHasText(this)
  }
  attach(parent: CanvasElement) {
    if (!this.getLayoutObject()) {
      this.initLayoutObject()
    }
    // if (!this.renderObject) {
    //   _initRenderObject(this)
    // }
    // parent.renderObject.appendChild(this.renderObject)
    parent.layoutObject.appendChild(this.layoutObject)
    if (this.hasChildren()) {
      this.childNodes.forEach((child) => {
        child.attach(this)
      })
    }
  }
  appendChild(child: CanvasElement) {
    super.appendChildNode(child)

    // attach to renderTree
    const rootElm = this.getRootElement()
    if (rootElm && rootElm.type === 'body') {
      child.attach(this)
      ;(<CanvasBodyElement>rootElm).#context.flow(this)
    }
  }
  computeStyles() {
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
  hasChildren() {
    return this.hasChildNode()
  }

  getRootElement(): CanvasElement {
    return this.getRootNode()
  }

  getContainerStyle(styleName: string): ComputedStyles {
    const container = this.getContainer()

    if (!container) return
    if (this.getComputedStyles()[styleName] === 'transparent') {
      return container.getComputedStyles()[styleName]
    } else {
      return container.getContainerStyle(styleName)
    }
  }

  getContainer() {
    return this.parentNode
  }

  getContext() {
    return this.#context
  }

  isVisible() {
    return true
    // return (
    //   this.styles.display > 0 &&
    //   this.styles.opacity > 0 &&
    //   this.style.visibility === VISIBILITY.VISIBLE
    // )
  }
  initLayoutObject() {
    this.layoutObject = createLayoutObject(this)
  }

  getLayoutObject() {
    return this.layoutObject
  }

  getComputedStyles(): ComputedStyles {
    return this.computedStyles
  }

  setComputedStyles(propName, value) {
    this.computedStyles = {
      ...this.computedStyles,
      [propName]: value
    }
    Object.freeze(this.computeStyles)
  }
}

function _createTextNodeIfHasText(o) {
  if (isString(o.children)) {
    let textNode = new CanvasTextNode(o.children)
    o.children = [textNode]
    // _initRenderObject(o)
    textNode.setParentNode(o)
    textNode.attach(o)
  }

  return o
}

function _createStyles(element: CanvasElement): ElementStyles {
  console.log(' = {}', element.isBody)
  if (element.isBody) {
    return createCSSDeclaration(element.type, BODY_STYLES)
  } else {
    return createCSSDeclaration(element.type, element.styles)
  }
}

export function _initRenderObject(element: CanvasElement | CanvasTextNode) {
  return
  element.renderObject = createRenderObject(element)
}
