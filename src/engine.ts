import { Cache, createCache } from './cache'
import { CanvasElement } from './element/element'
import { isLayoutBox } from './layout/layoutBox'
import { Logger, createLogger } from './logger'
import { CanvasRenderer } from './render'
import { RenderObject } from './render/renderObject'
import { BFS, PostOrderDFS, PreOrderDFS } from './utils/treeSearch'

export interface Engine {
  instanceName: string
  viewport: { width: number; height: number }
  cache: Cache
  logger: Logger
  renderer: CanvasRenderer
  rootRenderObject: RenderObject
  DFSRenderArray: RenderObject[]
  flow(elm: CanvasElement): void
  reflow(elm: CanvasElement): void
  paint(elm: CanvasElement): void
  repaint(elm: CanvasElement): void
}

let instanceCount = 1

export function createEngine(renderer: CanvasRenderer, options): Engine {
  let engine: Engine = {
    instanceName: `#${instanceCount++}`,
    viewport: {
      width: options.width,
      height: options.height
    },
    cache: null,
    logger: null,
    renderer,
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

    this.logger.debug(
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
    elm.getRootElement().type === 'body' && this.paint(elm)
    this.logger.debug(
      `渲染${BFS(elm).length}个元素 耗时 ${Date.now() - startTime} ms`
    )
  }

  function reflow(elm) {
    const startTime = Date.now()
    elm.computeStyles()
    this.logger.debug(
      'reflow',
      elm,
      elm.getLayoutObject(),
      BFS(elm.getLayoutObject()).map((item) => item)
    )

    BFS(elm.getLayoutObject())
      .filter((item) => isLayoutBox(item))
      .reverse()
      .forEach((item) => item.updateWidthSize())

    elm.getLayoutObject().flow()

    this.repaint(elm)
    this.logger.debug(
      `重新渲染${BFS(elm).length}个元素 耗时 ${Date.now() - startTime} ms`
    )
  }

  function paint(this: Engine, elm) {
    this.logger.debug(`paint`, elm)
    if (!elm) {
      renderer.paint(this.rootRenderObject)
    } else {
      renderer.paint(elm.renderObject)
    }
  }

  function repaint(elm) {
    this.logger.debug(`repaint`, elm)

    renderer.render(elm)
  }

  engine.cache = createCache(engine, {
    imageTimeout: 200,
    useCORS: true,
    allowTaint: true
  })

  engine.logger = createLogger({
    id: engine.instanceName,
    enabled: options.logging
  })

  renderer.context = engine

  return engine
}
