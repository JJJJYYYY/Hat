const POINT_R = 0.5
export function drawPath (old: string = '', path: number[][]) {
  switch (path.length) {
    case 0:
      return ''
    case 1:
      return `M${path[0][0] - POINT_R} ${path[0][1]} A ${POINT_R} ${POINT_R},0,0,1,${path[0][0] - POINT_R} ${path[0][1]}`
    case 2:
      return `M${path[0][0]} ${path[0][1]} L${path[1][0]} ${path[1][1]}`
    case 3:
      {
        let p1 = path[0]
        let p2 = path[1]
        let p3 = path[2]
        let start = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
        let end = [(p3[0] + p2[0]) / 2, (p3[1] + p2[1]) / 2]
        return `M${p1[0]} ${p1[1]} L${start[0]} ${start[1]} Q${p2[0]} ${p2[1]} ${end[0]} ${end[1]} L${p3[0]} ${p3[1]}`
      }
    default:
      {
        let len = path.length
        let p1 = path[len - 3]
        let p2 = path[len - 2]
        let p3 = path[len - 1]
        let start = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
        let end = [(p3[0] + p2[0]) / 2, (p3[1] + p2[1]) / 2]
        return `${old.replace(/L(\d|\s)+$/g, '')} Q${p2[0]} ${p2[1]} ${end[0]} ${end[1]} L${p3[0]} ${p3[1]}`
      }
  }
}
