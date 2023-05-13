import { DEFAULT_CONTAINER, createElement } from '..'
import STYLE_CONSTANT from '../../styleConstant'
import DoCanvas from '../../__test__'

describe('create canvasElement', () => {
  const elm = DoCanvas.createElement('view')
  const childElm = DoCanvas.createElement('view', {
    style: {
      color: 'red',
      textAlign: 'center',
      backgroundColor: '#00aeec45',
      width: 100,
      height: 100,
      marginTop: 40
    }
  })
  const textElm = DoCanvas.createElement('text', {
    text: 'hello'
  })

  DoCanvas.context.body.appendChild(elm)
  childElm.appendChild(textElm)
  elm.appendChild(childElm)

  test('canvasElement container', () => {
    expect(elm.getContainer()).toEqual(DoCanvas.context.body)
    expect(childElm.getContainer()).toEqual(elm)
    expect(textElm.getContainer()).toEqual(childElm)
  })

  // test("extend container's style", () => {
  //   expect(textElm.styles.color).toEqual(childElm.styles.color)
  //   expect(textElm.styles.textAlign).toEqual(childElm.styles.textAlign)
  // })

  // test('', () => {})

  // describe('layer init', () => {
  //     // test()
  // })
})
