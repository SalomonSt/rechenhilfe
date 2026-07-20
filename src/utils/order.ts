import type { OrderItem, Product } from '../types'

export function buildOrderItemId(productId: string): string {
  return productId
}

export function addOrMergeOrderItem(items: OrderItem[], product: Product): OrderItem[] {
  const id = buildOrderItemId(product.id)
  const existing = items.find((item) => item.id === id)

  if (existing) {
    return items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    )
  }

  return [
    ...items,
    {
      id,
      productId: product.id,
      name: product.name,
      unitPriceCents: product.priceCents,
      quantity: 1,
    },
  ]
}

export function increaseOrderItem(items: OrderItem[], itemId: string): OrderItem[] {
  return items.map((item) =>
    item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
  )
}

export function decreaseOrderItem(items: OrderItem[], itemId: string): OrderItem[] {
  return items
    .map((item) =>
      item.id === itemId ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item,
    )
    .filter((item) => item.quantity > 0)
}

export function removeOrderItem(items: OrderItem[], itemId: string): OrderItem[] {
  return items.filter((item) => item.id !== itemId)
}

export function getOrderTotalCents(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0)
}

export type PaymentSummary =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'insufficient'; missingCents: number }
  | { status: 'enough'; changeCents: number }

export function summarizePayment(
  totalCents: number,
  givenCents: number | null,
  hasInput: boolean,
): PaymentSummary {
  if (!hasInput) {
    return { status: 'empty' }
  }

  if (givenCents === null) {
    return { status: 'invalid' }
  }

  if (givenCents < totalCents) {
    return { status: 'insufficient', missingCents: totalCents - givenCents }
  }

  return { status: 'enough', changeCents: givenCents - totalCents }
}
