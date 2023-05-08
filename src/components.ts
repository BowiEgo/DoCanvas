import { isFunction } from './utils'
import { AppContext } from './createApp'

export type Data = Record<string, unknown>

export interface ComponentOptions<Props> {
  template: string
}

export type Component<Props = any> = ConcreteComponent

export type ConcreteComponent<Props = {}> = ComponentOptions<Props>

export interface ComponentInternalInstance {
  uid: number
  type: ConcreteComponent
  parent: ComponentInternalInstance | null
  root: ComponentInternalInstance
  appContext: AppContext
}
