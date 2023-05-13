import { DEFAULT_CONTAINER } from '../element'
import STYLE_CONSTANT from '../styleConstant'
import { layer, createCanvasElement } from './layer.spec'

describe('create canvasElement', () => {
  const elm = createCanvasElement('view')
  const childElm = createCanvasElement('view', {
    style: { color: 'red', textAlign: 'center' }
  })
  const textElm = createCanvasElement('text', {})

  layer.mount(elm)

  childElm.appendChild(textElm)
  elm.appendChild(childElm)

  test('canvasElement container', () => {
    expect(elm.container).toEqual(layer.node)
    expect(childElm.container).toEqual(elm)
    expect(textElm.container).toEqual(childElm)
  })

  test("extend container's style", () => {
    expect(textElm.styles.color).toEqual(childElm.styles.color)
    expect(textElm.styles.textAlign).toEqual(childElm.styles.textAlign)
  })

  // test('', () => {})

  // describe('layer init', () => {
  //     // test()
  // })
})
