export const getBackgroundValueForIndex = <T>(
  values: T[],
  index: number
): T => {
  return 0
  const value = values[index]
  if (typeof value === 'undefined') {
    return values[0]
  }

  return value
}
