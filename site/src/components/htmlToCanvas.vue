<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createDoCanvas } from '../../../src/index'

const canvas = ref({} as HTMLCanvasElement)

const STR_CN =
  '😱一、选择适合的报纸在进行登报挂失前，您需要选择一家有一定知名度和影响力的报纸进行登报。目前，大多数地区都有本地的日报、晚报、周报等媒体，您可以选择其中的一家来登报。二、撰写登报文章登报文章的撰写需要遵守一定的规定和格式。一般来说，登报文章应该包含以下几个方面的内容： 👌'
const STR_EN =
  '😱 😱 😱 👌👌👌This webpage transforms plain text into the immaculate emoji language.Want emoji tokens for the VOIP service Discord instead of Unicode characters? Tick that checkbox!'

onMounted(() => {
  const _ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.value.getBoundingClientRect()
  const _w = 375
  const _h = 800
  canvas.value.width = rect.width * dpr
  canvas.value.height = rect.height * dpr

  console.log(_ctx, dpr, _w, _h)

  _ctx.scale(dpr, dpr)

  const DoCanvas = createDoCanvas({
    canvas,
    ctx: _ctx,
    dpr,
    width: _w,
    height: _h,
    backgroundColor: '#fff',
    debug: false
  })

  const elm = DoCanvas.createElement('view', { id: 'container' })
  const childElm1 = DoCanvas.createElement('view', {
    id: 'childElm1:text-container',
    style: {
      color: 'red',
      textAlign: 'center',
      backgroundColor: '#00aeec45',
      width: 300,
      height: 'auto',
      marginTop: 40
    }
  })
  const childElm2 = DoCanvas.createElement('view', {
    id: 'childElm2:green',
    style: {
      backgroundColor: 'green',
      width: 50,
      height: 40
    }
  })
  const childElm3 = DoCanvas.createElement('view', {
    id: 'childElm3:lightgreen',
    style: {
      display: 'inline-block',
      backgroundColor: 'lightgreen',
      width: 150,
      height: 50
    }
  })
  const childElm4 = DoCanvas.createElement('view', {
    id: 'childElm4:darkorange',
    style: {
      display: 'inline-block',
      backgroundColor: 'darkorange',
      width: 150,
      height: 50
    }
  })
  const childElm5 = DoCanvas.createElement('view', {
    id: 'childElm5:pink',
    style: {
      display: 'inline-block',
      backgroundColor: 'pink',
      width: 150,
      height: 50
    }
  })
  const textElm1 = DoCanvas.createElement('text', { style: { fontSize: 15 } }, STR_CN)

  const textElm2 = DoCanvas.createElement('text', { style: { fontSize: 15 } }, STR_EN)

  childElm1.appendChild(textElm1)
  // childElm1.appendChild(textElm2)
  elm.appendChild(childElm1)
  elm.appendChild(childElm2)
  elm.appendChild(childElm3)
  elm.appendChild(childElm4)
  elm.appendChild(childElm5)
  DoCanvas.body.appendChild(elm)
})
</script>

<template>
  <div id="container">
    <canvas id="canvas" style="width: 100%; height: 50%" ref="canvas"></canvas>
  </div>
</template>

<style scoped>
#container {
  width: 375px;
  background-color: #fff;
}
</style>
