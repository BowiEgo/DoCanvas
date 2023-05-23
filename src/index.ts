import { Engine, createEngine } from './engine'
import { CanvasRenderer, createRenderer } from './render'
import { CanvasElement, createElementAPI } from './element'

export interface DoCanvas {
  body: CanvasElement
  engine: Engine
  renderer: CanvasRenderer
  createElement
}

export function createDoCanvas(options) {
  let doCanvas = {} as DoCanvas
  const renderer = createRenderer(options)
  const engine = createEngine(renderer, options)
  const createElement = createElementAPI(engine)

  doCanvas = {
    body: null,
    engine,
    renderer,
    createElement
  }

  doCanvas.body = createElement('body')
  engine.createRoot(doCanvas.body)

  return doCanvas
}
