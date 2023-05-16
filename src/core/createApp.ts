import { Component, ComponentInternalInstance, Data } from './components'
import { createVNode } from './vnode'

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

export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps = null) {
    const app: App = {
      _uid: uid++,
      _component: rootComponent as Component,
      _props: rootProps,
      _container: null,
      _instance: null,

      mount(rootContainer): any {
        const vnode = createVNode(rootComponent, rootProps)

        app._container = rootContainer

        render(vnode, rootContainer)
      }
    }

    return app
  }
}
