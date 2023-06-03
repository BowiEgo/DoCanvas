import { CanvasBodyElement, CanvasElement } from '../element/element'
import { fromCodePoint, toCodePoints } from '../text/Util'
import { LineBreaker } from '../text/lineBreak'
import { pipe, withConstructor } from '../utils'
import { LayoutBox, createLayoutBox } from './layoutBox'
import { isLayoutInlineBlock } from './layoutInlineBlock'
import { LayoutFlag, LayoutType, isLayoutObject } from './layoutObject'
import { LayoutText, isLayoutText } from './layoutText'

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
  updateLayout(): void
}

export interface AnonymousLayoutBlock extends LayoutBlock {
  element: null
  layoutFlag: LayoutFlag.IS_ANONYMOUS
}

export function generateBlockType() {
  let type = LayoutType.BOX_MODEL
  type |= LayoutType.BOX
  type |= LayoutType.BLOCK
  return type
}

export function isLayoutBlock(value: any): value is LayoutBlock {
  if (!isLayoutObject(value)) return false
  return !!(value.type & LayoutType.BLOCK)
}

export const createLayoutBlock = function LayoutBlock(element: CanvasElement): LayoutBlock {
  return pipe(createBaseLayoutBlock(), withConstructor(LayoutBlock))(createLayoutBox(element))
}

export const createAnonymousLayoutBlock = function AnonymousLayoutBlock(): AnonymousLayoutBlock {
  return pipe(createBaseLayoutBlock(true), withConstructor(AnonymousLayoutBlock))(createLayoutBox())
}

const createBaseLayoutBlock =
  (isAnonymous?) =>
  (o): LayoutBlock => {
    let layoutBlock = {
      ...o,
      type: generateBlockType(),
      layoutFlag: isAnonymous ? LayoutFlag.IS_ANONYMOUS : LayoutFlag.NONE,
      updateLayout
    }

    return layoutBlock
  }

function updateLayout(this: LayoutBlock) {
  console.log('updateLayout-block', this.type & LayoutType.BOX, this.type & LayoutType.BOX_MODEL)
  if (this.layoutFlag & LayoutFlag.IS_ANONYMOUS) {
    let container = this.parentNode as LayoutBox
    console.log('updateLayout', this, container.size.width, this.children)
    let line = []
    let maxWidth = container.size.width
    let testLine = []
    let testWidth = 0
    let lineArray = []
    let end = 0

    let lineText = { text: '', x: 0, y: 0, end: 0 }
    let testLineText = ''

    let lineHeight = 0

    for (let i = 0; i < this.children.length; i++) {
      let child = this.children[i] as LayoutBlock
      let grandChild = child.children[0] as LayoutText
      console.log('updateLayout-childWidth', child, isLayoutText(child.children[0]))
      let childWidth = !isLayoutText(grandChild) ? child.size.width : 0
      let childHeight = !isLayoutText(grandChild) ? child.size.height : 0

      if (isLayoutText(grandChild)) {
        console.log('updateLayout-childWidth', grandChild.element.text)
        const body = grandChild.element.getContainer().getRootNode() as CanvasBodyElement
        const ctx = body.context.renderer.ctx
        const defaultFontFamily = body.context.renderer.defaultFontFamily
        ctx.save()
        ctx.font = `normal ${grandChild.getTextStyles().fontSize}px ${defaultFontFamily}`

        const words = _breakWords(
          grandChild.element.text,
          grandChild.element.getContainer().getComputedStyles()
        )

        lineArray.splice(lineArray.length - 1, 1)
        lineText = { ...lineText }
        lineText.x = end
        lineText.text = ''
        lineHeight = Math.max(
          lineHeight,
          Number(grandChild.getTextStyles().lineHeight) || grandChild.getTextStyles().fontSize
        )
        lineText.y += lineHeight

        for (let j = 0; j < words.length; j++) {
          testLineText += words[j]
          let metrics = ctx.measureText(words[j])
          testWidth += metrics.width

          if (testWidth > maxWidth && j > 0) {
            line.push(lineText)
            lineArray.push(line)
            line = []
            //
            lineText = { ...lineText }
            lineText.text = words[j]
            lineText.x = 0
            lineText.y += lineHeight

            // lineHeight = metrics.height
            end = metrics.width
            testWidth = end

            lineText.end = end
          } else {
            lineText.text += words[j]
            end += metrics.width
            lineText.end = end
          }
          if (j === words.length - 1) {
            line.push(lineText)
            lineArray.push(line)
            testWidth += metrics.width
          }
        }
        continue
      } else {
        testLine.push(child)
        lineHeight = childHeight
        testWidth += childWidth
        if (testWidth > maxWidth && i > 0) {
          lineArray.push(line)
          testLine = [child]
          line = testLine
          end = child.size.width
        } else {
          line.push(child)
          end = testWidth
        }
        if (i === this.children.length - 1) {
          lineArray.push(line)
        }
        lineHeight = 0
      }
    }

    this.children.forEach((child) => {
      child.lineArray = lineArray
    })
    // console.log('updateLayout-words-block-line', lineArray, end)
    // this.lineArray = lineArray
  }
}

function mergeInlineChild() {
  this.children
}

// TODO: 用二分法进行优化，减少ctx.measureText()调用次数
function _wrapText(
  initialLine: [] = [],
  ctx: CanvasRenderingContext2D,
  words: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  let line = ''
  let testLine = ''
  let lineArray = []
  let maxLineWidth = 0
  y = lineHeight

  for (var n = 0; n < words.length; n++) {
    testLine += words[n]
    let metrics = ctx.measureText(testLine)
    let testWidth = metrics.width

    if (testWidth > maxWidth && n > 0) {
      lineArray.push([line.trim(), x, y])

      y += lineHeight
      line = words[n]
      testLine = words[n]
    } else {
      line += words[n]
    }
    if (n === words.length - 1) {
      lineArray.push([line.trim(), x, y])
    }
  }

  return {
    lines: lineArray,
    maxLineWidth,
    outerHeight: lineArray[lineArray.length - 1][2]
  }
}

// https://drafts.csswg.org/css-text/#word-separator
const wordSeparators = [0x0020, 0x00a0, 0x1361, 0x10100, 0x10101, 0x1039, 0x1091]

const _breakWords = (str: string, styles): string[] => {
  const breaker = LineBreaker(str, {
    lineBreak: styles.lineBreak,
    wordBreak: 'normal'
  })

  const words = []
  let bk

  while (!(bk = breaker.next()).done) {
    if (bk.value) {
      const value = bk.value.slice()
      const codePoints = toCodePoints(value)
      let word = ''
      codePoints.forEach((codePoint) => {
        if (wordSeparators.indexOf(codePoint) === -1) {
          word += fromCodePoint(codePoint)
        } else {
          if (word.length) {
            words.push(word)
          }
          words.push(fromCodePoint(codePoint))
          word = ''
        }
      })

      if (word.length) {
        words.push(word)
      }
    }
  }

  return words
}
