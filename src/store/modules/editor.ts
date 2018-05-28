import Vue from 'vue'
import { Module } from 'vuex'

import { TYPE } from '@/enum/store'
import { MODEL } from '@/enum/editor'

import { Element, IndexElement } from '@/type/editor'

let boxes: any[] = []

interface EditorState {
  multiply: boolean,
  model: string,
  notActiveModel: string,
  boxIds: number[],
  elements: Element[]
}

const editor: Module<EditorState, any> = {
  state: {
    multiply: false,
    model: MODEL.NONE,
    notActiveModel: MODEL.NONE,
    boxIds: [],
    elements: []
  },
  getters: {
    selectedBoxes (state): Vue[] {
      return state.boxIds.length ? boxes : []
    },
    getElementCount (state): number {
      return state.elements.length
    }
  },
  mutations: {
    // model: move, resize, select, multiply, null=''
    [TYPE.CHANGE_MODEL] (state: EditorState, model: string) {
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
    [MODEL.MULTIPLY] (state: EditorState, box: any) {
      if (!state.boxIds.includes(box.boxId)) {
        boxes.push(box)
        state.boxIds.push(box.boxId)
      }
    },
    [MODEL.SELECT] (state: EditorState, box: any) {
      boxes = [box]
      state.boxIds = [box.boxId]
    },
    [MODEL.CANCEL] (state: EditorState, box: any) {
      boxes = boxes.filter(select => select !== box)
      state.boxIds = boxes.map(select => select.boxId)
    },
    [MODEL.CLEAR] (state: EditorState) {
      boxes = []
      state.boxIds = []
    },
    [TYPE.ADD_ELE] (state: EditorState, ele: Element) {
      state.elements.push(ele)
    }
  },
  actions: {
    selectBox ({ commit, state }, box: any) {
      if (box) {
        if (state.multiply && state.boxIds.includes(box.boxId)) {
          commit(MODEL.CANCEL, box)
        } else {
          commit(state.multiply ? MODEL.MULTIPLY : MODEL.SELECT, box)
        }
      } else {
        commit(MODEL.CLEAR)
      }
    }
  }
}

export default editor
