const taka = new Intl.NumberFormat('en-BD');

export function formatTaka(amount: number) {
  return `৳${taka.format(amount)}`;
}
