import { Engine, createEngine } from './engine'
import { CanvasRenderer, createRenderer } from './render'
import {
  CanvasElement,
  CreateElementFn,
  createElementAPI
} from './element/element'
import { CreateTextNodeFn, createTextNodeAPI } from './element/textNode'
import { LayoutBox } from './layout/layoutBox'

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
  const engine = createEngine(renderer, options)
  const createElement = createElementAPI(engine)
  const createTextNode = createTextNodeAPI()

  doCanvas = {
    body: null,
    engine,
    renderer,
    createElement,
    createTextNode
  }

  doCanvas.body = createElement('body')
  let bodyLayout = doCanvas.body.getLayoutObject() as LayoutBox
  bodyLayout.updateSize()

  return doCanvas
}
