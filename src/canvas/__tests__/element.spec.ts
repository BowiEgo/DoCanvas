import { DEFAULT_CONTAINER } from '../element'
import STYLE_CONSTANT from '../styleConstant'
import { layer, createCanvasElement } from './layer.spec'

describe('create canvasElement', () => {
  const elm = createCanvasElement('view')
  const childElm = createCanvasElement('view', {
    style: { color: 'red', textAlign: 'center' }
  })
  const textElm = createCanvasElement('text', {
    style: { color: 'green' }
  })

  layer.mount(elm)

  childElm.appendChild(textElm)
  elm.appendChild(childElm)
  // console.log(childElm.renderStyles)
  // console.log(textElm._getExtendStyles())

  test('canvasElement container', () => {
    expect(elm.container).toEqual(DEFAULT_CONTAINER)
    expect(childElm.getContainer()).toBe(elm)
    expect(textElm.getContainer()).toBe(childElm)
  })

  test("get canvasElement's defaultStyle", () => {
    expect(elm._getDefaultStyles()).toEqual(STYLE_CONSTANT.DEFAULT_STYLES)
  })

  test("get canvasElement's renderStyles", () => {
    // expect(elm.renderStyles)
  })

  test("get canvasElement' parentStyle when it has no parent", () => {
    expect(elm._getExtendStyles()).toEqual({ visible: true })
  })

  test("get canvasElement' parentStyle", () => {
    expect(textElm._getExtendStyles()).toEqual({ visible: true })
  })

  // test('', () => {})

  // describe('layer init', () => {
  //     // test()
  // })
})
