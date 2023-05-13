import { CanvasElement } from './element'
import { createStackingContext } from './render/stackingContext'

export interface Context {
  stackingContext: []
  _body: CanvasElement
  onElementAdd(elm: CanvasElement): void
}

export function createContext() {
  let context = {
    stackingContext: null,
    _body: null,
    get body() {
      return context._body
    },
    set body(val) {
      context._body = val
      val.context = context
    },
    onElementAdd(elm) {
      if (elm.root === context.body) {
        console.log('onElementAdd', elm)
        context.stackingContext = createStackingContext(elm)
      }
    }
  }

  return context
}
