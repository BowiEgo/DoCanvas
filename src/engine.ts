import { CanvasElement } from './element'
import { RenderObject, createRenderObject } from './render/renderObject'

interface Engine {
  rootRenderObject: RenderObject
  createRoot(rootElm: CanvasElement): void
  createRenderTree(rootElm: CanvasElement): void
}

export function createEngine(): Engine {
  let engine = {
    rootRenderObject: null,
    createRoot,
    createRenderTree
  }

  function createRoot(rootElm) {
    engine.createRenderTree(rootElm)
  }

  function createRenderTree(rootElm) {
    engine.rootRenderObject = createRenderObject(rootElm)
  }

  return engine
}
