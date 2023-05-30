// BoxModel
// |-------------------------------------------------|
// |                                                 |
// |                  margin-top                     |
// |                                                 |
// |    |---------------------------------------|    |
// |    |                                       |    |
// |    |             border-top                |    |
// |    |                                       |    |
// |    |    |--------------------------|--|    |    |
// |    |    |                          |  |    |    |
// |    |    |       padding-top        |##|    |    |
// |    |    |                          |##|    |    |
// |    |    |    |----------------|    |##|    |    |
// |    |    |    |                |    |  |    |    |
// | ML | BL | PL |  content box   | PR |SW| BR | MR |
// |    |    |    |                |    |  |    |    |
// |    |    |    |----------------|    |  |    |    |
// |    |    |                          |  |    |    |
// |    |    |      padding-bottom      |  |    |    |
// |    |    |                          |  |    |    |
// |    |    |--------------------------|--|    |    |
// |    |    |     scrollbar height ####|SC|    |    |
// |    |    |-----------------------------|    |    |
// |    |                                       |    |
// |    |           border-bottom               |    |
// |    |                                       |    |
// |    |---------------------------------------|    |
// |                                                 |
// |                margin-bottom                    |
// |                                                 |
// |-------------------------------------------------|

// BL = border-left
// BT = border-top
// BR = border-right
// BB = border-bottom
// MT = margin-top
// MR = margin-right
// MB = margin-bottom
// ML = margin-left
// PT = padding-top
// PR = padding-right
// PB = padding-bottom
// PL = padding-left
// SC = scroll corner
// SW = scrollbar width
// CW = content width
// CH = content height
// BW = box width
// BH = box height

export interface BoxModel {
  BL: number
  BT: number
  BR: number
  BB: number
  MT: number
  MR: number
  MB: number
  ML: number
  PT: number
  PR: number
  PB: number
  PL: number
  SC: number
  SW: number
  CW: number
  CH: number
  BW: number
  BH: number
}

export function createBoxModel(
  BL,
  BT,
  BR,
  BB,
  MT,
  MR,
  MB,
  ML,
  PT,
  PR,
  PB,
  PL,
  SC,
  SW,
  CW,
  CH
): BoxModel {
  let boxModel = {
    BL,
    BT,
    BR,
    BB,
    MT,
    MR,
    MB,
    ML,
    PT,
    PR,
    PB,
    PL,
    SC,
    SW,
    CW,
    CH,
    BW: null,
    BH: null
  }

  Object.defineProperty(boxModel, 'BW', {
    get() {
      return (
        boxModel.BL +
        boxModel.BR +
        boxModel.ML +
        boxModel.MR +
        boxModel.PL +
        boxModel.PR
      )
    }
  })

  Object.defineProperty(boxModel, 'BH', {
    get() {
      return (
        boxModel.BT +
        boxModel.BB +
        boxModel.MT +
        boxModel.MB +
        boxModel.PT +
        boxModel.PB
      )
    }
  })

  return boxModel
}
