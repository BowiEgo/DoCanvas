import { CanvasTextNode } from '../element/textNode'
import { LayoutObject } from './layoutObject'

// LayoutText is the root class for anything that represents
// a text node (see core/dom/text.h).
//
// This is a common node in the tree so to the limit memory overhead,
// this class inherits directly from LayoutObject.
// Also this class is used by both CSS and SVG layouts so LayoutObject
// was a natural choice.
//
// The actual layout of text is handled by the containing Text
// (LayoutText) or block (LayoutBlockFlow). They will invoke the Unicode
// Bidirectional Algorithm to break the text into actual lines.
// The result of layout is the line box tree, which represents lines
// on the screen. It is stored into m_firstTextBox and m_lastTextBox.
// To understand how lines are broken by the bidi algorithm, read e.g.
// LayoutBlockFlow::LayoutInlineChildren.
//
//
// This class implements the preferred logical widths computation
// for its underlying text. The widths are stored into min_width_
// and max_width_. They are computed lazily based on
// LayoutObjectBitfields::intrinsic_logical_widths_dirty_.
//
// The previous comment applies also for painting. See e.g.
// BlockFlowPainter::paintContents in particular the use of LineBoxListPainter.

// export interface LayoutText extends LayoutObject<LayoutText> {
//   _isLayoutText: boolean
//   updateLayout(): void
// }

export class LayoutText extends LayoutObject {
  constructor(element: CanvasTextNode) {
    super(element)
    this.element = element
  }
}

// export const createLayoutText = function LayoutText(element: CanvasTextNode) {
//   return pipe(
//     createBaseLayoutObject(element),
//     createBaseLayoutText(),
//     withConstructor(LayoutText)
//   )(new TreeNode())
// }

// const createBaseLayoutText =
//   () =>
//   (o: LayoutObject<LayoutText>): LayoutText => {
//     let layoutText = {
//       ...o,
//       _isLayoutText: true,
//       updateSize,
//       updateLayout
//     }

//     return layoutText
//   }

// function updateSize(this: LayoutText) {}
// function updateLayout(this: LayoutText) {}
