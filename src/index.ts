import { createAppAPI } from './createApp'
import { createRenderer } from './renderer'
import { createNodeOps } from './nodeOps'
import { h } from './h'
import { createLayer } from './canvas'

const XCanvas = {
  createNodeOps,
  createRenderer,
  h,
  createLayer
}

export default XCanvas
