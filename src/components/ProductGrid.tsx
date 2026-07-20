import type { Product } from '../types'
import { ProductButton } from './ProductButton'

interface ProductGridProps {
  products: Product[]
  onProductSelect: (product: Product) => void
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  return (
    <section aria-label="Produkte" className="product-grid">
      {products.map((product) => (
        <ProductButton key={product.id} product={product} onSelect={onProductSelect} />
      ))}
    </section>
  )
}
