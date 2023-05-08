import { RootNode } from './ast'

export interface CodegenResult {
  code: string
  preamble: string
  ast: RootNode
}
