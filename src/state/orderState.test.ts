import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../data/products'
import { initialOrderState, orderReducer } from './orderState'

const cola = PRODUCTS.find((entry) => entry.id === 'cola')

if (!cola) {
  throw new Error('cola product not found')
}

describe('order reducer', () => {
  it('resets complete order state', () => {
    let state = orderReducer(initialOrderState, {
      type: 'ADD_PRODUCT',
      product: cola,
    })

    state = orderReducer(state, {
      type: 'SET_GIVEN_AMOUNT',
      value: '20,00',
    })

    const resetState = orderReducer(state, { type: 'RESET_ORDER' })

    expect(resetState.items).toEqual([])
    expect(resetState.givenAmountInput).toBe('')
  })
})
