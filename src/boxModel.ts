import { CanvasElement } from './element'

interface BoxModel {}

export function createBoxModel(element: CanvasElement): BoxModel {
  return {
    bound: {},
    marginBound: {},
    borderBound: {},
    paddingBound: {},
    contentBound: {}
  }
}
