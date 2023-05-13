import { createContext } from './context'
import { createRenderer } from './render'
import { createElementAPI } from './element'

export function createDoCanvas(options) {
  const context = createContext()

  let doCanvas = {
    context: context,
    renderer: createRenderer(options),
    createElement: createElementAPI(context)
  }

  context.body = doCanvas.createElement('body')
  doCanvas.renderer.render()

  return doCanvas
}
