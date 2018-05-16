import Vue from 'vue'
import Component from 'vue-class-component'

import Stage from '@/components/Stage/index.vue'
import Box from '@/components/elements/Box/index.vue'

import event from '@/util/event'

import { ElementStyle } from '@/type'

@Component({
  components: {
    Stage,
    Box
  }
})
export default class Editor extends Vue {
  get cptFullSize (): ElementStyle {
    return {
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
      background: `${'#eee'}`
    }
  }
}
