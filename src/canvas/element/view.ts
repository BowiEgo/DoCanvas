import { CanvasElement } from '.'

interface ViewElement extends CanvasElement {
  paint(): void
}

export function toViewElement(element: CanvasElement): ViewElement {
  function paint() {
    const renderer = this.getRenderer()

    if (this.options.render) {
      this.options.render(renderer.getCtx(), renderer.getCanvas(), this)
    } else {
      renderer._drawBackground(this)
      renderer._drawBox(this)
    }
  }

  element.paint = paint

  return element
}
