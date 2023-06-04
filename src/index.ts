import { Engine, createEngine } from './engine'
import { CanvasRenderer, createRenderer } from './render'
import { CanvasElement, CreateElementFn, createElementAPI } from './element/element'

export interface DoCanvas {
  body: CanvasElement
  engine: Engine
  renderer: CanvasRenderer
  createElement: CreateElementFn
}

export function createDoCanvas(options) {
  console.log('createDoCanvas', options)
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

  return doCanvas
}
