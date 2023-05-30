import { isString, compose, pipe, withConstructor } from '../utils'
import STYLE_CONSTANT, { ElementStyleType } from '../styleConstant'
import { TreeNode, createTreeNode } from '../tree-node'
import {
  RenderObject,
  RenderStyle,
  createRenderObject
} from '../render/renderObject'
import { Engine } from '../engine'
import { Context } from 'vitest'
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

export interface CanvasElement extends TreeNode {
  __v_isCanvasElement: boolean
  type: string
  id: string | null
  options: ElementOptions
  styles: ElementStyleType
  debugColor: string | null
  context: Engine
  renderObject: RenderObject
  attach(parent: CanvasElement): void
  appendChild(child: CanvasElement): void
  hasChildren(): boolean
  hasRootElement(): boolean
  getRootElement(): CanvasElement
  _createRenderStyles(): RenderStyle
  isVisible(): boolean
}

export type CreateElementAPI = (context: Engine) => CreateElementFn

export type CreateElementFn = (
  type: string,
  options?: ElementOptions,
  children?: CanvasElement[] | string
) => CanvasElement

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
      renderStyles: null,
      renderObject: null,
      debugColor: null,
      root: null,
      _createRenderStyles,
      attach,
      appendChild,
      hasChildren,
      hasRootElement,
      computeStyles,
      getContainerStyle,
      getContainer,
      isVisible
    }

    function attach(parent) {
      if (!this.renderObject) {
        _createRenderObject(this)
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
      if (this.hasRootElement()) {
        child.attach(this)
        this.context.flow(this)
      }
    }

    function hasChildren() {
      return this.hasChildNode()
    }

    function hasRootElement() {
      return this.getRootNode() && this.getRootNode().type === 'body'
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

    if (children) {
      element.children = children
    }

    if (element.type === 'body') {
      element.context = context
      element.styles = {
        width: '100%',
        height: '100%'
      } as ElementStyleType
      _createRenderObject(element)
    }

    _createRenderStyles(element)
    element.computedStyles = { ...element.renderStyles }

    return element
  }

function _createRenderStyles(element) {
  if (element.type === 'body') {
    element.renderStyles = createCSSDeclaration(element.type, BODY_STYLES)
  } else {
    element.renderStyles = createCSSDeclaration(element.type, element.styles)
  }
}

export function _createRenderObject(element) {
  element.renderObject = createRenderObject(element)
}

const createTextNodeIfHasText = () => (o) => {
  if (isString(o.children)) {
    let textNode = createTextNode(o.children)
    o.children = [textNode]
    _createRenderObject(o)
    textNode.setParentNode(o)
    textNode.attach(o)
  }

  return o
}

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
