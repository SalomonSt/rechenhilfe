import { formatCurrency } from '../utils/currency'
import type { PaymentSummary } from '../utils/order'

interface PaymentPanelProps {
  totalCents: number
  hasItems: boolean
  givenAmountInput: string
  paymentSummary: PaymentSummary
  onGivenAmountChange: (value: string) => void
  onQuickSelect: (valueCents: number) => void
  onSelectExact: () => void
}

const QUICK_VALUES = [500, 1000, 2000, 5000, 10000]

export function PaymentPanel({
  totalCents,
  hasItems,
  givenAmountInput,
  paymentSummary,
  onGivenAmountChange,
  onQuickSelect,
  onSelectExact,
}: PaymentPanelProps) {
  return (
    <section className="payment-panel" aria-label="Barzahlung">
      <h2>Barzahlung</h2>
      <label htmlFor="given-amount">Gegeben</label>
      <input
        id="given-amount"
        type="text"
        inputMode="decimal"
        pattern="[0-9]+([\\.,][0-9]{0,2})?"
        placeholder="z. B. 20,50"
        value={givenAmountInput}
        disabled={!hasItems}
        onChange={(event) => onGivenAmountChange(event.target.value)}
      />

      <div className="quick-select-grid" aria-label="Schnellwahl Betraege">
        <button type="button" onClick={onSelectExact} disabled={!hasItems}>
          Passend
        </button>
        {QUICK_VALUES.map((value) => {
          const isEnabled = hasItems && value >= totalCents
          return (
            <button
              key={value}
              type="button"
              disabled={!isEnabled}
              onClick={() => onQuickSelect(value)}
            >
              {formatCurrency(value)}
            </button>
          )
        })}
      </div>

      <div className="payment-result" aria-live="polite">
        {!hasItems && <p className="muted">Wechselgeldbereich ist deaktiviert.</p>}
        {hasItems && paymentSummary.status === 'empty' && (
          <p className="muted">Betrag eingeben, um Wechselgeld zu berechnen.</p>
        )}
        {hasItems && paymentSummary.status === 'invalid' && (
          <p className="error">Ungueltiger Betrag. Bitte Betrag positiv eingeben.</p>
        )}
        {hasItems && paymentSummary.status === 'insufficient' && (
          <p className="error">Es fehlen noch {formatCurrency(paymentSummary.missingCents)}</p>
        )}
        {hasItems && paymentSummary.status === 'enough' && (
          <p className="change-highlight">Wechselgeld: {formatCurrency(paymentSummary.changeCents)}</p>
        )}
      </div>
    </section>
  )
}
