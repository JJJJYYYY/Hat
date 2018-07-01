import Vue from 'vue'
import { Module } from 'vuex'

import { TYPE } from '@/enum/store'
import { MODEL } from '@/enum/editor'

import { Size, HatElement, Coord, EleBox, EleLocation } from '@/type/editor'

let boxes: EleBox[] = []

interface EditorState {
  window: Size,
  stage: Coord & Size,
  multiply: boolean,
  model: string,
  notActiveModel: string,
  ratio: number,
  boxIds: number[],
  elements: HatElement[],
  currEle?: HatElement
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
    notActiveModel: MODEL.NONE,
    ratio: 1,
    boxIds: [],
    elements: [],
    currEle: undefined
  },
  getters: {
    selectedBoxes (state): EleBox[] {
      return state.boxIds && boxes
    },
    getElementCount (state): number {
      return state.elements.length
    }
  },
  mutations: {
    // model: move, resize, select, multiply, null=''
    [TYPE.CHANGE_MODEL] (state: EditorState, model: string) {
      console.log('currModel: ', model)
      state.model = model
    },
    [TYPE.CHANGE_ELE] (state: EditorState, { change, i, changeState, context }) {
      change.call(context, state.elements[i], changeState)
    },
    [TYPE.CHANGE_ELE_LOC] (state: EditorState, { i = 0, x, y, width, height }: EleLocation) {
      const ele = state.elements[i]

      if (ele) {
        ele.attrs.x = x
        ele.attrs.y = y
        ele.attrs.width = width
        ele.attrs.height = height
      }
    },
    [TYPE.PRESS_MULTIPLY] (state: EditorState, press: boolean) {
      state.multiply = press
    },
    [TYPE.RESIZE_WINDOW] (state: EditorState, { width, height }: Size) {
      state.window.width = width
      state.window.height = height
    },
    [TYPE.STAGE_CHANGE] (state: EditorState, { x, y }: Coord) {
      state.stage.x = x
      state.stage.y = y
    },
    [MODEL.MULTIPLY] (state: EditorState, box: EleBox) {
      if (!state.boxIds.includes(box.boxId)) {
        boxes.push(box)
        state.boxIds.push(box.boxId)
      }
    },
    [MODEL.SELECT] (state: EditorState, box: EleBox) {
      boxes = [box]
      state.boxIds = [box.boxId]
    },
    [MODEL.CANCEL] (state: EditorState, box: EleBox) {
      boxes = boxes.filter(select => select !== box)
      state.boxIds = boxes.map(select => select.boxId)
    },
    [MODEL.CLEAR] (state: EditorState) {
      boxes = []
      state.boxIds = []
    },
    [TYPE.ADD_ELE] (state: EditorState, ele: HatElement) {
      state.elements.push(ele)
    },
    [TYPE.SCALE_RADIO] (state: EditorState, ratio: number) {
      state.ratio = ratio
    }
  },
  actions: {
    selectBox ({ commit, state }, box?: EleBox) {
      if (box) {
        if (box.boxId) {
          if (state.multiply && state.boxIds.includes(box.boxId)) {
            commit(MODEL.CANCEL, box)
          } else {
            commit(state.multiply ? MODEL.MULTIPLY : MODEL.SELECT, box)
          }
        }
      } else {
        commit(MODEL.CLEAR)
      }
    },
    pressMultiply ({ commit, state }, press: boolean) {
      commit(TYPE.PRESS_MULTIPLY, press)
      // press
      //   ? commit(TYPE.PRESS_MULTIPLY, true)
      //   : setTimeout(() => commit(TYPE.PRESS_MULTIPLY, false), 600)
    }
  }
}

export default editor
