import { Color } from '../css/types/color'
import { CanvasElement } from '../element'

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
  render(): void
}

export function createRenderer(options: RenderConfigurations): CanvasRenderer {
  let renderer: CanvasRenderer = {
    canvas: options.canvas,
    ctx: options.ctx,
    dpr: options.dpr || 1,
    render() {}
  }

  return renderer
}
