import { NOOP } from '../../utils'

export interface RenderableElement {
  paint(): void
}

export function createRenderableElement() {
  return {
    __v_isRenderableElement: true,
    paint: NOOP
  }
}
