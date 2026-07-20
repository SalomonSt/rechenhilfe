import type { OrderItem, Product } from '../types'
import {
  addOrMergeOrderItem,
  decreaseOrderItem,
  increaseOrderItem,
  removeOrderItem,
} from '../utils/order'

export interface OrderState {
  items: OrderItem[]
  givenAmountInput: string
}

export const initialOrderState: OrderState = {
  items: [],
  givenAmountInput: '',
}

type OrderAction =
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'INCREASE_ITEM'; itemId: string }
  | { type: 'DECREASE_ITEM'; itemId: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'SET_GIVEN_AMOUNT'; value: string }
  | { type: 'RESET_ORDER' }

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return {
        ...state,
        items: addOrMergeOrderItem(state.items, action.product),
      }
    case 'INCREASE_ITEM':
      return {
        ...state,
        items: increaseOrderItem(state.items, action.itemId),
      }
    case 'DECREASE_ITEM':
      return {
        ...state,
        items: decreaseOrderItem(state.items, action.itemId),
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: removeOrderItem(state.items, action.itemId),
      }
    case 'SET_GIVEN_AMOUNT':
      return {
        ...state,
        givenAmountInput: action.value,
      }
    case 'RESET_ORDER':
      return initialOrderState
    default:
      return state
  }
}
