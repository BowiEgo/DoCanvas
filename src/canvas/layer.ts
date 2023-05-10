import { TreeNode, connectChildren } from './treeNode'
import { CanvasElement, ElementTypes, createElementAPI } from './element'
import { wideTraversal, deepTraversal } from '../utils/traversal'
import { CanvasRenderer, createCanvasRenderer } from './renderer'
import { isWX, walkParent } from '../utils'

export type TravedElementList = Array<CanvasElement>

type LayerOptions = {
  renderStyles: any
}

export interface Layer {
  ctx: CanvasRenderingContext2D
  node: CanvasElement | null
  p2cList: TravedElementList
  c2pList: TravedElementList
  nodeList: TreeNode[]
  options: LayerOptions
  renderer: CanvasRenderer | null
  _initRender(): void
  _initC2PList(): void
  _initP2CList(): void
  _flow(): void
  _reflow(): void
  _initPaintList(): void
  _reflowElement(el: CanvasElement): void
  _callBeforePaint(): void
  _repaint(): void
  init(): void
  update(ctx: CanvasRenderingContext2D, options: LayerOptions): void
  onElementRemove(el: CanvasElement): void
  onElementAdd(el: CanvasElement): void
  onElementChange(el: CanvasElement): void
  animate(): void
  getElementBy(): CanvasElement
  lifecycle(name: string, arg: any): void
}

export function createLayer(ctx, options) {
  const layer: Layer = {
    ctx,
    node: null,
    p2cList: [] as CanvasElement[],
    c2pList: [] as CanvasElement[],
    nodeList: [],
    options: options,
    renderer: null,

    _initRender() {
      // for 打印耗时
      const startTime = Date.now()

      connectChildren(layer.node)
      layer._initC2PList()
      layer._initP2CList()
      console.log('initRender', layer.c2pList, layer.p2cList)

      layer._flow()

      // flow 完成后监听effect完成
      layer.renderer
        .onEffectFinished()
        .then((res) => layer.lifecycle('onEffectSuccess', res))
        .catch((res) => layer.lifecycle('onEffectFail', res))
      // .finally((res) => layer.lifecycle('onEffectFinished', res))

      layer._repaint()

      console.log(
        `渲染${layer.p2cList.length}个元素 耗时 ${Date.now() - startTime} ms`
      )
    },

    _initP2CList() {
      if (layer.node) layer.p2cList = wideTraversal(layer.node)
    },

    _initC2PList() {
      if (layer.node) layer.c2pList = deepTraversal(layer.node)
    },

    _flow() {
      for (let i = 0; i < layer.p2cList.length; i++) {
        layer.p2cList[i].init()
      }

      layer._reflow()
    },

    _reflow() {},

    _initPaintList() {},

    _reflowElement(element) {
      // 如果有line，则需要重第一个开始
      let target: any = element
      while (target && target.line) {
        target = target.parent
      }
      const p2cList = wideTraversal(target)
      for (let i = 0; i < p2cList.length; i++) {
        p2cList[i]._initStyles()
      }

      // 所有子元素
      const children = deepTraversal(target)
      for (let i = 0; i < children.length; i++) {
        children[i]._initWidthHeight()
      }

      if (!element.isInFlow()) {
        for (let i = 0; i < p2cList.length; i++) {
          p2cList[i]._initPosition()
        }
        this._repaint()
      } else {
        this.onElementChange(target)
      }
    },

    _callBeforePaint() {
      for (let i = 0; i < layer.p2cList.length; i++) {
        layer.p2cList[i].beforePaint && layer.p2cList[i].beforePaint()
      }
    },

    /**
     * 可以给定element，则只会重绘element所在的区域
     * @param {Element} element
     */
    _repaint(element = layer.node) {
      console.log('_repaint---------------')
      if (isWX) {
        // 微信环境下始终重绘整个树
        element = layer.node
      }
      if (element && !element.isInFlow()) element = layer.node

      layer._callBeforePaint()

      if (layer.node && layer.renderer) {
        layer.renderer.readyToRender(layer.node)
      } else {
        throw Error('repaint need node in layer')
      }
    },

    update(ctx, options) {
      layer.ctx = ctx
      layer.options = options
      layer.options.renderStyles = options
      // if (layer.node) {
      //   layer.node.container = layer.options
      // }
    },

    init() {
      layer.renderer = createCanvasRenderer(layer)
      layer._initRender()
    },

    onElementRemove() {},

    onElementAdd(el) {
      layer._initC2PList()
      layer._initP2CList()
      console.log('onElementAdd', layer.p2cList)

      layer.p2cList.forEach((item) => {
        item.init()
      })

      layer._reflowElement(el)
    },

    // 元素变化后调用，尽可能少重排重绘
    onElementChange(element) {
      console.log('onElementChange-------')
      walkParent(element, (parent, callbreak) => {
        parent._initWidthHeight()
        if (parent.type === 'scroll-view') callbreak()
      })

      for (let i = 0; i < layer.p2cList.length; i++) {
        layer.p2cList[i]._initPosition()
      }
      layer._repaint()
    },

    animate() {
      console.warn('use [animate] option instead!')
    },

    getElementBy() {
      return layer.node.getElementBy(...arguments)
    },

    lifecycle(name, arg) {
      if (layer.options.lifecycle) {
        layer.options.lifecycle[name] && layer.options.lifecycle[name](arg)
      }
    }
  }

  const createCanvasElement = createElementAPI(layer)
  const createRootCanvasElement = () =>
    createCanvasElement(ElementTypes.root, {}, [])

  layer.node = createRootCanvasElement()
  console.info('init-layer------------------------', layer)
  layer.node.layer = layer
  layer.node.root = layer.node

  layer.init()

  return {
    layer,
    createCanvasElement,
    createRootCanvasElement
  }
}
