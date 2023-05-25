<script setup lang="ts">
import { ref } from 'vue'
import HtmlToCanvas from './components/htmlToCanvas.vue'

const rawHtml = ref(
  '<div style="height: 422px; border-bottom: 1px solid rgb(0, 0, 0); box-sizing: border-box;"><div style="color: red; background-color: rgba(0, 174, 236, 0.27); width: 300px; height: auto; margin-top: 40px;"><span>😱一、选择适合的报纸在进行登报挂失前，您需要选择一家有一定知名度和影响力的报纸进行登报。目前，大多数地区都有本地的日报、晚报、周报等媒体，您可以选择其中的一家来登报。二、撰写登报文章登报文章的撰写需要遵守一定的规定和格式。一般来说，登报文章应该包含以下几个方面的内容： 👌</span><span></span></div><div style="background-color: green; width: 50px; height: 40px;"></div><div style="display: inline-block; background-color: lightgreen; width: 150px; height: 50px;"></div><div style="display: inline-block; background-color: darkorange; width: 150px; height: 50px;"></div><div style="display: inline-block; background-color: pink; width: 150px; height: 50px;"></div></div>'
)
</script>

<template>
  <div id="main">
    <div>
      <textarea
        class="textarea"
        name=""
        id=""
        cols="30"
        rows="50"
        v-model="rawHtml"
        placeholder="put html here."
      ></textarea>
    </div>

    <div class="preview-html">
      <div v-html="rawHtml"></div>
    </div>

    <HtmlToCanvas />
  </div>
</template>

<style>
img {
  display: block;
  width: 100% !important;
}
</style>

<style scoped>
#main {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.textarea {
  width: 400px;
}

.preview-html {
  width: 375px;
  background-color: #fff;
}
</style>
