export const generateTicks = (min, max, tickCount) => {
  if (tickCount <= 1) {
    return [min]
  }

  if (tickCount === 2) {
    return [min, max]
  }

  const step = (max - min) / (tickCount - 1)
  const ticks = []

  for (let i = 0; i < tickCount; i++) {
    ticks.push(Math.floor(min + step * i))
  }

  // Ensure last tick is exactly max
  ticks[tickCount - 1] = max

  return ticks
}
