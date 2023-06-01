import { Engine, createEngine } from './engine'
import { CanvasRenderer, createRenderer } from './render'
import { CanvasElement, CreateElementFn, createElementAPI } from './element/element'
import { CreateTextNodeFn, createTextNode } from './element/textNode'

export interface DoCanvas {
  body: CanvasElement
  engine: Engine
  renderer: CanvasRenderer
  createElement: CreateElementFn
  createTextNode: CreateTextNodeFn
}

export function createDoCanvas(options) {
  console.log('createDoCanvas', options)
  let doCanvas = {} as DoCanvas
  const renderer = createRenderer(options)
  const engine = createEngine(doCanvas, renderer, options)
  const createElement = createElementAPI(engine)

  doCanvas = {
    body: null,
    engine,
    renderer,
    createElement,
    createTextNode
  }

  doCanvas.body = createElement('body')

  return doCanvas
}
