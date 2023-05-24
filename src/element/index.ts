import { isString, compose } from '../utils'
import STYLE_CONSTANT, { ElementStyleType } from '../styleConstant'
import { TreeNode, createTreeNode } from '../tree-node'
import { RenderObject, createRenderObject } from '../render/renderObject'
import { Engine } from '../engine'

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

export interface CanvasElement {
  __v_isCanvasElement: boolean
  type: string
  id: string | null
  options: ElementOptions
  styles: ElementStyleType
  debugColor: string | null
  context: Engine
  root: CanvasElement | null
  container: CanvasElement | null
  nextSibling: CanvasElement | null
  prevSibling: CanvasElement | null
  children: CanvasElement[]
  node: TreeNode
  renderObject: RenderObject
  appendChild(child: CanvasElement): void
  hasChildren(): boolean
  attach(parent: CanvasElement): void
  hasRootElement(): boolean
  getRootElement(): CanvasElement
  isVisible(): boolean
}

export type CreateElementAPI = (context: Engine) => CreateElementFn

export type CreateBaseElementFn = (
  context: Engine,
  type: string,
  options: ElementOptions,
  children?: CanvasElement[] | string
) => CanvasElement

export type CreateElementFn = (
  type: string,
  options?: ElementOptions,
  children?: CanvasElement[] | string
) => CanvasElement

export const createBaseElement: CreateBaseElementFn = (
  context,
  type,
  options = {},
  children?
) => {
  let element: CanvasElement = {
    __v_isCanvasElement: true,
    type,
    id: options.id || null,
    options,
    styles: options.style || {},
    context,
    root: null,
    container: null,
    nextSibling: null,
    prevSibling: null,
    children: [],
    node: null,
    renderObject: null,
    debugColor: null,
    appendChild,
    hasChildren,
    attach,
    hasRootElement,
    getRootElement,
    isVisible
  }

  let treeNode = createTreeNode({ instance: element })

  Object.defineProperty(element, 'root', {
    get() {
      return treeNode.root.instance
    }
  })

  Object.defineProperty(element, 'container', {
    get() {
      return treeNode.parent ? treeNode.parent.instance : null
    }
  })

  Object.defineProperty(element, 'prevSibling', {
    get() {
      return treeNode.prev ? treeNode.prev.instance : null
    }
  })

  Object.defineProperty(element, 'nextSibling', {
    get() {
      return treeNode.next ? treeNode.next.instance : null
    }
  })

  Object.defineProperty(element, 'children', {
    get() {
      if (isString(children)) return children
      return treeNode.children.map((item) => item.instance)
    }
  })

  function appendChild(child) {
    treeNode.appendChild(child.node)

    // attach to renderTree
    if (element.hasRootElement()) {
      child.attach(element)
      element.context.flow(element)
    }
  }

  function attach(parent) {
    parent.renderObject.appendChild(element.renderObject)
    if (element.hasChildren()) {
      if (isString(element.children)) {
        element.renderObject.appendChild(createRenderObject(element.children))
      } else {
        element.children.forEach((child) => {
          child.attach(element)
        })
      }
    }
  }

  function hasChildren() {
    return element.node.hasChildren() || isString(element.children)
  }

  function hasRootElement() {
    return (
      treeNode.root &&
      treeNode.root.instance &&
      treeNode.root.instance.type === 'body'
    )
  }

  function getRootElement() {
    if (element.hasRootElement()) {
      return treeNode.root.instance
    }

    return null
  }

  function isVisible(): boolean {
    return true
    // return (
    //   this.styles.display > 0 &&
    //   this.styles.opacity > 0 &&
    //   this.style.visibility === VISIBILITY.VISIBLE
    // )
  }

  if (element.type === 'body') {
    element.styles = {
      width: '100%',
      height: '100%'
    } as ElementStyleType
  }

  createRenderObject(element)

  return element
}

export const createElementAPI: CreateElementAPI = (context) => {
  return function createElement(
    type: string,
    options: ElementOptions = {},
    children?: CanvasElement[] | string
  ): CanvasElement {
    return createBaseElement(context, type, options, children)
  }
}
