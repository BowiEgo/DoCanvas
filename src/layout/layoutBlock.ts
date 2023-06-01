import { CanvasElement } from '../element/element'
import { pipe, withConstructor } from '../utils'
import { LayoutBox, createBaseLayoutBox, createLayoutBox } from './layoutBox'
import { createLayoutBoxModelObject } from './layoutBoxModelObject'

// LayoutBlock is the class that is used by any LayoutObject
// that is a containing block.
// http://www.w3.org/TR/CSS2/visuren.html#containing-block
// See also LayoutObject::ContainingBlock() that is the function
// used to get the containing block of a LayoutObject.
//
// CSS is inconsistent and allows inline elements (LayoutInline) to be
// containing blocks, even though they are not blocks. Our
// implementation is as confused with inlines. See e.g.
// LayoutObject::ContainingBlock() vs LayoutObject::Container().
//
// Containing blocks are a central concept for layout, in
// particular to the layout of out-of-flow positioned
// elements. They are used to determine the sizing as well
// as the positioning of the LayoutObjects.
//
// LayoutBlock is the class that handles out-of-flow positioned elements in
// Blink, in particular for layout (see LayoutPositionedObjects()). That's why
// LayoutBlock keeps track of them through |GetPositionedDescendantsMap()| (see
// layout_block.cc).
// Note that this is a design decision made in Blink that doesn't reflect CSS:
// CSS allows relatively positioned inlines (LayoutInline) to be containing
// blocks, but they don't have the logic to handle out-of-flow positioned
// objects. This induces some complexity around choosing an enclosing
// LayoutBlock (for inserting out-of-flow objects during layout) vs the CSS
// containing block (for sizing, invalidation).
//
//
// ***** WHO LAYS OUT OUT-OF-FLOW POSITIONED OBJECTS? *****
// A positioned object gets inserted into an enclosing LayoutBlock's positioned
// map. This is determined by LayoutObject::ContainingBlock().
//
//
// ***** HANDLING OUT-OF-FLOW POSITIONED OBJECTS *****
// Care should be taken to handle out-of-flow positioned objects during
// certain tree walks (e.g. Layout()). The rule is that anything that
// cares about containing blocks should skip the out-of-flow elements
// in the normal tree walk and do an optional follow-up pass for them
// using LayoutBlock::PositionedObjects().
// Not doing so will result in passing the wrong containing
// block as tree walks will always pass the parent as the
// containing block.
//
// Sample code of how to handle positioned objects in LayoutBlock:
//
// for (LayoutObject* child = FirstChild(); child; child = child->NextSibling())
// {
//     if (child->IsOutOfFlowPositioned())
//         continue;
//
//     // Handle normal flow children.
//     ...
// }
// for (LayoutBox* positioned_object : PositionedObjects()) {
//     // Handle out-of-flow positioned objects.
//     ...
// }

export interface LayoutBlock extends LayoutBox {
  _isLayoutBlock: boolean
  updateLayout(): void
}

export const createLayoutBlock = function LayoutBlock(element: CanvasElement) {
  return pipe(createBaseLayoutBlock(), withConstructor(LayoutBlock))(createLayoutBox(element))
}

const createBaseLayoutBlock =
  () =>
  (o): LayoutBlock => {
    let layoutBlock = {
      ...o,
      _isLayoutBlock: true,
      updateLayout
    }

    return layoutBlock
  }

function updateLayout(this: LayoutBlock) {}
