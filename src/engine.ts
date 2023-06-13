import { CanvasElement } from './element/element'
import { isLayoutBox } from './layout/layoutBox'
import { CanvasRenderer } from './render'
import { RenderObject } from './render/renderObject'
import { BFS, PostOrderDFS, PreOrderDFS } from './utils/treeSearch'

export interface Engine {
  renderer: CanvasRenderer
  viewport: { width: number; height: number }
  rootRenderObject: RenderObject
  DFSRenderArray: RenderObject[]
  flow(elm: CanvasElement): void
  reflow(elm: CanvasElement): void
  paint(elm: CanvasElement): void
  repaint(elm: CanvasElement): void
}

export function createEngine(renderer, options): Engine {
  let engine: Engine = {
    renderer,
    viewport: {
      width: options.width,
      height: options.height
    },
    rootRenderObject: null,
    DFSRenderArray: [],
    flow,
    reflow,
    paint,
    repaint
  }

  function flow(elm) {
    const startTime = Date.now()
    elm.computeStyles()

    console.log(
      'flow',
      elm,
      elm.getLayoutObject(),
      BFS(elm.getLayoutObject()).map((item) => item)
    )

    BFS(elm.getLayoutObject())
      .filter((item) => isLayoutBox(item))
      .reverse()
      .forEach((item) => item.updateWidthSize())

    elm.getLayoutObject().flow()

    elm.renderObject.initCurves()
    elm.getRootElement().type === 'body' && paint(elm)

    console.log(
      `渲染${BFS(elm).length}个元素 耗时 ${Date.now() - startTime} ms`
    )
  }

  function reflow(elm) {
    console.log('reflow', elm)
    elm.computeStyles()
    elm.renderObject.flow()
    elm.getRootElement().type === 'body' && repaint(elm)
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
