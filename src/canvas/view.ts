import { CanvasElement } from './element'

interface ViewElement extends CanvasElement {
  paint(): void
}

export function createViewElement(element: CanvasElement): ViewElement {
  return {
    ...element,
    paint() {
      console.log('paint-----')
      const renderer = this.getRenderer()

      if (this.options.render) {
        this.options.render(renderer.getCtx(), renderer.getCanvas(), this)
      } else {
        renderer._drawBackground(this)
        renderer._drawBox(this)
      }
    }
  }
}
