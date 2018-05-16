import Vue from 'vue'
import Component from 'vue-class-component'

import { ElementStyle } from '@/type'

import event from '@/util/event'

@Component
export default class Stage extends Vue {
  get cptSize (): ElementStyle {
    return {
      width: `${1000}px`,
      height: `${600}px`,
      background: `${'#fff'}`
    }
  }

  onMousedown (e: MouseEvent) {
    event.$emit('mousedown', e)
  }

  onMousemove (e: MouseEvent) {
    event.$emit('mousemove', e)
  }

  onMouseup (e: MouseEvent) {
    event.$emit('mouseup', e)
  }

  onMouseout (e: MouseEvent) {
    event.$emit('mouseout', e)
  }
}
