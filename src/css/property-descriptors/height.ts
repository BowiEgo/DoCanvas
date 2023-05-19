import {
  IPropertyTokenValueDescriptor,
  PropertyDescriptorParsingType
} from '../IPropertyDescriptor'

export const height: IPropertyTokenValueDescriptor = {
  name: 'height',
  initialValue: 'auto',
  prefix: false,
  type: PropertyDescriptorParsingType.TOKEN_VALUE
}
