import { pipe } from '../utils'
import { LayoutObject, createLayoutObject } from './layoutObject'

export interface LayoutBoxModelObject extends LayoutObject {}

const createBaseLayoutBoxModelObject = () => (o) => {
  let layoutBoxModelObject = {
    ...o
  }

  Object.defineProperty(layoutBoxModelObject, 'offsetLeft', {
    get() {
      return 0
    }
  })

  return layoutBoxModelObject
}

export const createLayoutBoxModelObject = function LayoutBoxModelObject() {
  return pipe(createLayoutObject(), createBaseLayoutBoxModelObject())({})
}
