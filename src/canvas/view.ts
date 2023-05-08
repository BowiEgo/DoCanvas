import { Element } from './element'

interface View extends Element {
  type: string
}

export function View(Element) {
  return {
    type: 'view',
    ...Element
  }
}
