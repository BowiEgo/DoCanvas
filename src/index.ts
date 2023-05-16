import { createAppAPI } from './core/createApp'
import { createRenderer } from './core/renderer'
import { createNodeOps } from './core/nodeOps'
import { h } from './core/h'
import { createDoCanvas } from './canvas'

const XCanvas = {
  createAppAPI,
  createNodeOps,
  createRenderer,
  h,
  createDoCanvas
}

export default XCanvas
