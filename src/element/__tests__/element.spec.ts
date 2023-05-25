import DoCanvas from '../../__test__/index.spec'

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
  const textElm = DoCanvas.createElement('text', {}, 'hello')

  it('should have appendChild API', () => {
    expect(elm).toHaveProperty('appendChild')
  })

  DoCanvas.body.appendChild(elm)
  childElm.appendChild(textElm)
  elm.appendChild(childElm)

  test('canvasElement container', () => {
    expect(elm.container).toEqual(DoCanvas.body)
    expect(childElm.container).toEqual(elm)
    expect(textElm.container).toEqual(childElm)
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
