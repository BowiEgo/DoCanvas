import { CanvasElement } from '../element/element'
import { createTreeNode } from '../tree-node'
import { pipe, withConstructor } from '../utils'
import { LayoutBox, createLayoutBox } from './layoutBox'
import { LayoutObject } from './layoutObject'

export interface LayoutInlineBlock extends LayoutBox {
  _isLayoutInlineBlock: boolean
  updateLayout(): void
}

export const createLayoutInlineBlock = function LayoutInlineBlock(element: CanvasElement) {
  return pipe(
    createBaseLayoutInlineBlock(),
    withConstructor(LayoutInlineBlock)
  )(createLayoutBox(element))
}

const createBaseLayoutInlineBlock =
  () =>
  (o: LayoutBox): LayoutInlineBlock => {
    let layoutInlineBlock = {
      ...o,
      _isLayoutInlineBlock: true,
      updateSize,
      updateLayout
    }

    return layoutInlineBlock
  }

function updateSize(this: LayoutInlineBlock) {}

function updateLayout(this: LayoutInlineBlock) {}
