export function formatCurrency(amount: number, currency = 'RON', symbol = 'lei'): string {
  return (
    new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    ' ' +
    symbol
  );
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1).replace('.', ',') + 'k lei';
  }
  return formatCurrency(amount);
}
