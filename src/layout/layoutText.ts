import { CanvasTextNode } from '../element/textNode'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { LayoutObject, LayoutType, createBaseLayoutObject, isLayoutObject } from './layoutObject'

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

type TextStyles = {
  color: string
  fontSize: number
  fontWeight: string
  lineHeight: number
}

export interface LayoutText extends LayoutObject {
  element: CanvasTextNode
  getTextStyles(): TextStyles
  updateLayout(): void
}

export function isLayoutText(value: any): value is LayoutText {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.TEXT)
}

export const createLayoutText = function LayoutText(element: CanvasTextNode) {
  return pipe(
    createTreeNode<LayoutText>(),
    createBaseLayoutObject(element),
    createBaseLayoutText(),
    withConstructor(LayoutText)
  )({})
}

const createBaseLayoutText =
  () =>
  (o: LayoutObject): LayoutText => {
    let element = o.element as CanvasTextNode
    let layoutText = {
      ...o,
      element,
      type: LayoutType.TEXT,
      getTextStyles,
      updateSize,
      updateLayout
    }

    return layoutText
  }

function getTextStyles(this: LayoutText) {
  const parentStyles = this.element.getContainer().getComputedStyles()
  const { color, fontSize, fontWeight, lineHeight } = parentStyles

  return {
    color,
    fontSize,
    fontWeight,
    lineHeight
  }
}

function updateSize(this: LayoutText) {}
function updateLayout(this: LayoutText) {}
