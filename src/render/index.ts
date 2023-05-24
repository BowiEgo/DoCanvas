import { BACKGROUND_CLIP } from '../css/property-descriptors/background-clip'
import { Color, isTransparent } from '../css/types/color'
import { CanvasElement } from '../element'
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
  width: number
  height: number
}

export interface CanvasRenderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr?: number
  root: RenderObject
  paint(renderObject: RenderObject): void
  render(elm?: CanvasElement): void
  mask(paths: Path[]): void
  path(paths: Path[]): void
  formatPath(paths: Path[]): void
}

export function createRenderer(options: RenderConfigurations): CanvasRenderer {
  let renderer: CanvasRenderer = {
    canvas: options.canvas,
    ctx: options.ctx,
    dpr: options.dpr || 1,
    root: null,
    paint,
    render,
    mask,
    path,
    formatPath
  }

  function render(elm) {
    renderer.paint(elm.renderObject)
  }

  function paint(renderObject) {
    switch (renderObject.type) {
      case 'block':
        renderBlock(renderObject)
        break
      case 'inline-block':
        renderInline(renderObject)
        break
      case 'inline':
        renderInline(renderObject)
        break
      case 'text':
        renderText(renderObject)
        break
      default:
        break
    }

    if (renderObject.hasChildren()) {
      renderObject.children.forEach((child) => paint(child))
    }
  }

  function mask(paths: Path[]): void {
    renderer.ctx.beginPath()
    renderer.ctx.moveTo(0, 0)
    renderer.ctx.lineTo(renderer.canvas.width, 0)
    renderer.ctx.lineTo(renderer.canvas.width, renderer.canvas.height)
    renderer.ctx.lineTo(0, renderer.canvas.height)
    renderer.ctx.lineTo(0, 0)
    renderer.formatPath(paths.slice(0).reverse())
    renderer.ctx.closePath()
  }

  function path(paths: Path[]): void {
    renderer.ctx.beginPath()
    renderer.formatPath(paths)
    renderer.ctx.closePath()
  }

  function formatPath(paths: Path[]): void {
    paths.forEach((point, index) => {
      const start: Vector = isBezierCurve(point) ? point.start : point
      if (index === 0) {
        renderer.ctx.moveTo(start.x, start.y)
      } else {
        renderer.ctx.lineTo(start.x, start.y)
      }

      if (isBezierCurve(point)) {
        renderer.ctx.bezierCurveTo(
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

  function paintBackGroundAndBorder(renderObject) {
    const { ctx } = renderer
    const styles = renderObject.computedStyles
    const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(
      getBackgroundValueForIndex(styles.backgroundClip, 0),
      renderObject.curves
    )
    ctx.save()
    path(backgroundPaintingArea)
    ctx.clip()

    // if (!isTransparent(styles.backgroundColor)) {
    if (styles.backgroundColor && styles.backgroundColor !== 'transparent') {
      ctx.fillStyle = styles.backgroundColor
      ctx.fill()
    }

    ctx.restore()
  }

  function renderBlock(renderObject) {
    paintBackGroundAndBorder(renderObject)
  }

  function renderInline(renderObject) {
    paintBackGroundAndBorder(renderObject)
  }

  function renderText(renderObject) {
    const { ctx } = renderer
    const styles = renderObject.getTextStyles()

    ctx.textBaseline = 'ideographic'
    ctx.font = `normal ${styles.fontSize}px PingFang SC`
    ctx.fillStyle = styles.color
    renderObject.textLines.lines.forEach((line) =>
      ctx.fillText(line[0], line[1], line[2] + renderObject.layoutBox.top)
    )
  }

  return renderer
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
