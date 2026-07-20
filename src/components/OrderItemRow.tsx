import type { OrderItem } from '../types'
import { formatCurrency } from '../utils/currency'

interface OrderItemRowProps {
  item: OrderItem
  onIncrease: (itemId: string) => void
  onDecrease: (itemId: string) => void
  onRemove: (itemId: string) => void
}

export function OrderItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: OrderItemRowProps) {
  const lineTotalCents = item.quantity * item.unitPriceCents

  return (
    <article className="order-item">
      <div className="order-item-head">
        <p className="order-item-name">
          {item.quantity}x {item.name}
        </p>
        <p className="order-item-line-total">{formatCurrency(lineTotalCents)}</p>
      </div>
      <p className="order-item-price">Einzelpreis: {formatCurrency(item.unitPriceCents)}</p>
      <div className="order-item-actions" aria-label={`Menge fuer ${item.name} verwalten`}>
        <button type="button" onClick={() => onDecrease(item.id)} aria-label="Menge reduzieren">
          -
        </button>
        <button type="button" onClick={() => onIncrease(item.id)} aria-label="Menge erhoehen">
          +
        </button>
        <button type="button" onClick={() => onRemove(item.id)} aria-label="Position entfernen">
          Entfernen
        </button>
      </div>
    </article>
  )
}
