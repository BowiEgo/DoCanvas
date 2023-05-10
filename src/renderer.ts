import {
  VNode,
  VNodeProps,
  VNodeArrayChildren,
  isSameVNodeType,
  normalizeVNode
} from './vnode'
import { createAppAPI } from './createApp'
import { ComponentInternalInstance, Data } from './components'
import { flushPreFlushCbs, flushPostFlushCbs } from './scheduler'
import { EMPTY_OBJ, EMPTY_ARR, PatchFlags, ShapeFlags } from './utils'

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement,
  isSVG?: boolean
) => void

type MountChildrenFn = (
  children: VNodeArrayChildren,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  start?: number
) => void

type NextFn = (vnode: VNode) => RendererNode | null

type RemoveFn = (vnode: VNode) => void

type UnmountChildrenFn = (
  children: VNode[],
  parentComponent: ComponentInternalInstance | null,
  // parentSuspense: SuspenseBoundary | null,
  doRemove?: boolean,
  optimized?: boolean,
  start?: number
) => void

type ProcessTextOrCommentFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(
    el: HostElement,
    key: string,
    prevValue: any,
    nextValue: any,
    prevChildren?: VNode<HostNode, HostElement>[],
    parentComponent?: ComponentInternalInstance | null,
    unmountChildren?: UnmountChildrenFn
  ): void
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void
  remove(el: HostNode): void
  createElement(
    type: string,
    vnodeProps?: (VNodeProps & { [key: string]: any }) | null
  ): HostElement
  createText(text: string): HostNode
  createComment(text: string): HostNode
  setText(node: HostNode, text: string): void
  setElementText(node: HostElement, text: string): void
  parentNode(node: HostNode): HostElement | null
  nextSibling(node: HostNode): HostNode | null
  // querySelector?(selector: string): HostElement | null
}

export interface RendererNode {
  [key: string]: any
}

export interface RendererElement extends RendererNode {}

type PatchFn = (
  n1: VNode | null, // null means this is a mount
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null,
  parentComponent?: ComponentInternalInstance | null
) => void

type PatchChildrenFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null
) => void

type UnmountFn = (
  vnode: VNode,
  parentComponent: ComponentInternalInstance | null,
  doRemove?: boolean,
  optimized?: boolean
) => void

export function createRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling
  } = options

  const patch: PatchFn = (
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null
  ) => {
    // console.log('patch', n1, n2, container)
    if (n1 === n2) {
      return
    }

    // patching & not same type, unmount old tree
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1)
      unmount(n1, parentComponent, true)
      n1 = null
    }

    const { type } = n2
    switch (type) {
      case 'Text':
        processText(n1, n2, container, anchor)
        break
      // case 'Comment':
      //   processCommentNode(n1, n2, container, anchor)
      //   break
      default:
        processElement(n1, n2, container, anchor, parentComponent)
    }
  }

  const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(hostCreateText(n2.children as string), container, anchor)
    } else {
      if (n2.children !== n1.children) {
        hostSetText(n2, n2.children as string)
      }
    }
  }

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null
  ) => {
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      patchElement(n1, n2, parentComponent)
    }
  }

  const mountElement = (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null
  ) => {
    let el: RendererElement
    const { type, props } = vnode
    // console.log('mountElement', vnode, container, anchor, parentComponent)

    el = vnode.el = hostCreateElement(vnode.type as string, props)

    // mount children first, since some props may rely on child content
    // being already rendered, e.g. `<select value>`

    mountChildren(
      vnode.children as VNodeArrayChildren,
      el,
      null,
      parentComponent
    )

    // props
    if (props) {
      // for (const key in props) {
      //   if (key !== 'value' && !isReservedProp(key)) {
      //     hostPatchProp(
      //       el,
      //       key,
      //       null,
      //       props[key],
      //       isSVG,
      //       vnode.children as VNode[],
      //       parentComponent,
      //       parentSuspense,
      //       unmountChildren
      //     )
      //   }
      // }

      if ('value' in props) {
        // hostPatchProp(el, 'value', null, props.value)
      }
    }

    hostInsert(el, container, anchor)
  }

  const mountChildren: MountChildrenFn = (
    children,
    container,
    anchor,
    parentComponent,
    start = 0
  ) => {
    // console.log('mountChildren', children, container, anchor, parentComponent)
    if (typeof children === 'string') {
      patch(null, normalizeVNode(children), container, anchor, parentComponent)
    } else {
      for (let i = start; i < children.length; i++) {
        const child = normalizeVNode(children[i])
        patch(null, child, container, anchor, parentComponent)
      }
    }
  }

  const patchElement = (
    n1: VNode,
    n2: VNode,
    parentComponent: ComponentInternalInstance | null
  ) => {
    const el = (n2.el = n1.el!)

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    patchChildren(n1, n2, el, null, parentComponent)

    // text
    if (n1.children !== n2.children) {
      hostSetElementText(el, n2.children as string)
    }

    patchProps(el, n2, oldProps, newProps, parentComponent)
  }

  const patchChildren: PatchChildrenFn = (
    n1,
    n2,
    container,
    anchor,
    parentComponent
  ) => {
    const c1 = n1 && n1.children
    const c2 = n2.children

    patchUnkeyedChildren(
      c1 as VNode[],
      c2 as VNodeArrayChildren,
      container,
      anchor,
      parentComponent
    )
  }

  const patchUnkeyedChildren = (
    c1: VNode[],
    c2: VNodeArrayChildren,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null
  ) => {
    c1 = c1 || EMPTY_ARR
    c2 = c2 || EMPTY_ARR
    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    let i
    for (i = 0; i < commonLength; i++) {
      const nextChild = normalizeVNode(c2[i])
      patch(c1[i], nextChild, container, null, parentComponent)
    }
    if (oldLength > newLength) {
      // remove old
      unmountChildren(c1, parentComponent, true, false, commonLength)
    } else {
      // mount new
      mountChildren(c2, container, anchor, parentComponent, commonLength)
    }
  }

  const patchProps = (
    el: RendererElement,
    vnode: VNode,
    oldProps: Data,
    newProps: Data,
    parentComponent: ComponentInternalInstance | null
  ) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          hostPatchProp(
            el,
            key,
            oldProps[key],
            null,
            vnode.children as VNode[],
            parentComponent,
            unmountChildren
          )
        }
      }
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        // defer patching value
        if (next !== prev && key !== 'value') {
          hostPatchProp(
            el,
            key,
            prev,
            next,
            vnode.children as VNode[],
            parentComponent,
            unmountChildren
          )
        }
      }
      if ('value' in newProps) {
        hostPatchProp(el, 'value', oldProps.value, newProps.value)
      }
    }
  }

  const unmount: UnmountFn = (
    vnode,
    parentComponent,
    doRemove = false,
    optimized = false
  ) => {
    const { type, props, children } = vnode

    unmountChildren(children as VNode[], parentComponent)

    if (doRemove) {
      remove(vnode)
    }
  }

  const remove: RemoveFn = (vnode) => {
    const performRemove = () => {
      hostRemove(vnode)
    }

    performRemove()
  }

  const unmountChildren: UnmountChildrenFn = (
    children,
    parentComponent,
    doRemove = false,
    optimized = false,
    start = 0
  ) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, doRemove)
    }
  }

  const getNextHostNode: NextFn = (vnode) => {
    return hostNextSibling(vnode!)
  }

  const render: RootRenderFunction = (vnode, container) => {
    // console.log('render:', vnode, container, container._vnode)

    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, true)
      }
    } else {
      patch(container._vnode || null, vnode, container, null, null)
    }
    flushPreFlushCbs()
    flushPostFlushCbs()
    container._vnode = vnode
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}
