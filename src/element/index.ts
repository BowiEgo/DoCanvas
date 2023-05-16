import { isString, compose } from '../utils'
import STYLE_CONSTANT, { ElementStyleType } from '../styleConstant'
import { TreeNode, createTreeNode } from '../tree-node'
import { Context } from '../context'
import { RenderObject, createRenderObject } from '../render/renderObject'

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
  style?: ElementStyleType
  text?: string
}

export function isCanvasElement(value: any): value is CanvasElement {
  return value ? value.__v_isCanvasElement === true : false
}

export interface CanvasElement {
  __v_isCanvasElement: boolean
  type: string
  options: ElementOptions
  styles: ElementStyleType
  debugColor: string | null
  context: Context
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

export function createBaseElement(
  context: Context,
  type: string,
  options: ElementOptions = {},
  children?: CanvasElement[] | string
): CanvasElement {
  let element: CanvasElement = {
    __v_isCanvasElement: true,
    type,
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
  element.node = treeNode

  let renderObject = createRenderObject(element)
  element.renderObject = renderObject

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
    }
  }

  function attach(parent) {
    parent.renderObject.appendChild(element.renderObject)
    if (element.hasChildren()) {
      element.children.forEach((child) => {
        child.attach(element)
      })
    }
  }

  function hasChildren() {
    return element.node.hasChildren()
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

  return element
}

export function createElementAPI(context): Function {
  return function createElement(
    type: string,
    options: ElementOptions = {},
    children?: CanvasElement[] | string
  ): CanvasElement {
    return createBaseElement(context, type, options, children)
    // switch (type) {
    //   case 'text':
    //     return compose([toTextElement, createBaseElement])(
    //       context,
    //       type,
    //       options,
    //       children
    //     )
    //   default:
    //     return compose([toViewElement, createBaseElement])(
    //       context,
    //       type,
    //       options,
    //       children
    //     )
    // }
  }
}

// function _initStyles(elm: CanvasElement): ElementStyleType {
//   let styles = mergeDeep(
//     {},
//     _getDefaultStyles(),
//     _getExtendStyles(elm),
//     elm.options.style || {}
//   )

//   if (elm.type === 'root') {
//     styles.width = '100%'
//     styles.height = '100%'
//   }

//   completeStyles(styles, elm.container.styles, true)
//   return styles
// }

// function _getDefaultStyles() {
//   return STYLE_CONSTANT.DEFAULT_STYLES
// }

// function _getExtendStyles(elm) {
//   let extendStyles = {} as ExtendStyles
//   const extendKeys = [
//     'textAlign',
//     'fontFamily',
//     'fontWeight',
//     'fontSize',
//     'lineHeight',
//     'wordSpacing',
//     'letterSpacing',
//     'color',
//     'alignItems',
//     'visibility'
//   ]

//   extendKeys.map((key) => {
//     const value = elm.container.styles[key]
//     if (value) extendStyles[key] = value
//   })

//   return extendStyles
// }

// function parsePaddingBox(rawBoxValue, parentBoxValue, margin): number {
//   let result = 0

//   if (isAuto(rawBoxValue)) {
//   } else if (isOuter(rawBoxValue)) {
//     result = parseOuter(rawBoxValue) * parentBoxValue - margin
//   } else {
//     result = rawBoxValue
//   }

//   return result
// }

// function _getRenderStyles(elm: CanvasElement): RenderStyle {
//   let renderStyles = {} as RenderStyle
//   extend(renderStyles, elm.styles)
//   const parentWidth = elm.container.renderStyles.contentWidth
//   const parentHeight = elm.container.renderStyles.contentHeight

//   renderStyles.paddingWidth = parsePaddingBox(
//     elm.styles.width,
//     parentWidth,
//     renderStyles.marginLeft + renderStyles.marginRight
//   )

//   renderStyles.paddingHeight = parsePaddingBox(
//     elm.styles.height,
//     parentHeight,
//     renderStyles.marginTop + renderStyles.marginBottom
//   )

//   // 初始化contentWidth
//   // https://www.w3schools.com/css/css_boxmodel.asp

//   renderStyles.contentWidth = calcContentBox(renderStyles, [
//     'paddingWidth',
//     'paddingLeft',
//     'paddingRight'
//   ])

//   renderStyles.contentHeight = calcContentBox(renderStyles, [
//     'paddingHeight',
//     'paddingTop',
//     'paddingBottom'
//   ])

//   renderStyles.fullBoxWidth = calcFullBox(renderStyles, [
//     'contentWidth',
//     'paddingLeft',
//     'paddingRight',
//     'borderLeftWidth',
//     'borderRightWidth',
//     'marginLeft',
//     'marginRight'
//   ])

//   renderStyles.fullBoxHeight = calcFullBox(renderStyles, [
//     'contentHeight',
//     'paddingTop',
//     'paddingBottom',
//     'borderTopWidth',
//     'borderBottomWidth',
//     'marginTop',
//     'marginBottom'
//   ])

//   renderStyles.width =
//     renderStyles.paddingWidth +
//     renderStyles.marginLeft +
//     renderStyles.marginRight +
//     getTotalBorderWidth(renderStyles)
//   renderStyles.height =
//     renderStyles.paddingHeight +
//     renderStyles.marginTop +
//     renderStyles.marginBottom +
//     getTotalBorderHeight(renderStyles)

//   console.log('renderStyles', renderStyles)

//   return renderStyles
// }

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

// function getTotalBorderWidth(renderStyles) {
//   return renderStyles.borderLeftWidth + renderStyles.borderRightWidth
// }

// function getTotalBorderHeight(renderStyles) {
//   return renderStyles.borderTopWidth + renderStyles.borderBottomWidth
// }

// const mapValues = (target, props) => {
//   let arr = []
//   props.map((prop) => arr.push(target[prop]))
//   return arr
// }

// const calcContentBox = (
//   renderStyles: RenderStyle,
//   props: [string, string, string]
// ) => curry((a, b, c) => a - b - c)(...mapValues(renderStyles, props))

// const calcFullBox = (
//   renderStyles: RenderStyle,
//   props: [string, string, string, string, string, string, string]
// ) =>
//   curry((a, b, c, d, e, f, g) => a + b + c + d + e + f + g)(
//     ...mapValues(renderStyles, props)
//   )
