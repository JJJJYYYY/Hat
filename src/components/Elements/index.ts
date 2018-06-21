import Vue from 'vue'
import DrawLine from './DrawLine'
import DrawPen from './DrawPen'

const ElementsMap = new Map<string, any>([
  [DrawLine.name, DrawLine],
  [DrawPen.name, DrawPen]
])

export default ElementsMap
