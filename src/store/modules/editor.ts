import Vue from 'vue'
import { Module } from 'vuex'

import { TYPE } from '@/enum/store'
import { MODEL } from '@/enum/editor'

import { Size, Element, IndexElement, Coord, EleBox } from '@/type/editor'

let boxes: Set<EleBox> = new Set()

interface EditorState {
  window: Size,
  stage: Coord,
  multiply: boolean,
  model: string,
  notActiveModel: string,
  boxIds: number[],
  elements: Element[],
  currEle?: Element
}

const editor: Module<EditorState, any> = {
  state: {
    window: {
      width: 0,
      height: 0
    },
    stage: {
      x: 0,
      y: 0
    },
    multiply: false,
    model: MODEL.NONE,
    notActiveModel: MODEL.NONE,
    boxIds: [],
    elements: [],
    currEle: undefined
  },
  getters: {
    selectedBoxes (state): Set<EleBox> {
      return boxes
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
    [TYPE.CHANGE_NOT_ACTIVE_MODEL] (state: EditorState, model: string) {
      state.notActiveModel = model
    },
    [TYPE.MOVE_ELE] (state: EditorState, { i, attrs, text }: IndexElement) {
      let ele = state.elements[i]
      if (ele) {
        Object.assign(ele.attrs, attrs)
        ele.text = text
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
        boxes.add(box)
        state.boxIds.push(box.boxId)
      }
    },
    [MODEL.SELECT] (state: EditorState, box: EleBox) {
      boxes.clear()
      boxes.add(box)
      state.boxIds = [box.boxId]
    },
    [MODEL.CANCEL] (state: EditorState, box: EleBox) {
      let boxesArr = [...boxes]
      boxes = new Set(boxesArr.filter(select => select !== box))
      state.boxIds = boxesArr.map(select => select.boxId)
    },
    [MODEL.CLEAR] (state: EditorState) {
      boxes.clear()
      state.boxIds = []
    },
    [TYPE.ADD_ELE] (state: EditorState, ele: Element) {
      state.elements.push(ele)
      console.log(state.elements)
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
      console.log('select: ', box)
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
