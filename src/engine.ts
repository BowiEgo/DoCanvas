import { DoCanvas } from '.'
import { CanvasElement } from './element/element'
import { CanvasRenderer } from './render'
import { RenderObject, createRenderObject } from './render/renderObject'
import { BFS, PostOrderDFS } from './utils/treeSearch'

type EngineOptions = {
  width: number
  height: number
}

export interface Engine {
  renderer: CanvasRenderer
  viewport: { width: number; height: number }
  rootRenderObject: RenderObject
  DFSRenderArray: RenderObject[]
  updateDFSRenderArray(renderObject: RenderObject): void
  measureBoxSize(elm: CanvasElement): void
  flow(elm: CanvasElement): void
  reflow(elm: CanvasElement): void
  paint(elm: CanvasElement): void
  repaint(elm: CanvasElement): void
  getDoc(): DoCanvas
}

export function createEngine(
  doc: DoCanvas,
  renderer: CanvasRenderer,
  options: EngineOptions
): Engine {
  let engine: Engine = {
    renderer,
    viewport: {
      width: options.width,
      height: options.height
    },
    rootRenderObject: null,
    DFSRenderArray: [],
    updateDFSRenderArray,
    measureBoxSize,
    flow,
    reflow,
    paint,
    repaint,
    getDoc
  }

  function updateDFSRenderArray(renderObject) {
    engine.DFSRenderArray = PostOrderDFS(renderObject)
  }

  function measureBoxSize(elm) {
    engine.updateDFSRenderArray(elm.getRenderObject())
    engine.DFSRenderArray.forEach((item) => {
      item.measureBoxSize()
    })
  }

  function flow(elm) {
    const startTime = Date.now()
    const renderObject = elm.getRenderObject()
    console.log(
      'flow',
      elm,
      PostOrderDFS(renderObject)[0],
      BFS(renderObject).map((item) => `${item.type} ${item.element.id}`),
      PostOrderDFS(renderObject).map((item) => `${item.type} ${item.element.id}`)
    )
    elm.computeStyles()
    BFS(renderObject)
      .reverse()
      .forEach((item) => item.measureBoxSize())

    console.log(`flow-updateSize-`)

    BFS(elm.layoutObject)
      .reverse()
      .forEach((item) => {
        item.updateSize()
        console.log(`flow-updateSize-${item.element.id}`, item.size)
      })

    renderObject.flow()
    console.log(`渲染${BFS(elm).length}个元素 耗时 ${Date.now() - startTime} ms`)
    elm.getRootElement().type === 'body' && paint(elm)
  }

  function reflow(elm) {
    console.log('reflow', elm)
    elm.computeStyles()
    elm.getRenderObject().flow()
    elm.getRootElement().type === 'body' && repaint(elm)
  }

  function paint(elm) {
    console.log('paint', elm)
    if (!elm) {
      renderer.render(elm)
    } else {
      renderer.render(elm)
    }
  }

  function repaint(elm) {
    console.log('repaint', elm)
    if (!elm) {
      renderer.render(elm)
    } else {
      renderer.render(elm)
    }
  }

  function getDoc() {
    return doc
  }

  renderer.context = engine

  return engine
}
