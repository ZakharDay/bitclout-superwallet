function isAN(value) {
  if (value instanceof Number) value = value.valueOf()
  return isFinite(value) && value === parseInt(value, 10)
}

export { isAN }
