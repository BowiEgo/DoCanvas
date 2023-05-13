import { CSSToken, TokenType } from './tokenizer'

export type CSSBlockType =
  | TokenType.LEFT_PARENTHESIS_TOKEN
  | TokenType.LEFT_SQUARE_BRACKET_TOKEN
  | TokenType.LEFT_CURLY_BRACKET_TOKEN

export interface CSSBlock {
  type: CSSBlockType
  values: CSSValue[]
}

export interface CSSFunction {
  type: TokenType.FUNCTION
  name: string
  values: CSSValue[]
}

export type CSSValue = CSSFunction | CSSToken | CSSBlock
