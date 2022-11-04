import { Reducer } from 'redux'
import produce from 'immer'

export type State = {
  filterValue: string
}

const initialState: State = {
  filterValue: '',
}

export type Action = {
  type: ''
}

export const reducer: Reducer<
  State,
  Action
> = produce((draft: State, action: Action) => {}, initialState)