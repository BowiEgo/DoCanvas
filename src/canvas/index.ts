import { createEngine } from './engine'
import { createRenderer } from './render'
import { createElementAPI } from './element'

export function createDoCanvas(options) {
  const engine = createEngine()
  const createElement = createElementAPI(engine)

  let doCanvas = {
    body: null,
    engine,
    renderer: createRenderer(options),
    createElement: createElement
  }

  doCanvas.body = createElement('body')
  engine.createRoot(doCanvas.body)
  doCanvas.renderer.render()

  return doCanvas
}
