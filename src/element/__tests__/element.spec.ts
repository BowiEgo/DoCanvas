import DoCanvas from '../../__test__/index.spec'

// typescript enum error on tests
// see more https://github.com/kulshekhar/ts-jest/issues/3397
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
    expect(elm.getContainer()).toEqual(DoCanvas.body)
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
