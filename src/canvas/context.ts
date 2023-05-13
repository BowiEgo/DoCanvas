import { createElement } from './element'

export function createContext() {
  let context = {
    stackingContext: null,
    body: createElement('body'),
    getBody() {
      return context.body
    }
  }

  console.log(context.body)

  return context
}
