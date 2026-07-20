import { useEffect, useMemo, useReducer, useState } from 'react'
import { AdminPanel } from './components/AdminPanel'
import { CategoryTabs } from './components/CategoryTabs'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Header } from './components/Header'
import { OrderPanel } from './components/OrderPanel'
import { PaymentPanel } from './components/PaymentPanel'
import { ProductGrid } from './components/ProductGrid'
import { CATEGORIES } from './data/products'
import { fetchProducts } from './services/productStore'
import { initialOrderState, orderReducer } from './state/orderState'
import type { CategoryId, Product } from './types'
import { parseCurrencyInputToCents } from './utils/currency'
import { getOrderTotalCents, summarizePayment } from './utils/order'

function formatInputFromCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function App() {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState)
  const [screenMode, setScreenMode] = useState<'pos' | 'admin'>('pos')
  const [activeCategory, setActiveCategory] = useState<CategoryId>('essen')
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [completionMessage, setCompletionMessage] = useState('')

  const loadProducts = async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch {
      setProductsError('Produkte konnten nicht geladen werden.')
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const filteredProducts = useMemo(
    () => products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  )

  const totalCents = useMemo(() => getOrderTotalCents(state.items), [state.items])
  const givenCents = useMemo(
    () => parseCurrencyInputToCents(state.givenAmountInput),
    [state.givenAmountInput],
  )
  const paymentSummary = useMemo(
    () => summarizePayment(totalCents, givenCents, state.givenAmountInput.trim().length > 0),
    [givenCents, state.givenAmountInput, totalCents],
  )

  const canCompleteOrder = state.items.length > 0 && paymentSummary.status === 'enough'

  const addProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', product })
  }

  const handleSelectProduct = (product: Product) => {
    addProduct(product)
  }

  const resetOrder = () => {
    setShowDeleteConfirm(false)
    dispatch({ type: 'RESET_ORDER' })
  }

  const finishOrder = () => {
    if (!canCompleteOrder) {
      return
    }

    setCompletionMessage('Bestellung abgeschlossen')
    window.setTimeout(() => {
      resetOrder()
      setCompletionMessage('')
    }, 900)
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="mode-switch" role="tablist" aria-label="Ansicht wechseln">
        <button
          type="button"
          role="tab"
          aria-selected={screenMode === 'pos'}
          className={screenMode === 'pos' ? 'category-tab is-active' : 'category-tab'}
          onClick={() => setScreenMode('pos')}
        >
          Kasse
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={screenMode === 'admin'}
          className={screenMode === 'admin' ? 'category-tab is-active' : 'category-tab'}
          onClick={() => setScreenMode('admin')}
        >
          Admin
        </button>
      </div>

      {completionMessage && (
        <p className="completion-banner" role="status" aria-live="polite">
          {completionMessage}
        </p>
      )}

      {screenMode === 'admin' && (
        <AdminPanel products={products} onProductsChanged={loadProducts} />
      )}

      {screenMode === 'pos' && (
        <main className="layout">
        <section className="products-column" aria-label="Produkte auswählen">
          <CategoryTabs
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          {productsLoading && <p className="muted">Produkte werden geladen...</p>}
          {productsError && <p className="error">{productsError}</p>}
          <ProductGrid products={filteredProducts} onProductSelect={handleSelectProduct} />
        </section>

        <section className="order-column">
          <div className="sticky-wrap">
            <OrderPanel
              items={state.items}
              totalCents={totalCents}
              onIncrease={(itemId) => dispatch({ type: 'INCREASE_ITEM', itemId })}
              onDecrease={(itemId) => dispatch({ type: 'DECREASE_ITEM', itemId })}
              onRemove={(itemId) => dispatch({ type: 'REMOVE_ITEM', itemId })}
            />

            <PaymentPanel
              totalCents={totalCents}
              hasItems={state.items.length > 0}
              givenAmountInput={state.givenAmountInput}
              paymentSummary={paymentSummary}
              onGivenAmountChange={(value) => dispatch({ type: 'SET_GIVEN_AMOUNT', value })}
              onQuickSelect={(valueCents) =>
                dispatch({ type: 'SET_GIVEN_AMOUNT', value: formatInputFromCents(valueCents) })
              }
              onSelectExact={() =>
                dispatch({ type: 'SET_GIVEN_AMOUNT', value: formatInputFromCents(totalCents) })
              }
            />

            <div className="bottom-actions">
              <button
                type="button"
                className="danger-button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={state.items.length === 0}
              >
                Bestellung loeschen
              </button>
              <button
                type="button"
                className="primary-button finish-button"
                disabled={!canCompleteOrder}
                onClick={finishOrder}
              >
                Bestellung abschliessen
              </button>
            </div>
          </div>
        </section>
      </main>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Aktuelle Bestellung wirklich loeschen?"
          message="Alle Produkte, Mengen und Zahlungsangaben werden entfernt."
          confirmLabel="Bestellung loeschen"
          cancelLabel="Abbrechen"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={resetOrder}
        />
      )}
    </div>
  )
}

export default App
