type GlobalValue = 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset'

export type TextAlign =
  | 'start'
  | 'end'
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'justify-all'
  | 'match-parent'
  | GlobalValue

export type VerticalAlign =
  | 'middle'
  | 'baseline'
  | 'sub'
  | 'super'
  | 'text-top'
  | 'text-bottom'
  | 'top'
  | 'bottom'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset'
  | number
  | GlobalValue

export type JustifyContent =
  | 'center' /* Pack items around the center */
  | 'start' /* Pack items from the start */
  | 'end' /* Pack items from the end */
  | 'flex-start' /* Pack flex items from the start */
  | 'flex-end' /* Pack flex items from the end */
  | 'left' /* Pack items from the left */
  | 'right' /* Pack items from the right */
  | 'normal'
  /* Distributed alignment */
  | 'space-between' /* Distribute items evenly
                                   The first item is flush with the start,
                                   the last is flush with the end */
  | 'space-around' /* Distribute items evenly
                                   Items have a half-size space
                                   on either end */
  | 'space-evenly' /* Distribute items evenly
                                   Items have equal space around them */
  | 'stretch' /* Distribute items evenly
                                   Stretch 'auto'-sized items to fit
                                   the container */
  /* Overflow alignment */
  | 'safe center'
  | 'unsafe center'
  | GlobalValue

export type AlignItems =
  /* Basic keywords */
  | 'normal'
  | 'stretch'
  /* Positional alignment */
  /* align-items does not take left and right values */
  | 'center' /* Pack items around the center */
  | 'start' /* Pack items from the start */
  | 'end' /* Pack items from the end */
  | 'flex-start' /* Pack flex items from the start */
  | 'flex-end' /* Pack flex items from the end */
  | 'self-start' /* Pack flex items from the start */
  | 'self-end' /* Pack flex items from the end */
  /* Baseline alignment */
  | 'baseline'
  | 'first baseline'
  | 'last baseline' /* Overflow alignment (for positional alignment only) */
  | 'safe center'
  | 'unsafe center'
  | GlobalValue

export type AlignSelf =
  /* Keyword values */
  | 'auto'
  | 'normal'
  /* Positional alignment */
  /* align-self does not take left and right values */
  | 'center' /* Put the item around the center */
  | 'start' /* Put the item at the start */
  | 'end' /* Put the item at the end */
  | 'self-start' /* Align the item flush at the start */
  | 'self-end' /* Align the item flush at the end */
  | 'flex-start' /* Put the flex item at the start */
  | 'flex-end' /* Put the flex item at the end */
  /* Baseline alignment */
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'stretch' /* Stretch 'auto'-sized items to fit the container */
  /* Overflow alignment */
  | 'safe center'
  | 'unsafe center'
  | GlobalValue

export type WhiteSpace =
  /* Keyword values */
  | 'normal'
  | 'nowrap'
  | 'pre'
  | 'pre-wrap'
  | 'pre-line'
  | 'break-spaces'
  | GlobalValue

export type Position =
  | 'static'
  | 'relative'
  | 'absolute'
  | 'fixed'
  | 'sticky'
  | GlobalValue

export interface ElementStyleType {
  display?: string
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  height?: number | string
  borderRadius?: number
  borderColor?: string
  lineCap?: string
  flex?: string | number
  flexDirection?: string
  verticalAlign?: VerticalAlign
  textAlign?: TextAlign
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  alignSelf?: AlignSelf
  whiteSpace?: WhiteSpace
  zIndex?: number
  visible?: boolean
  position?: Position
}

const DISPLAY = {
  BLOCK: 'block',
  INLINE_BLOCK: 'inline-block',
  INLINE: 'inline', // 用户不能设置inline，text默认为inline
  FLEX: 'flex',
  NONE: 'none'
}

const WIDTH = {
  AUTO: 'auto',
  OUTER: '100%'
}

const POSITION = {
  ABSOLUTE: 'absolute',
  FIXED: 'fixed',
  RELATIVE: 'relative',
  STATIC: 'static'
}

const TEXT_ALIGN = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
}

const FLEX_DIRECTION = {
  ROW: 'row',
  COLUMN: 'column'
}

const DEFAULT_STYLES: ElementStyleType = {
  display: DISPLAY.BLOCK,
  fontSize: 14,
  fontWeight: 400,
  fontFamily: 'sans-serif',
  color: '#000',
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  height: WIDTH.AUTO,
  borderRadius: 0,
  borderColor: '#000',
  lineCap: 'square',
  flexDirection: FLEX_DIRECTION.ROW,
  verticalAlign: 'middle',
  textAlign: 'left',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  alignSelf: 'auto',
  whiteSpace: 'normal',
  zIndex: 1,
  visible: true,
  position: 'static'
}

const STYLE_CONSTANT = {
  DISPLAY,
  WIDTH,
  POSITION,
  TEXT_ALIGN,
  FLEX_DIRECTION,
  DEFAULT_STYLES
} as const

export default STYLE_CONSTANT
