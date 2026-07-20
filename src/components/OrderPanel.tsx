import type { OrderItem } from '../types'
import { formatCurrency } from '../utils/currency'
import { OrderItemRow } from './OrderItemRow'

interface OrderPanelProps {
  items: OrderItem[]
  totalCents: number
  onIncrease: (itemId: string) => void
  onDecrease: (itemId: string) => void
  onRemove: (itemId: string) => void
}

export function OrderPanel({
  items,
  totalCents,
  onIncrease,
  onDecrease,
  onRemove,
}: OrderPanelProps) {
  return (
    <section className="order-panel" aria-label="Aktuelle Bestellung">
      <h2>Aktuelle Bestellung</h2>
      {items.length === 0 ? (
        <p className="empty-order">Noch keine Produkte ausgewaehlt.</p>
      ) : (
        <div className="order-list">
          {items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
      <p className="order-total" aria-live="polite">
        Gesamt: {formatCurrency(totalCents)}
      </p>
    </section>
  )
}
