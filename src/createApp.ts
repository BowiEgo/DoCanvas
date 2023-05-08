import { Component, ComponentInternalInstance, Data } from './components'
import { createVNode } from './vnode'
import { createRenderer } from './renderer'
import { createNodeOps } from './nodeOps'

export interface App<HostElement = any> {
  _uid: number
  _component: Component
  _props: Data | null
  _container: HostElement | null
  _instance: ComponentInternalInstance | null

  mount(rootContainer: HostElement | string): any
}

export interface AppContext {
  app: App // for devtools
}

export type createApp<HostElement> = (
  rootComponent: Component,
  rootProps?: Data | null
) => App<HostElement>

let uid = 0

export default function createApp(rootComponent, rootProps = null) {
  const app: App = {
    _uid: uid++,
    _component: rootComponent as Component,
    _props: rootProps,
    _container: null,
    _instance: null,

    mount(rootContainer, layer?): any {
      const vnode = createVNode(rootComponent, rootProps)

      app._container = rootContainer

      layer && layer.mountNode(rootContainer)

      createRenderer(createNodeOps(layer)).render(vnode, rootContainer)
    }
  }

  return app
}
