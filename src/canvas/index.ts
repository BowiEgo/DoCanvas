import { createRenderer } from './render'
import { createElement } from './element'
import { createContext } from './context'

export function createDoCanvas(options) {
  let doCanvas = {
    context: createContext(),
    renderer: createRenderer(options),
    createElement: createElement
  }

  doCanvas.renderer.render()

  return doCanvas
}
