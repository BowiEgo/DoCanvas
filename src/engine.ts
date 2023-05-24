import { CanvasElement } from './element'
import { RenderObject, createRenderObject } from './render/renderObject'
import { BFS, PostOrderDFS } from './utils/treeSearch'

export interface Engine {
  rootRenderObject: RenderObject
  DFSRenderArray: RenderObject[]
  createRoot(rootElm: CanvasElement): void
  createRenderTree(rootElm: CanvasElement): void
  createLayoutTree(rootElm: CanvasElement): void
  updateDFSRenderArray(renderObject: RenderObject): void
  measureBoxSize(elm: CanvasElement): void
  flow(elm: CanvasElement): void
  reflow(elm: CanvasElement): void
  paint(elm: CanvasElement): void
  repaint(elm: CanvasElement): void
}

export function createEngine(renderer, options): Engine {
  let engine = {
    renderer,
    viewport: {
      width: options.width,
      height: options.height
    },
    rootRenderObject: null,
    DFSRenderArray: [],
    createRoot,
    createRenderTree,
    createLayoutTree,
    updateDFSRenderArray,
    measureBoxSize,
    flow,
    reflow,
    paint,
    repaint
  }

  function createRoot(rootElm) {
    engine.createRenderTree(rootElm)
    engine.createLayoutTree()
    // engine.measureBoxSize(rootElm)
  }

  function createRenderTree(rootElm) {
    engine.rootRenderObject = createRenderObject(rootElm)
    engine.rootRenderObject.viewport = engine.viewport
  }

  function createLayoutTree() {
    engine.rootRenderObject.flow()
  }

  function updateDFSRenderArray(renderObject) {
    engine.DFSRenderArray = PostOrderDFS(renderObject)
  }

  function measureBoxSize(elm) {
    engine.updateDFSRenderArray(elm.renderObject)
    engine.DFSRenderArray.forEach((item) => {
      item.measureBoxSize()
    })
  }

  function flow(elm) {
    console.log(
      'flow',
      elm,
      BFS(elm.renderObject).map((item) => `${item.type} ${item.element.id}`),
      PostOrderDFS(elm.renderObject).map(
        (item) => `${item.type} ${item.element.id}`
      )
    )
    elm.renderObject.computeStyles()
    BFS(elm.renderObject)
      .reverse()
      .forEach((item) => item.measureBoxSize())
    elm.renderObject.flow()
    elm.hasRootElement() && paint(elm)
  }

  function reflow(elm) {
    console.log('reflow', elm)
    elm.renderObject.computeStyles()
    elm.renderObject.flow()
    elm.hasRootElement() && repaint(elm)
  }

  function paint(elm) {
    console.log('paint', elm)
    if (!elm) {
      renderer.paint(engine.rootRenderObject)
    } else {
      renderer.paint(elm.renderObject)
    }
  }

  function repaint(elm) {
    console.log('repaint', elm)
    if (!elm) {
      renderer.paint(engine.rootRenderObject)
    } else {
      renderer.paint(elm.renderObject)
    }
  }

  renderer.engine = engine

  return engine
}
