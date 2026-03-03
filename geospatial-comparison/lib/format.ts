export function formatLoadTime(seconds: number): string {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60);
    const sec = Math.round(seconds % 60);
    return sec > 0 ? `${min} นาที ${sec} วินาที` : `${min} นาที`;
  }
  return `${seconds.toFixed(1)} วินาที`;
}

export function formatNumber(
  value: number,
  decimals: number,
  unit: string
): string {
  const formatted =
    value >= 1000
      ? value.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : value.toFixed(decimals);
  return `${formatted} ${unit}`;
}
