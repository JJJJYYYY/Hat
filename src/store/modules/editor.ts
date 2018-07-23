import Vue from 'vue'
import { Module } from 'vuex'

import { TYPE } from '@/enum/store'
import { MODEL } from '@/enum/editor'

import { Size, HatElement, Coord, EleLocation } from '@/types/editor'

// let selected: HatElement[] = []

interface EditorState {
  window: Size
  stage: Coord & Size
  multiply: boolean
  model: string
  ratio: number // scale
  elements: HatElement[]
  editElement?: HatElement
  selectedElements: HatElement[]
  offset: Coord
  scale: Coord
  angle: number
}

const editor: Module<EditorState, any> = {
  state: {
    window: {
      width: 0,
      height: 0
    },
    stage: {
      x: 0,
      y: 0,
      width: 600,
      height: 600
    },
    multiply: false,
    model: MODEL.NONE,
    ratio: 1,
    elements: [],
    editElement: void 0,
    selectedElements: [],
    scale: { x: 1, y: 1 },
    offset: { x: 0, y: 0 },
    angle: 0
  },
  getters: {
    // selectedElements (state): EleBox[] {
    //   return state.boxIds && boxes
    // },
    // getElementCount (state): number {
    //   return state.elements.length
    // }
  },
  mutations: {
    // model: move, resize, select, multiply, null=''
    [TYPE.CHANGE_MODEL] (state: EditorState, model: string) {
      state.model = model
      console.info('当前状态：', model)
    },
    [TYPE.CHANGE_ELE] (state: EditorState, { change, i, changeState, context }) {
      change.call(context, state.elements[i], changeState)

      state.scale = { x: 1, y: 1 }
      state.offset = { x: 0, y: 0 }
      state.angle = 0
    },
    [TYPE.UPDATE_ELE] (state: EditorState, newEle: HatElement) {
      const index = state.elements.findIndex(e => e.id === newEle.id)
      if (index > -1) {
        Object.assign(state.elements[index], newEle)
      }
    },
    [TYPE.PRESS_MULTIPLY] (state: EditorState, press: boolean) {
      state.multiply = press
      console.log('是否多选：', press)
    },
    [TYPE.RESIZE_WINDOW] (state: EditorState, { width, height }: Size) {
      state.window.width = width
      state.window.height = height
    },
    [TYPE.STAGE_CHANGE] (state: EditorState, { x, y }: Coord) {
      state.stage.x = x
      state.stage.y = y
    },
    [MODEL.MULTIPLY] (state: EditorState, ele: HatElement) {
      if (!state.selectedElements.includes(ele)) {
        state.selectedElements.push(ele)
      }
    },
    [MODEL.SELECT] (state: EditorState, ele: HatElement) {
      state.selectedElements = [ele]
    },
    [MODEL.CANCEL] (state: EditorState, ele: HatElement) {
      state.selectedElements = state.selectedElements.filter(select => select !== ele)
    },
    [MODEL.CLEAR] (state: EditorState) {
      state.selectedElements = []
    },
    [TYPE.ADD_ELE] (state: EditorState, ele: HatElement) {
      state.elements.push(ele)
    },
    [TYPE.SCALE_RADIO] (state: EditorState, ratio: number) {
      state.ratio = ratio
    },
    [TYPE.ELE_OFFSET] (state: EditorState, offset: Coord) {
      state.offset = offset
    },
    [TYPE.ELE_SCALE] (state: EditorState, scale: Coord) {
      state.scale = scale
    },
    [TYPE.ELE_ROTATE] (state: EditorState, angle: number) {
      state.angle = angle
    },
    [TYPE.EDIT_ELEMENT] (state: EditorState, element?: HatElement) {
      state.editElement = element
      state.selectedElements = []
    }
  },
  actions: {
    selectBox ({ commit, state }, ele?: HatElement) {
      if (ele) { // TODO: cancel select
        if (!state.selectedElements.includes(ele)) {
          commit(state.multiply ? MODEL.MULTIPLY : MODEL.SELECT, ele)
        }
      } else {
        commit(MODEL.CLEAR)
      }
      console.info('选中元素：', ele)
    },
    pressMultiply ({ commit, state }, press: boolean) {
      commit(TYPE.PRESS_MULTIPLY, press)
      // press
      //   ? commit(TYPE.PRESS_MULTIPLY, true)
      //   : setTimeout(() => commit(TYPE.PRESS_MULTIPLY, false), 600)
    },
    transformEle ({ commit, state }, { scale, offset }) {
      commit(TYPE.ELE_OFFSET, offset)
      commit(TYPE.ELE_SCALE, scale)
    }
  }
}

export default editor
