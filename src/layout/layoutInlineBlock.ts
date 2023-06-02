import { LayoutBox } from './layoutBox'

// export interface LayoutInlineBlock extends LayoutBox {
//   _isLayoutInlineBlock: boolean
//   updateLayout(): void
// }

// export const createLayoutInlineBlock = function LayoutInlineBlock(element: CanvasElement) {
//   return pipe(
//     createBaseLayoutInlineBlock(),
//     withConstructor(LayoutInlineBlock)
//   )(createLayoutBox(element))
// }

export class LayoutInlineBlock extends LayoutBox {
  constructor(element) {
    super(element)
  }
}

// const createBaseLayoutInlineBlock =
//   () =>
//   (o: LayoutBox): LayoutInlineBlock => {
//     let layoutInlineBlock = {
//       ...o,
//       _isLayoutInlineBlock: true,
//       updateSize,
//       updateLayout
//     }

//     return layoutInlineBlock
//   }

// function updateSize(this: LayoutInlineBlock) {}

// function updateLayout(this: LayoutInlineBlock) {}
