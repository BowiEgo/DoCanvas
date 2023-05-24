import { createCSSDeclaration } from '../css'
import { BODY_STYLES, EXTEND_STYLE_KEYS } from '../css/constant'
import { CanvasElement } from '../element'
import { LayoutBox } from '../layout'
import { TreeNode, createTreeNode } from '../tree-node'
import { NOOP, isString, mergeDeep } from '../utils'
import { BoundCurves, createBoundCurves } from './canvas/boundCurves'
import { toRenderBlock } from './renderBlock'
import { toRenderInline } from './renderInline'
import { toRenderInlineBlock } from './renderInlineBlock'
import { toRenderText } from './renderText'

export type RenderStyle = {
  backgroundColor: string
  color: string
  display: string
  // width: number
  // height: number
  // paddingWidth: number
  // paddingHeight: number
  // paddingTop: number
  // paddingBottom: number
  // paddingLeft: number
  // paddingRight: number
  // marginLeft: number
  // marginRight: number
  // marginTop: number
  // marginBottom: number
  // contentWidth: number
  // contentHeight: number
  // fullBoxWidth: number
  // fullBoxHeight: number
  // lineCap: string // butt round square
  // visible: boolean
}

export type ComputedStyle = {
  backgroundColor: string
  color: string
  // width: number
  // height: number
  // paddingWidth: number
  // paddingHeight: number
  // paddingTop: number
  // paddingBottom: number
  // paddingLeft: number
  // paddingRight: number
  // marginLeft: number
  // marginRight: number
  // marginTop: number
  // marginBottom: number
  // contentWidth: number
  // contentHeight: number
  // fullBoxWidth: number
  // fullBoxHeight: number
  // lineCap: string // butt round square
  // visible: boolean
}

export interface RenderObject {
  // TODO: enum type
  type: string
  root: RenderObject | null
  parent: RenderObject | null
  nextSibling: RenderObject | null
  prevSibling: RenderObject | null
  children: RenderObject[]
  element: CanvasElement
  node: TreeNode
  renderStyles: RenderStyle
  computedStyles: ComputedStyle
  viewport: { width: number; height: number } | null
  layoutBox: LayoutBox | null
  curves: BoundCurves
  createRenderStyles(elm: CanvasElement): void
  updateRenderStyles(): void
  computeStyles(): void
  measureBoxSize(): void
  flow(): void
  layout(): void
  appendChild(child: RenderObject): void
  hasChildren(): boolean
}

export function createRenderObject(element, options = {}): RenderObject {
  let renderObject = {
    __v_isRenderObject: true,
    type: 'block',
    options,
    root: null,
    parent: null,
    nextSibling: null,
    prevSibling: null,
    children: [],
    element,
    node: null,
    renderStyles: {} as RenderStyle,
    computedStyles: {} as ComputedStyle,
    viewport: null,
    layoutBox: null,
    curves: null,
    createRenderStyles,
    updateRenderStyles,
    computeStyles,
    measureBoxSize: NOOP,
    layout: NOOP,
    flow,
    reflow,
    appendChild,
    isRoot,
    hasChildren
  }

  let treeNode = createTreeNode({ instance: renderObject })
  renderObject.node = treeNode

  Object.defineProperty(renderObject, 'root', {
    get() {
      return treeNode.root.instance
    }
  })

  Object.defineProperty(renderObject, 'parent', {
    get() {
      return treeNode.parent ? treeNode.parent.instance : null
    }
  })

  Object.defineProperty(renderObject, 'prevSibling', {
    get() {
      return treeNode.prev ? treeNode.prev.instance : null
    }
  })

  Object.defineProperty(renderObject, 'nextSibling', {
    get() {
      return treeNode.next ? treeNode.next.instance : null
    }
  })

  Object.defineProperty(renderObject, 'children', {
    get() {
      return treeNode.children.map((item) => item.instance)
    }
  })

  function createRenderStyles(elm) {
    if (elm.type === 'body') {
      return createCSSDeclaration(elm.type, BODY_STYLES)
    }
    let renderStyles = createCSSDeclaration(elm.type, elm.styles)
    return renderStyles
  }

  function updateRenderStyles() {}

  function computeStyles() {
    console.log('computeStyles', renderObject.type, renderObject.element.id)

    if (renderObject.parent) {
      EXTEND_STYLE_KEYS.forEach((key) => {
        const value = _getParentStyle(renderObject, key)
        if (value) renderObject.computedStyles[key] = value
      })
    }

    // renderObject.measureBoxSize()

    // Object.keys(renderObject.computedStyles).forEach((styleName) => {
    //   if (
    //     renderObject.computedStyles[styleName] === 'transparent' &&
    //     renderObject.parent
    //   ) {
    //     renderObject.computedStyles[styleName] = _getParentStyle(
    //       renderObject,
    //       styleName
    //     )
    //   }
    // })

    if (renderObject.hasChildren()) {
      renderObject.children.forEach((child) => {
        if (child.type !== 'text') child.computeStyles()
      })
    }
  }

  function flow() {
    renderObject.layout()
    renderObject.curves = createBoundCurves(renderObject)
    renderObject.children.forEach((child) => child.flow())
  }

  function reflow() {}

  function appendChild(child) {
    treeNode.appendChild(child.node)
  }

  function isRoot() {
    return renderObject.parent === null
  }

  function hasChildren() {
    return renderObject.node.hasChildren()
  }

  function _getExtendStyles(elm) {
    let extendStyles = {}

    if (elm.container) {
      EXTEND_STYLE_KEYS.forEach((key) => {
        const value = elm.container.styles[key]
        if (value) extendStyles[key] = value
      })
    }

    return extendStyles
  }

  function _getParentStyle(renderObject, styleName) {
    if (!renderObject.parent) return
    if (renderObject.computedStyles[styleName] === 'transparent') {
      return renderObject.parent.computedStyles[styleName]
    } else {
      return _getParentStyle(renderObject.parent, styleName)
    }
  }

  // function _getTransParentStyle(elm, styleKey) {
  //   if (elm.container) {
  //     if (elm.container.renderStyles[styleKey] !== '')
  //   }
  // }

  if (isString(element)) return toRenderText(renderObject)

  renderObject.renderStyles = createRenderStyles(element)
  renderObject.computedStyles = { ...renderObject.renderStyles }
  let type = renderObject.renderStyles.display
  element.renderObject = renderObject

  switch (type) {
    case 'inline':
      return toRenderInline(renderObject)
    case 'inline-block':
      return toRenderInlineBlock(renderObject)
    default:
      return toRenderBlock(renderObject)
  }
}
