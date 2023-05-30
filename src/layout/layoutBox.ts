import { pipe } from '../utils'
import {
  LayoutBoxModelObject,
  createLayoutBoxModelObject
} from './layoutBoxModelObject'

export interface LayoutBox extends LayoutBoxModelObject {
  _isLayoutBox: boolean
}

const createBaseLayoutBox =
  () =>
  (o): LayoutBox => {
    let layoutBox = {
      ...o,
      _isLayoutBox: true
    }

    return layoutBox
  }

export const createLayoutBox = function LayoutBox() {
  return pipe(createLayoutBoxModelObject(), createBaseLayoutBox())({})
}
