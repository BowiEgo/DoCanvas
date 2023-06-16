// RenderBody {BODY} at (0, 0) size 640x480 [bgcolor=# FFFFFF]
// |—— RenderBlock {P} at (0, 0) size 640x80
// | |—— RenderText {#text} at (0, 0) size 48x24 "First line."
// | |—— RenderBR {BR} at (20, 20) size 0x0
// | |—— RenderText {#text} at (0, 24) size 48x24 "Second one."

import { BACKGROUND_CLIP } from '../css/property-descriptors/background-clip'
import { Color } from '../css/types/color'
import { CanvasElement, Layout } from '../element/element'
import { Engine } from '../engine'
import { LayoutBox, isLayoutBox } from '../layout/layoutBox'
import { isLayoutInlineBlock } from '../layout/layoutInlineBlock'
import { getBackgroundValueForIndex } from './canvas/background'
import { isBezierCurve } from './canvas/bezierCurve'
import {
  BoundCurves,
  calculateBorderBoxPath,
  calculateContentBoxPath,
  calculatePaddingBoxPath
} from './canvas/boundCurves'
import { Path } from './canvas/path'
import { Vector } from './canvas/vector'
import { RenderImage } from './renderImage'
import { RenderObject, RenderType } from './renderObject'

export type RenderConfigurations = RenderOptions & {
  backgroundColor: Color | null
}

export interface RenderOptions {
  canvas?: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr?: number
  fontFamily: string
  width: number
  height: number
}

export interface CanvasRenderer {
  context: Engine
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr?: number
  defaultFontFamily: string
  root: RenderObject
  clear(renderObject: RenderObject): void
  render(elm?: CanvasElement): void
  paint(renderObject: RenderObject): void
  paintBlock(renderObject: RenderObject): void
  paintInline(renderObject: RenderObject): void
  paintInlineBlock(renderObject: RenderObject): void
  paintText(renderObject: RenderObject): void
  paintImage(renderObject: RenderObject): void
  renderReplacedElement(
    container: CanvasElement,
    image: HTMLImageElement | HTMLCanvasElement,
    curves: BoundCurves
  ): void
  mask(paths: Path[]): void
}

export function createRenderer(options: RenderConfigurations): CanvasRenderer {
  let renderer: CanvasRenderer = {
    context: null,
    canvas: options.canvas,
    ctx: options.ctx,
    dpr: options.dpr || 1,
    defaultFontFamily: options.fontFamily,
    root: null,
    clear,
    render,
    paint,
    paintBlock,
    paintInline,
    paintInlineBlock,
    paintText,
    paintImage,
    renderReplacedElement,
    mask
  }

  return renderer
}

function _getContainerBox(elm: CanvasElement): LayoutBox {
  let layoutBox = elm.getLayoutObject()
  if (!isLayoutBox(layoutBox)) {
    layoutBox = _getContainerBox(elm.getContainer())
  }

  return layoutBox
}

function clear(this: CanvasRenderer, renderObject: RenderObject) {
  const { ctx } = this
  const { rect } = _getContainerBox(renderObject.element)

  ctx.clearRect(rect.x, rect.y, rect.width, rect.height)
}

function render(this: CanvasRenderer, elm: CanvasElement) {
  this.clear(elm.renderObject)
  this.paint(elm.renderObject)
}

async function paint(this: CanvasRenderer, renderObject: RenderObject) {
  switch (renderObject.type) {
    case RenderType.BLOCK:
      this.paintBlock(renderObject)
      break
    case RenderType.INLINE:
      this.paintInline(renderObject)
      break
    case RenderType.INLINE_BLOCK:
      this.paintInlineBlock(renderObject)
      break
    case RenderType.TEXT:
      // this.paintText(renderObject)
      break
    case RenderType.IMAGE:
      await this.paintImage(renderObject)
      break
    default:
      break
  }

  if (renderObject.hasChildNode()) {
    renderObject.children.forEach((child) => this.paint(child))
  }
}

function mask(paths: Path[]): void {
  this.ctx.beginPath()
  this.ctx.moveTo(0, 0)
  this.ctx.lineTo(this.canvas.width, 0)
  this.ctx.lineTo(this.canvas.width, this.canvas.height)
  this.ctx.lineTo(0, this.canvas.height)
  this.ctx.lineTo(0, 0)
  this.formatPath(paths.slice(0).reverse())
  this.ctx.closePath()
}

function _path(ctx: CanvasRenderingContext2D, paths: Path[]): void {
  ctx.beginPath()
  _formatPath(ctx, paths)
  ctx.closePath()
}

function _formatPath(ctx: CanvasRenderingContext2D, paths: Path[]): void {
  paths.forEach((point, index) => {
    const start: Vector = isBezierCurve(point) ? point.start : point
    if (index === 0) {
      ctx.moveTo(start.x, start.y)
    } else {
      ctx.lineTo(start.x, start.y)
    }

    if (isBezierCurve(point)) {
      ctx.bezierCurveTo(
        point.startControl.x,
        point.startControl.y,
        point.endControl.x,
        point.endControl.y,
        point.end.x,
        point.end.y
      )
    }
  })
}

function _paintBackGroundAndBorder(
  ctx: CanvasRenderingContext2D,
  renderObject
) {
  const styles = renderObject.element.getComputedStyles()
  renderObject.initCurves()
  const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(
    getBackgroundValueForIndex(styles.backgroundClip, 0),
    renderObject.curves
  )

  ctx.save()

  _path(ctx, backgroundPaintingArea)
  ctx.clip()

  // if (!isTransparent(styles.backgroundColor)) {
  if (styles.backgroundColor && styles.backgroundColor !== 'transparent') {
    ctx.fillStyle = styles.backgroundColor
    ctx.fill()
  }

  ctx.restore()
}

function paintBlock(this: CanvasRenderer, renderObject) {
  _paintBackGroundAndBorder(this.ctx, renderObject)
}

function paintInline(this: CanvasRenderer, renderObject) {
  const anonymousBlock = renderObject.element
    .getLayoutObject()
    .getAnonymousBlock()

  if (!anonymousBlock) return

  const lineBoxs = anonymousBlock.lineBoxs

  if (lineBoxs.isPainted) return

  lineBoxs.lineArray.forEach((line) => {
    line.children.forEach((lineItem) => {
      if (!isLayoutInlineBlock(lineItem)) {
        const { ctx } = this
        const styles = lineItem.layoutText.getTextStyles()

        ctx.textBaseline = 'ideographic'
        ctx.font = `normal ${styles.fontSize}px ${
          styles.fontFamily || this.defaultFontFamily
        }`
        ctx.fillStyle = styles.color

        ctx.fillText(
          lineItem.text,
          lineItem.rect.start,
          lineItem.rect.before +
            renderObject.element.getLayoutObject().getContainer().rect.before
        )

        // console.log(
        //   'paintText',
        //   line.rect.before,
        //   line,
        //   lineItem,
        //   lineItem.layoutText,
        //   styles.color,
        //   lineItem.text,
        //   lineItem.rect.start,
        //   lineItem.rect.before,
        //   renderObject.element.getLayoutObject().getContainer().rect.before
        // )
      }
      lineItem.isPainted = true
    })
  })
  lineBoxs.isPainted = true
}

function paintInlineBlock(this: CanvasRenderer, renderObject) {
  _paintBackGroundAndBorder(this.ctx, renderObject)
}

function paintText(this: CanvasRenderer, renderObject) {
  const { ctx } = this
  const styles = renderObject.getTextStyles()

  ctx.textBaseline = 'ideographic'
  ctx.font = `normal ${styles.fontSize}px ${
    styles.fontFamily || this.defaultFontFamily
  }`
  ctx.fillStyle = styles.color
  renderObject.textLines.lines.forEach((line) =>
    ctx.fillText(line[0], line[1], line[2] + renderObject.layoutBox.top)
  )
}

async function paintImage(this: CanvasRenderer, renderObject: RenderImage) {
  this.context.logger.debug(`paintImage-0`, renderObject)
  renderObject.initCurves()
  const image = await this.context.cache.match(
    renderObject.element._options.src
  )
  this.context.logger.debug(
    `paintImage-1`,
    image,
    image.naturalWidth,
    renderObject.element
  )
  this.renderReplacedElement(renderObject.element, image, renderObject.curves)
}

function renderReplacedElement(
  this: CanvasRenderer,
  container: CanvasElement,
  image: HTMLImageElement | HTMLCanvasElement,
  curves: BoundCurves
): void {
  const { ctx } = this
  const { rect } = container.getLayoutObject() as LayoutBox

  const path = calculatePaddingBoxPath(curves)
  _path(ctx, path)
  ctx.clip()
  ctx.save()
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    rect.x,
    rect.y,
    rect.width,
    rect.height
  )

  ctx.restore()
}

const calculateBackgroundCurvedPaintingArea = (
  clip: BACKGROUND_CLIP,
  curves: BoundCurves
): Path[] => {
  switch (clip) {
    case BACKGROUND_CLIP.BORDER_BOX:
      return calculateBorderBoxPath(curves)
    case BACKGROUND_CLIP.CONTENT_BOX:
      return calculateContentBoxPath(curves)
    case BACKGROUND_CLIP.PADDING_BOX:
    default:
      return calculatePaddingBoxPath(curves)
  }
}
