import { createLayer } from '../layer'

const { Canvas } = require('skia-canvas')

const canvas = new Canvas(300, 800)

const _ctx = canvas.getContext('2d')

export const { layer, createCanvasElement } = createLayer(_ctx, {
  _dpr: 1,
  width: 345,
  height: 800,
  lifecycle: {
    onEffectSuccess: () => {
      // 网络请求完成，比如网络图片加载完成并且重新绘制完毕
    },
    onEffectFail() {
      // 网络请求失败
    }
  }
})

// describe('create layer', () => {
//     console.log(layer)

//     // test('', () => {})

//     // describe('layer init', () => {
//     //     // test()
//     // })
// })
