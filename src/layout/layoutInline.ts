import { LayoutBoxModelObject } from './layoutBoxModelObject'

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

// export function isLayoutInline(value: any): value is LayoutInline {
//   return value ? value.__v_isLayoutInline === true : false
// }

// export interface LayoutInline extends LayoutObject<LayoutInline> {
//   _isLayoutInline: boolean
//   updateSize(): void
//   updateLayout(): void
//   wrapByAnonymousBlock(): void
//   generateLineBoxRects(): void
// }

// export const createLayoutInline = function LayoutInline(element: CanvasElement) {
//   return pipe(
//     createBaseLayoutInline(),
//     withConstructor(LayoutInline)
//   )(createLayoutBoxModelObject<LayoutInline>(element))
// }

export class LayoutInline extends LayoutBoxModelObject {
  constructor(element) {
    super(element)
  }
}

// const createBaseLayoutInline =
//   () =>
//   (o: LayoutBoxModelObject<LayoutInline>): LayoutInline => {
//     let layoutInline = {
//       ...o,
//       _isLayoutInline: true,
//       updateSize,
//       updateLayout,
//       generateLineBoxRects,
//       wrapByAnonymousBlock
//     }

//     return layoutInline
//   }

// // function checkIfNeedWrapped() {
// //   if (this.parentNode.isAnonymous()) return false

// //   isLayoutInline(this.previousSibling)
// // }

// function wrapByAnonymousBlock(this: LayoutInline) {}

// function updateSize(this: LayoutInline) {}

// function updateLayout(this: LayoutInline) {
//   console.log('updateLayout')
//   this.wrapByAnonymousBlock()
// }

// function generateLineBoxRects() {}
