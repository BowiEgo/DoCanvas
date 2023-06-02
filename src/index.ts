import { Engine, createEngine } from './engine'
import { CanvasRenderer, createRenderer } from './render/index'
import { CanvasElement, CreateElementFn, createElementAPI } from './element/element'
import { CreateTextNodeFn, createTextNodeAPI } from './element/textNode'

export interface DoCanvas {
  body: CanvasElement
  engine: Engine
  renderer: CanvasRenderer
  createElement: CreateElementFn
  createTextNode: CreateTextNodeFn
}

export function createDoCanvas(options) {
  console.log('createDoCanvas', options)
  let doc = {} as DoCanvas
  const renderer = createRenderer(options)
  const engine = createEngine(renderer, options)
  const createElement = createElementAPI(engine)
  const createTextNode = createTextNodeAPI()

  doc = {
    body: null,
    engine,
    renderer,
    createElement,
    createTextNode
  }

  doc.body = createElement('body')

  return doc
}
