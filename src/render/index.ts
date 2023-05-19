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
    console.log(
      '4444-paint',
      renderObject.type,
      renderObject,
      renderObject.computedStyles,
      renderObject.curves
    )
    const styles = renderObject.computedStyles
    const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(
      getBackgroundValueForIndex(styles.backgroundClip, 0),
      renderObject.curves
    )
    console.log('4444-backgroundPaintingArea', backgroundPaintingArea)
    renderer.ctx.save()
    renderer.path(backgroundPaintingArea)
    renderer.ctx.clip()

    // TODO: transparent color
    // if (!isTransparent(styles.backgroundColor)) {
    renderer.ctx.fillStyle = styles.backgroundColor
    renderer.ctx.fill()
    // }

    renderer.ctx.restore()

    if (renderObject.hasChildren()) {
      console.log('4444-paint', renderObject.children)
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
