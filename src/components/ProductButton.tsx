import type { Product } from '../types'
import { formatCurrency } from '../utils/currency'

interface ProductButtonProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductButton({ product, onSelect }: ProductButtonProps) {
  return (
    <button
      type="button"
      className="product-button"
      aria-label={`${product.name} fuer ${formatCurrency(product.priceCents)} auswaehlen`}
      onClick={() => onSelect(product)}
    >
      <div className="product-top-row">
        <img
          className="product-image"
          src={product.imagePath}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <span className="product-name">{product.name}</span>
      </div>
      <span className="product-price">{formatCurrency(product.priceCents)}</span>
    </button>
  )
}
