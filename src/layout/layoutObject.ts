import { CanvasElement, ComputedStyles, Layout } from '../element/element'
import { CanvasTextNode, isCanvasTextNode } from '../element/textNode'
import { TreeNode } from '../tree-node'
import { createLayoutBlock, isLayoutBlock } from './layoutBlock'
import { isLayoutBox } from './layoutBox'
import { createLayoutInline, isLayoutInline } from './layoutInline'
import { createLayoutInlineBlock, isLayoutInlineBlock } from './layoutInlineBlock'
import { createLayoutText } from './layoutText'
import { LineBox } from './lineBox'

// LayoutObject is the base class for all layout tree objects.
//
// LayoutObjects form a tree structure that is a close mapping of the DOM tree.
// The root of the LayoutObject tree is the LayoutView, which is the
// LayoutObject associated with the Document.
//
// Some LayoutObjects don't have an associated Node and are called "anonymous"
// (see the constructor below). Anonymous LayoutObjects exist for several
// purposes but are usually required by CSS. A good example is anonymous table
// parts (see LayoutNGTable for the expected structure). Anonymous LayoutObjects
// are generated when a new child is added to the tree in addChild(). See the
// function for some important information on this.
//
// Also some Node don't have an associated LayoutObjects e.g. if display: none
// or display: contents is set. For more detail, see LayoutObject::createObject
// that creates the right LayoutObject based on the style.
//
// Because the SVG and CSS classes both inherit from this object, functions can
// belong to either realm and sometimes to both.
//
// The purpose of the layout tree is to do layout (aka reflow) and store its
// results for painting and hit-testing. Layout is the process of sizing and
// positioning Nodes on the page. In Blink, layouts always start from a relayout
// boundary (see ObjectIsRelayoutBoundary in layout_object.cc). As such, we
// need to mark the ancestors all the way to the enclosing relayout boundary in
// order to do a correct layout.
//
// Due to the high cost of layout, a lot of effort is done to avoid doing full
// layouts of nodes. This is why there are several types of layout available to
// bypass the complex operations. See the comments on the layout booleans in
// LayoutObjectBitfields below about the different layouts.
//
// To save memory, especially for the common child class LayoutText,
// LayoutObject doesn't provide storage for children. Descendant classes that do
// allow children have to have a LayoutObjectChildList member that stores the
// actual children and override virtualChildren().
//
// LayoutObject is an ImageResourceObserver, which means that it gets notified
// when associated images are changed. This is used for 2 main use cases:
// - reply to 'background-image' as we need to invalidate the background in this
//   case.
//   (See https://drafts.csswg.org/css-backgrounds-3/#the-background-image)
// - image (LayoutImage, LayoutSVGImage) or video (LayoutVideo) objects that are
//   placeholders for displaying them.
//
//
// ***** LIFETIME *****
//
// LayoutObjects are fully owned by their associated DOM node. In other words,
// it's the DOM node's responsibility to free its LayoutObject, this is why
// LayoutObjects are not and SHOULD NOT be RefCounted.
//
// LayoutObjects are created during the DOM attachment. This phase computes
// the style and create the LayoutObject associated with the Node (see
// Node::attachLayoutTree). LayoutObjects are destructed during detachment (see
// Node::detachLayoutTree), which can happen when the DOM node is removed from
// the
// DOM tree, during page tear down or when the style is changed to contain
// 'display: none'.
//
// Anonymous LayoutObjects are owned by their enclosing DOM node. This means
// that if the DOM node is detached, it has to destroy any anonymous
// descendants. This is done in LayoutObject::destroy().
//
// Note that for correctness, destroy() is expected to clean any anonymous
// wrappers as sequences of insertion / removal could make them visible to
// the page. This is done by LayoutObject::destroyAndCleanupAnonymousWrappers()
// which is the preferred way to destroy an object.
//
//
// ***** INTRINSIC SIZES / PREFERRED LOGICAL WIDTHS *****
// The preferred logical widths are the intrinsic sizes of this element
// (https://drafts.csswg.org/css-sizing-3/#intrinsic). Intrinsic sizes depend
// mostly on the content and a limited set of style properties (e.g. any
// font-related property for text, 'min-width'/'max-width',
// 'min-height'/'max-height').
//
// Those widths are used to determine the final layout logical width, which
// depends on the layout algorithm used and the available logical width.
//
// LayoutObject only has a getter for the widths (PreferredLogicalWidths).
// However the storage for them is in LayoutBox (see
// min_preferred_logical_width_ and max_preferred_logical_width_). This is
// because only boxes implementing the full box model have a need for them.
// Because LayoutBlockFlow's intrinsic widths rely on the underlying text
// content, LayoutBlockFlow may call LayoutText::ComputePreferredLogicalWidths.
//
// The 2 widths are computed lazily during layout when the getters are called.
// The computation is done by calling ComputePreferredLogicalWidths() behind the
// scene. The boolean used to control the lazy recomputation is
// IntrinsicLogicalWidthsDirty.
//
// See the individual getters below for more details about what each width is.

export const enum LayoutFlag {
  NONE,
  NEED_ANONYMOUS = 1,
  IS_ANONYMOUS = 1 << 1
}

export const enum LayoutType {
  NONE,
  BOX_MODEL = 1,
  TEXT = 1 << 1,
  BOX = 1 << 2,
  BLOCK = 1 << 3,
  INLINE = 1 << 4,
  INLINE_BLOCK = 1 << 5
}

export const enum LayoutType {}

export interface LayoutObject extends TreeNode<LayoutObject> {
  type: LayoutType
  layoutFlag: LayoutFlag
  element: CanvasElement | CanvasTextNode
  lineBox: LineBox
  getStyles(): ComputedStyles
  getContainer(): LayoutObject
  appendChild(layoutObject: LayoutObject): void
  flow(): void
}

export function isLayoutObject(value: any): value is LayoutObject {
  return value ? value._isLayoutObject === true : false
}

export const createLayoutObject = function LayoutObject(element: CanvasElement | CanvasTextNode) {
  if (element.isBody()) {
    return createLayoutBlock(element as CanvasElement)
  }
  if (isCanvasTextNode(element)) {
    return createLayoutText(element)
  }

  switch (element.getComputedStyles().display) {
    case 'block':
      return createLayoutBlock(element)
    case 'inline':
      return createLayoutInline(element)
    case 'inline-block':
      return createLayoutInlineBlock(element)
    default:
      return createLayoutBlock(element)
  }
}

export const createBaseLayoutObject =
  (element?) =>
  (o: TreeNode<LayoutObject>): LayoutObject => {
    let layoutObject = {
      ...o,
      _isLayoutObject: true,
      type: LayoutType.NONE,
      layoutFlag: LayoutFlag.NONE,
      element,
      lineBox: null,
      getStyles,
      getContainer,
      appendChild,
      flow
    } as LayoutObject

    Object.setPrototypeOf(layoutObject, o)

    return layoutObject
  }

function getStyles(this: LayoutObject) {
  return (<CanvasElement>this.element).getComputedStyles()
}

function getContainer(this: LayoutObject) {
  return this.parentNode
}

function appendChild(this: LayoutObject, child) {
  console.log('up-layout-appendChild', this, child)
  this.appendChildNode(child)
  _checkChildIfNeedWrapAnonymous(child)
}

function flow(this: LayoutObject) {
  console.log('updateLocation-flow', this)
  if (isLayoutBox(this)) {
    this.updateLocation()
  }

  this.children.forEach((child) => child.flow())
}

function _checkChildIfNeedWrapAnonymous(child) {
  console.log(
    '_checkChildIfNeedWrapAnonymous',
    isLayoutInline(child) || isLayoutInlineBlock(child),
    isLayoutBlock(child.previousSibling)
  )
  if (isLayoutInline(child) || isLayoutInlineBlock(child)) {
    if (!child.previousSibling || isLayoutBlock(child.previousSibling)) {
      console.log('_checkChildIfNeedWrapAnonymous', child)
      patchLayoutFlag(child, LayoutFlag.NEED_ANONYMOUS)
    }
  }
}

export function patchLayoutFlag(layoutObject, layoutFlag) {
  layoutObject.layoutFlag |= layoutFlag
}

export function removeLayoutFlag(layoutObject, layoutFlag) {
  layoutObject.layoutFlag &= ~layoutFlag
}

function _setPreviousSibling<T>(this: LayoutObject, previous: LayoutObject) {}
function _setNextSibling(this: LayoutObject, next: LayoutObject) {}
function _setParentSibling(this: LayoutObject, parent: LayoutObject) {}
