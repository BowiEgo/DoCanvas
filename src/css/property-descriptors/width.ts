import {
  IPropertyTokenValueDescriptor,
  PropertyDescriptorParsingType
} from '../IPropertyDescriptor'

export const width: IPropertyTokenValueDescriptor = {
  name: 'width',
  initialValue: 'auto',
  prefix: false,
  type: PropertyDescriptorParsingType.TOKEN_VALUE
}
