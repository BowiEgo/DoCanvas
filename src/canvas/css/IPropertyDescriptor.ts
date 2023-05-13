export const enum PropertyDescriptorParsingType {
  VALUE,
  LIST,
  IDENT_VALUE,
  TYPE_VALUE,
  TOKEN_VALUE
}

export interface IPropertyDescriptor {
  name: string
  type: PropertyDescriptorParsingType
  initialValue: string
  prefix: boolean
}

export interface IPropertyIdentValueDescriptor<T> extends IPropertyDescriptor {
  type: PropertyDescriptorParsingType.IDENT_VALUE
  parse: (token: string) => T
}
