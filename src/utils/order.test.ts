import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../data/products'
import {
  addOrMergeOrderItem,
  decreaseOrderItem,
  getOrderTotalCents,
  summarizePayment,
} from './order'

const kaesekrainer = PRODUCTS.find((entry) => entry.id === 'kaesekrainer')
const cola = PRODUCTS.find((entry) => entry.id === 'cola')

if (!kaesekrainer || !cola) {
  throw new Error('Test products not found')
}

describe('order math', () => {
  it('calculates total sum from quantities in cents', () => {
    let items = addOrMergeOrderItem([], cola)
    items = addOrMergeOrderItem(items, cola)
    items = addOrMergeOrderItem(items, kaesekrainer)

    expect(getOrderTotalCents(items)).toBe(1400)
  })

  it('decreases quantity and removes row at zero', () => {
    let items = addOrMergeOrderItem([], cola)
    items = addOrMergeOrderItem(items, cola)

    const itemId = items[0].id
    const onceDecreased = decreaseOrderItem(items, itemId)
    expect(onceDecreased[0].quantity).toBe(1)

    const removed = decreaseOrderItem(onceDecreased, itemId)
    expect(removed).toHaveLength(0)
  })

  it('merges same product into one position', () => {
    let items = addOrMergeOrderItem([], kaesekrainer)
    items = addOrMergeOrderItem(items, kaesekrainer)

    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })
})

describe('payment summary', () => {
  it('returns change when paid enough', () => {
    expect(summarizePayment(2650, 5000, true)).toEqual({
      status: 'enough',
      changeCents: 2350,
    })
  })

  it('returns missing amount when payment too low', () => {
    expect(summarizePayment(2650, 2000, true)).toEqual({
      status: 'insufficient',
      missingCents: 650,
    })
  })

  it('never returns negative change', () => {
    const summary = summarizePayment(1200, 1000, true)
    expect(summary.status).toBe('insufficient')
  })
})
