import type { Product } from '../types'
import { PRODUCTS } from '../data/products'
import { supabase } from '../lib/supabase'

interface ProductRecord {
  id: string
  name: string
  price_cents: number
  category: Product['category']
  image_path: string
}

function mapRecordToProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    name: record.name,
    priceCents: record.price_cents,
    category: record.category,
    imagePath: record.image_path,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) {
    return PRODUCTS
  }

  const { data, error } = await supabase
    .from('products')
    .select('id,name,price_cents,category,image_path')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    return PRODUCTS
  }

  return data.map(mapRecordToProduct)
}

export interface ProductMutationInput {
  id: string
  name: string
  priceCents: number
  category: Product['category']
  imagePath: string
}

export async function upsertProduct(input: ProductMutationInput): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase ist nicht konfiguriert.')
  }

  const { error } = await supabase.from('products').upsert(
    {
      id: input.id,
      name: input.name,
      price_cents: input.priceCents,
      category: input.category,
      image_path: input.imagePath,
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase ist nicht konfiguriert.')
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    throw error
  }
}
