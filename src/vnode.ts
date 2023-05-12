import {
  isOn,
  isString,
  isObject,
  isArray,
  isFunction,
  normalizeClass,
  normalizeStyle
} from './utils'
import { RendererNode } from './renderer'
import { ComponentInternalInstance, Data } from './components'
import { AppContext } from './createApp'

export const Fragment = Symbol.for('v-fgt') as any as {
  __isFragment: true
  new (): {
    $props: VNodeProps
  }
}
export const Text = Symbol.for('v-txt')
export const Comment = Symbol.for('v-cmt')

export type VNodeTypes =
  | string
  | VNode
  | typeof Text
  | typeof Comment
  | typeof Fragment

export type VNodeProps = {
  key?: string | number | symbol
  ref_for?: boolean
  ref_key?: string
}

type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type VNodeNormalizedChildren = string | VNodeArrayChildren | null

export interface VNode<
  HostNode = RendererNode,
  ExtraProps = { [key: string]: any }
> {
  /**
   * @internal
   */
  __v_isVNode: true

  type: VNodeTypes
  props: (VNodeProps & ExtraProps) | null
  children: VNodeNormalizedChildren
  component: ComponentInternalInstance | null

  el: HostNode | null
  /**
   * number of elements contained in a static vnode
   * @internal
   */
  staticCount: number

  // application root node only
  appContext: AppContext | null

  /**
   * @internal lexical scope owner instance
   */
  ctx: ComponentInternalInstance | null
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type
}

function createBaseVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    children,
    component: null,
    el: null,
    staticCount: 0,
    appContext: null,
    ctx: null
  } as VNode

  // if (type !== 'Text') {
  //   normalizeChildren(vnode, children)
  // }
  return vnode
}

export function createVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag: number = 0
) {
  if (isVNode(type)) {
    const cloned = cloneVNode(type, props, true /* mergeRef: true */)
    if (children) {
      normalizeChildren(cloned, children)
    }

    return cloned
  }

  // class & style normalization.
  if (props) {
    // for reactive or proxy objects, we need to clone it to enable mutation.
    // props = guardReactiveProps(props)!
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
    if (isObject(style)) {
      props.style = normalizeStyle(style)
    }
  }

  return createBaseVNode(type, props, children, patchFlag)
}

export function cloneVNode(
  vnode: VNode,
  extraProps?: (Data & VNodeProps) | null,
  mergeRef = false
): VNode {
  if (vnode && typeof vnode !== 'object') {
    return vnode
  }
  // This is intentionally NOT using spread or extend to avoid the runtime
  // key enumeration cost.
  const { props, children } = vnode
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props
  const cloned: VNode = {
    __v_isVNode: true,
    type: vnode.type,
    props: mergedProps,
    children: isArray(children)
      ? (children as VNode[]).map(deepCloneVNode)
      : children,
    staticCount: vnode.staticCount,
    appContext: vnode.appContext,
    component: vnode.component,
    el: vnode.el,
    ctx: vnode.ctx
  }
  return cloned as any
}

/**
 * Dev only, for HMR of hoisted vnodes reused in v-for
 * https://github.com/vitejs/vite/issues/2022
 */
function deepCloneVNode(vnode: VNode): VNode {
  const cloned = cloneVNode(vnode)
  if (isArray(vnode.children)) {
    cloned.children = (vnode.children as VNode[]).map(deepCloneVNode)
  }
  return cloned
}

/**
 * @private
 */
export function createTextVNode(text: string = ' ', flag: number = 0): VNode {
  return createVNode('Text', null, text)
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (child == null || typeof child === 'boolean') {
    // empty placeholder
    return createVNode(Comment)
  } else if (isArray(child)) {
    // fragment
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    )
  } else if (typeof child === 'object') {
    // already vnode, this should be the most common since compiled templates
    // always produce all-vnode children arrays
    return cloneIfMounted(child)
  } else {
    // strings and numbers
    return createTextVNode(String(child))
  }
}

export function cloneIfMounted(child: VNode): VNode {
  return cloneVNode(child)
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  if (children == null) {
    children = null
  } else if (isArray(children)) {
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = [createTextVNode(children as string)]
  }
  vnode.children = children as VNodeNormalizedChildren
}

export function mergeProps(...args: (Data & VNodeProps)[]) {
  const ret: Data = {}
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i]
    for (const key in toMerge) {
      if (key === 'class') {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class])
        }
      } else if (key === 'style') {
        ret.style = normalizeStyle([ret.style, toMerge.style])
      } else if (isOn(key)) {
        const existing = ret[key]
        const incoming = toMerge[key]
        if (
          incoming &&
          existing !== incoming &&
          !(isArray(existing) && existing.includes(incoming))
        ) {
          ret[key] = existing
            ? [].concat(existing as any, incoming as any)
            : incoming
        }
      } else if (key !== '') {
        ret[key] = toMerge[key]
      }
    }
  }
  return ret
}
