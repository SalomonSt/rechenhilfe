const euroFormatter = new Intl.NumberFormat('de-AT', {
  style: 'currency',
  currency: 'EUR',
})

export function formatCurrency(cents: number): string {
  return euroFormatter.format(cents / 100)
}

export function parseCurrencyInputToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.')

  if (!normalized) {
    return null
  }

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null
  }

  const parsed = Number(normalized)
  if (Number.isNaN(parsed) || parsed < 0) {
    return null
  }

  return Math.round(parsed * 100)
}
