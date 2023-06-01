// RenderBody {BODY} at (0, 0) size 640x480 [bgcolor=# FFFFFF]
// |—— RenderBlock {P} at (0, 0) size 640x80
// | |—— RenderText {#text} at (0, 0) size 48x24 "First line."
// | |—— RenderBR {BR} at (20, 20) size 0x0
// | |—— RenderText {#text} at (0, 24) size 48x24 "Second one."

import { BACKGROUND_CLIP } from '../css/property-descriptors/background-clip'
import { Color, isTransparent } from '../css/types/color'
import { CanvasElement } from '../element/element'
import { Engine } from '../engine'
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
import { RenderObject } from './renderObject'

export type RenderConfigurations = RenderOptions & {
  backgroundColor: Color | null
}

export interface RenderOptions {
  canvas?: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr?: number
  defaultFontFamily: string
  width: number
  height: number
}

export interface CanvasRenderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr?: number
  defaultFontFamily: string
  root: RenderObject
  render(elm?: CanvasElement): void
  paint(renderObject: RenderObject): void
  paintBlock(renderObject: RenderObject): void
  paintInline(renderObject: RenderObject): void
  paintText(renderObject: RenderObject): void
  mask(paths: Path[]): void
}

export function createRenderer(options: RenderConfigurations): CanvasRenderer {
  let renderer: CanvasRenderer = {
    canvas: options.canvas,
    ctx: options.ctx,
    dpr: options.dpr || 1,
    defaultFontFamily: options.defaultFontFamily,
    root: null,
    render,
    paint,
    paintBlock,
    paintInline,
    paintText,
    mask
  }

  return renderer
}

function render(this: CanvasRenderer, elm) {
  this.paint(elm.renderObject)
}

function paint(this: CanvasRenderer, renderObject: RenderObject) {
  switch (renderObject.type) {
    case 'block':
      this.paintBlock(renderObject)
      break
    case 'inline-block':
      this.paintInline(renderObject)
      break
    case 'inline':
      this.paintInline(renderObject)
      break
    case 'text':
      this.paintText(renderObject)
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

function _paintBackGroundAndBorder(ctx: CanvasRenderingContext2D, renderObject) {
  const styles = renderObject.element.computedStyles
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
  _paintBackGroundAndBorder(this.ctx, renderObject)
}

function paintText(this: CanvasRenderer, renderObject) {
  const { ctx } = this
  const styles = renderObject.getTextStyles()

  ctx.textBaseline = 'ideographic'
  console.log('fontFamily', styles.fontFamily, styles.fontSize)
  ctx.font = `normal ${styles.fontSize}px ${styles.fontFamily || this.defaultFontFamily}`
  ctx.fillStyle = styles.color
  renderObject.textLines.lines.forEach((line) =>
    ctx.fillText(line[0], line[1], line[2] + renderObject.layoutBox.top)
  )
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
