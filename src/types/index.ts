export type CategoryId =
  | 'essen'
  | 'alkoholfrei'
  | 'bier-spritzer'
  | 'longdrinks'

export interface Product {
  id: string
  name: string
  priceCents: number
  category: CategoryId
  imagePath: string
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  unitPriceCents: number
  quantity: number
}

export interface Category {
  id: CategoryId
  label: string
}
