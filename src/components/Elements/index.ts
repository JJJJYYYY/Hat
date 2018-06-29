import { MODEL } from '@/enum/editor'

import Draw from './Draw'

const ElementsMap = new Map<string, any>([
  [MODEL.DRAW_LINE, Draw],
  [MODEL.DRAW_PEN, Draw],
  [MODEL.DRAW_CIRCLE, Draw],
  [MODEL.DRAW_POLY, Draw]
])

export default ElementsMap
