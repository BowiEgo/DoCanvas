import { TreeNode, connectChildren } from './treeNode'
import { CanvasElement } from './element'
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
  renderer: CanvasRenderer
  _initRender(): void
  _initC2PList(): void
  _initP2CList(): void
  _flow(): void
  _reflow(): void
  _initPaintList(): void
  _reflowElement(el: CanvasElement): void
  __callBeforePaint(): void
  _repaint(): void
  update(ctx: CanvasRenderingContext2D, options: LayerOptions): void
  mountNode(node: CanvasElement): void
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
    renderer: createCanvasRenderer(layer),

    _initRender() {
      // for 打印耗时
      const startTime = Date.now()

      connectChildren(layer.node)
      layer._initC2PList()
      layer._initP2CList()
      console.log('initRender', layer.c2pList)

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

    _reflowElement(el) {},

    __callBeforePaint() {
      for (let i = 0; i < layer.p2cList.length; i++) {
        layer.p2cList[i].beforePaint && layer.p2cList[i].beforePaint()
      }
    },

    /**
     * 可以给定element，则只会重绘element所在的区域
     * @param {Element} element
     */
    _repaint(element = layer.node) {
      if (isWX) {
        // 微信环境下始终重绘整个树
        element = layer.node
      }
      if (!element.isInFlow()) element = layer.node

      layer._callBeforePaint()

      layer.renderer.readyToRender(layer.node)
    },

    update(ctx, options) {
      layer.ctx = ctx
      layer.options = options
      layer.options.renderStyles = options
      if (layer.node) {
        layer.node.context.container = layer.options
      }
    },

    mountNode(node) {
      console.info('mountNode------------------------', node)
      node.layer = layer
      node.root = node
      layer.node = node

      layer._initRender()
    },

    onElementRemove() {},

    onElementAdd(el) {
      layer._initC2PList()
      layer._initP2CList()

      layer.p2cList.forEach((item) => {
        item.init()
      })

      layer._reflowElement(el)
    },

    // 元素变化后调用，尽可能少重排重绘
    onElementChange(element) {
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

  return layer
}
