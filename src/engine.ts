import { CanvasElement } from './element'
import { RenderObject, createRenderObject } from './render/renderObject'
import { PostOrderDFS } from './utils/treeSearch'

export interface Engine {
  rootRenderObject: RenderObject
  DFSRenderArray: RenderObject[]
  createRoot(rootElm: CanvasElement): void
  createRenderTree(rootElm: CanvasElement): void
  createLayoutTree(rootElm: CanvasElement): void
  updateDFSRenderArray(renderObject: RenderObject): void
  measureLayout(elm: CanvasElement): void
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
    measureLayout,
    flow,
    reflow,
    paint,
    repaint
  }

  function createRoot(rootElm) {
    engine.createRenderTree(rootElm)
    engine.createLayoutTree()
    engine.measureLayout(rootElm)

    // let printOutTree = engine.DFSRenderArray.map(
    //   (item) => `${item.type}: ${item.computedStyle}`
    // )
    // console.log('2222printOutTree', printOutTree)
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

  function measureLayout(elm) {
    engine.updateDFSRenderArray(elm.renderObject)
    engine.DFSRenderArray.forEach((item) => {
      item.measureBoxSize()
    })
  }

  function flow(elm) {
    elm.renderObject.computeStyles()
    elm.renderObject.flow()
    elm.hasRootElement() && repaint(elm)
  }

  function reflow(elm) {
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
    console.log('paint', elm)
    if (!elm) {
      renderer.paint(engine.rootRenderObject)
    } else {
      renderer.paint(elm.renderObject)
    }
  }

  renderer.engine = engine

  return engine
}
