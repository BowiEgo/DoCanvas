import { LayoutBox, createLayoutBox } from './layoutBox'

export interface LayoutBlock extends LayoutBox {}

export function createLayoutBlock() {
  let layoutBlock = createLayoutBox()

  return layoutBlock
}
