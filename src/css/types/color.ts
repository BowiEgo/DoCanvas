import { ITypeDescriptor } from '../ITypeDescriptor'
import { CSSValue } from '../syntax/parser'

export type Color = number

// export const color: ITypeDescriptor<Color> = {
//   name: 'color',
//   parse: (value: CSSValue): Color => {}
// }

export const isTransparent = (color: Color): boolean => (0xff & color) === 0
