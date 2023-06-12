import { CanvasElement } from '../element/element'
import { Size, createSize } from '../geometry/size'
import { pipe, withConstructor } from '../utils'
import {
  AnonymousLayoutBlock,
  createAnonymousLayoutBlock,
  isAnonymousLayoutBlock
} from './layoutBlock'
import { LayoutBox, createLayoutBox, isLayoutBox } from './layoutBox'
import { LayoutBoxModelObject } from './layoutBoxModelObject'
import { isLayoutInlineBlock } from './layoutInlineBlock'
import {
  LayoutFlag,
  LayoutObject,
  LayoutType,
  isLayoutObject,
  removeLayoutFlag
} from './layoutObject'
import { isLayoutText } from './layoutText'
import { LineBox, LineBoxs, createLineBoxs } from './lineBox'

// LayoutInline is the LayoutObject associated with display: inline.
// This is called an "inline box" in CSS 2.1.
// http://www.w3.org/TR/CSS2/visuren.html#inline-boxes
//
// It is also the base class for content that behaves in similar way (like
// quotes and "display: ruby").
//
// Note that LayoutInline is always 'inline-level' but other LayoutObject
// can be 'inline-level', which is why it's stored as a boolean on LayoutObject
// (see LayoutObject::isInline()).
//
// For performance and memory consumption, this class ignores some inline-boxes
// during line layout because they don't impact layout (they still exist and are
// inserted into the layout tree). An example of this is
//             <span><span>Text</span></span>
// where the 2 spans have the same size as the inner text-node so they can be
// ignored for layout purpose, generating a single inline-box instead of 3.
// One downside of this optimization is that we have extra work to do when
// asking for bounding rects (see generateLineBoxRects).
// This optimization is called "culled inline" in the code.
//
// LayoutInlines are expected to be laid out by their containing
// LayoutBlockFlow. See LayoutBlockFlow::layoutInlineChildren.
//
//
// ***** CONTINUATIONS AND ANONYMOUS LAYOUTBLOCKFLOWS *****
// LayoutInline enforces the following invariant:
// "All in-flow children of an inline box are inline."
// When a non-inline child is inserted, LayoutInline::addChild splits the inline
// and potentially enclosing inlines too. It then wraps layout objects into
// anonymous block-flow containers. This creates complexity in the code as:
// - a DOM node can have several associated LayoutObjects (we don't currently
//   expose this information to the DOM code though).
// - more importantly, nodes that are parent/child in the DOM have no natural
//   relationship anymore (see example below).
// In order to do a correct tree walk over this synthetic tree, a single linked
// list is stored called *continuation*. See splitFlow() about how it is
// populated during LayoutInline split.
//
// Continuations can only be a LayoutInline or an anonymous LayoutBlockFlow.
// That's why continuations are handled by LayoutBoxModelObject (common class
// between the 2). See LayoutBoxModelObject::continuation and setContinuation.
//
// Let's take the following example:
//   <!DOCTYPE html>
//   <b>Bold inline.<div>Bold block.</div>More bold inlines.</b>
//
// The generated layout tree is:
//   LayoutBlockFlow {HTML}
//    LayoutBlockFlow {BODY}
//      LayoutBlockFlow (anonymous)
//        LayoutInline {B}
//          LayoutText {#text}
//            text run: "Bold inline."
//      LayoutBlockFlow (anonymous)
//        LayoutBlockFlow {DIV}
//          LayoutText {#text}
//            text run: "Bold block."
//      LayoutBlockFlow (anonymous)
//        LayoutInline {B}
//          LayoutText {#text}
//            text run: "More bold inlines."
//
// The insertion of the <div> inside the <b> forces the latter to be split
// into 2 LayoutInlines and the insertion of anonymous LayoutBlockFlows. The 2
// LayoutInlines are done so that we can apply the correct (bold) style to both
// sides of the <div>. The continuation chain starts with the first
// LayoutInline {B}, continues to the middle anonymous LayoutBlockFlow and
// finishes with the last LayoutInline {B}.
//
// Note that the middle anonymous LayoutBlockFlow duplicates the content.
// TODO(jchaffraix): Find out why we made the decision to always insert the
//                   anonymous LayoutBlockFlows.
//
// This section was inspired by an older article by Dave Hyatt:
// https://www.webkit.org/blog/115/webcore-rendering-ii-blocks-and-inlines/

export function isLayoutInline(value: any): value is LayoutInline {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.INLINE)
}

export function generateInlineType() {
  let type = LayoutType.BOX_MODEL
  type |= LayoutType.INLINE
  return type
}

export interface LayoutInline extends LayoutObject {
  size: Size
  lineBoxs: LineBoxs | null
  getContainerSize(): Size
  updateSize(): void
  wrapByAnonymousBlock(): void
  getAnonymousBlock(): AnonymousLayoutBlock | null
}

export const createLayoutInline = function LayoutInline(
  element: CanvasElement
) {
  return pipe(
    createBaseLayoutInline(),
    withConstructor(LayoutInline)
  )(createLayoutBox(element))
}

export const createBaseLayoutInline =
  () =>
  (o: LayoutBoxModelObject): LayoutInline => {
    let layoutInline = {
      ...o,
      type: generateInlineType(),
      size: null,
      lineBoxs: null,
      // get size() {
      //   return _getSize(o)
      // },
      getContainerSize,
      updateSize,
      wrapByAnonymousBlock,
      getAnonymousBlock
    } as LayoutInline

    // Object.defineProperty(layoutInline, 'size', {
    //   get() {
    //     return _getSize(o)
    //   },
    //   set() {
    //     throw Error('inline size is not writable')
    //   }
    // })

    return layoutInline
  }

function getContainerSize(this: LayoutInline): Size {
  console.log('getContainerSize', this)

  return _getSize(this)
}

function updateSize(this: LayoutInline) {
  console.log('updateSize-inline', this.element.type, this.element.id)
  // this.wrapByAnonymousBlock()
}

function wrapByAnonymousBlock(this: LayoutInline) {
  console.log('wrapByAnonymousBlock', this)
  if (this.layoutFlag & LayoutFlag.NEED_ANONYMOUS) {
    const container = this.parentNode as LayoutBox
    const anonymousBlock = createAnonymousLayoutBlock(
      this.getContainer().element
    )
    let siblingsNeedWrapped = _getSiblingsNeedWrapped(container)
    let childrenNeedWrapped = _getChildrenNeedWrapped(siblingsNeedWrapped)
    let layoutNeedNeedWrapped = []
    let layoutNeedLineBoxs = []

    // layoutNeedNeedWrapped = siblingsNeedWrapped.concat(childrenNeedWrapped).filter(item => )

    layoutNeedNeedWrapped.forEach((item) => {
      item.parentNode.removeChildNode(item)
      anonymousBlock.appendChild(item)
      removeLayoutFlag(item, LayoutFlag.NEED_ANONYMOUS)
    })

    container.appendChild(anonymousBlock)

    siblingsNeedWrapped.forEach((sibling) => {
      if (isLayoutInlineBlock(sibling) || isLayoutText(sibling)) {
        layoutNeedLineBoxs.push(sibling)
      }
      layoutNeedLineBoxs = layoutNeedLineBoxs.concat(
        _getChildrenNeedLineBoxs(sibling)
      )
    })

    layoutNeedLineBoxs = layoutNeedLineBoxs.filter(
      (item) => !isLayoutInline(item)
    )

    console.log('ooo-siblingsNeedWrapped', siblingsNeedWrapped)
    console.log('ooo-childrenNeedWrapped', childrenNeedWrapped)
    console.log('ooo-layoutNeedNeedWrapped', layoutNeedNeedWrapped)
    console.log('ooo-layoutNeedLineBoxs', layoutNeedLineBoxs)

    anonymousBlock.lineBoxs = createLineBoxs(
      layoutNeedLineBoxs,
      container.size.width
    )
    anonymousBlock.setHeight(anonymousBlock.lineBoxs.height)
    container.updateSize()

    siblingsNeedWrapped.forEach((sibling) =>
      removeLayoutFlag(sibling, LayoutFlag.NEED_ANONYMOUS)
    )
    layoutNeedLineBoxs.forEach((sibling) =>
      removeLayoutFlag(sibling, LayoutFlag.NEED_ANONYMOUS)
    )
    anonymousBlock.updateLayout()

    // anonymousBlock.flow()
  }
}

function getAnonymousBlock(this: LayoutInline) {
  let container = this.getContainer()
  if (!isAnonymousLayoutBlock(container)) {
    if (isLayoutInline(container)) {
      return container.getAnonymousBlock()
    } else {
      return null
    }
  } else {
    return container
  }
}

function _getSize(layout: LayoutObject): Size {
  const container = layout.getContainer()
  console.log('_getSize', container)

  if (!container) {
    return createSize()
  } else if (isLayoutBox(container) && !isAnonymousLayoutBlock(container)) {
    return container.size
  } else {
    return _getSize(container)
  }
}

function _getSiblingsNeedWrapped(container: LayoutObject): LayoutObject[] {
  return container.children.filter(
    (child) => child.layoutFlag & LayoutFlag.NEED_ANONYMOUS
  )

  // let arr = [layoutInline]

  // function walkSibling(curr) {
  //   if (!curr.nextSibling) return
  //   if (isLayoutInline(curr.nextSibling) || isLayoutText(curr.nextSibling)) {
  //     arr.push(curr.nextSibling)
  //   }
  //   walkSibling(curr.nextSibling)
  // }

  // walkSibling(layoutInline)

  // return arr
}

function _getChildrenNeedWrapped(layoutArray: LayoutObject[]): LayoutObject[] {
  let array = []

  layoutArray.forEach((sibling) => {
    if (
      sibling.children[0] &&
      sibling.children[0].layoutFlag & LayoutFlag.NEED_ANONYMOUS
    ) {
      array = _getSiblingsNeedWrapped(sibling)
      if (array.length > 0) {
        array = array.concat(_getChildrenNeedWrapped(array))
      }
    }
  })

  return array
}

function _getChildrenNeedLineBoxs(container: LayoutObject): LayoutObject[] {
  console.log('_getChildrenNeedLineBoxs', container)
  let array = []
  if (
    container.children[0] &&
    container.children[0].layoutFlag & LayoutFlag.NEED_ANONYMOUS
  ) {
    array = _getSiblingsNeedWrapped(container)
    console.log('_getChildrenNeedLineBoxs-2', array)
    if (array.length > 0) {
      array.forEach((child) => {
        console.log(
          '_getChildrenNeedLineBoxs-1',
          child,
          _getChildrenNeedLineBoxs(child)
        )

        array = array.concat(_getChildrenNeedLineBoxs(child))
      })
    }

    console.log('_getChildrenNeedLineBoxs-3', array)

    return array
  }

  return []
}
