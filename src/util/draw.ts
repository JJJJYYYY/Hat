import { MODEL } from '@/enum/editor'
import { empty } from '@/util'
import { EleRect } from '@/types/editor'

export function getRectPath ({ x1, x2, y1, y2 }: EleRect): string {
  return `M${x1} ${y1}L${x1} ${y2}L${x2} ${y2}L${x2} ${y1}Z`
}

const origin: PropertyDescriptor = {
  value (path: number[][]) {
    return path
  }
}
const firstAndLast: PropertyDescriptor = {
  value (path: number[][]) {
    return path.length > 1
      ? [path[0], path[path.length - 1]]
      : []
  }
}

Object.defineProperty(empty, 'getPath', origin)

const lastReg = /\sL(\d|\s)+$/g
function drawPen (path: number[][], old?: string): string {
  const POINT_R = 1
  switch (path.length) {
    case 0:
      return ''
    case 1:
      return `M${path[0][0] - POINT_R} ${path[0][1]} A${POINT_R} ${POINT_R},0,0,1,${path[0][0] - POINT_R} ${path[0][1]}`
    case 2:
      return `M${path[0][0]} ${path[0][1]} L${path[1][0]} ${path[1][1]}`
    default:
      if (old) {
        let len = path.length
        let p1 = path[len - 3]
        let p2 = path[len - 2]
        let p3 = path[len - 1]
        let start = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
        let end = [(p3[0] + p2[0]) / 2, (p3[1] + p2[1]) / 2]
        return `${old.replace(lastReg, '')} Q${p2[0]} ${p2[1]} ${end[0]} ${end[1]} L${p3[0]} ${p3[1]}`
      } else {
        let lastIndex = path.length - 1
        return path.reduce((d, p, i) => {
          switch (i) {
            case 0: // first point
              return `M${p[0]} ${p[1]}`
            case 1: // second point
              {
                let p1 = path[0]
                let start = [(p1[0] + p[0]) / 2, (p1[1] + p[1]) / 2]
                return `${d} L${start[0]} ${start[1]}`
              }
            case lastIndex: // last point
              return `${d} L${p[0]} ${p[1]}`
            default:
              {
                let p3 = path[i + 1]
                let end = [(p3[0] + p[0]) / 2, (p3[1] + p[1]) / 2]
                return `${d} Q${p[0]} ${p[1]} ${end[0]} ${end[1]}`
              }
          }
        }, '')
      }
  }
}
Object.defineProperty(drawPen, 'getPath', origin)

function drawLine (path: number[][]): string {
  const len = path.length
  return len > 1
    ? `M${path[0][0]} ${path[0][1]} L${path[len - 1][0]} ${path[len - 1][1]}`
    : ''
}
Object.defineProperty(drawLine, 'getPath', firstAndLast)

function drawCircle (path: number[][]): string {
  const last = path[path.length - 1]
  const first = path[0]
  if (first && last) {
    let dis = [last[0] - first[0], last[1] - first[1]]
    let symmetry = [first[0] - dis[0], first[1] - dis[1]]
    let r = Math.sqrt(Math.pow(dis[0], 2) + Math.pow(dis[1], 2))
    return `M${last[0]} ${last[1]} A${r},${r} 0 1 0 ${symmetry[0]},${symmetry[1]} A${r},${r} 0 0 0 ${last[0]},${last[1]}`
  }
  return ''
}
Object.defineProperty(drawCircle, 'getPath', firstAndLast)

function drawPoly (path: number[][]): string {
  if (path.length > 1) {
    return path.reduce((d, p, i) => {
      switch (i) {
        case 0: // first point
          return `M${p[0]} ${p[1]}`
        default:
          {
            return `${d} L${p[0]} ${p[1]}`
          }
      }
    }, '')
  }
  return ''
}
Object.defineProperty(drawPoly, 'getPath', origin)

const drawMethods = new Map<string, Function>([
  [MODEL.DRAW_PEN, drawPen],
  [MODEL.DRAW_LINE, drawLine],
  [MODEL.DRAW_CIRCLE, drawCircle],
  [MODEL.DRAW_POLY, drawPoly]
])

export default function getDrawMethod (type: string): Function {
  return drawMethods.get(type) || empty
}
