import { createDoCanvas } from '..'

const { Canvas } = require('skia-canvas')

const w = 300
const h = 800
const canvas = new Canvas(w, h)
const ctx = canvas.getContext('2d')

const DoCanvas = createDoCanvas({
  canvas,
  ctx,
  width: w,
  height: h,
  backgroundColor: '#fff',
  debug: false
})

describe('do-canvas', () => {
  it('should have createElement API', () => {
    expect(DoCanvas).toHaveProperty('createElement')
  })
})

export default DoCanvas
