
const powerOf2 = (props, propName, componentName) => {
  const prop = props[propName]
  if (prop == null) return null
  return Math.sqrt(prop) % 1 === 0 ? null : new Error(`[PropTypes] Prop ${propName} must be a power of 2`)
}

powerOf2.isRequired = (props, propName, componentName) => {
  const prop = props[propName]
  return Math.sqrt(prop) % 1 === 0 ? null : new Error(`[PropTypes] Prop ${propName} must be a power of 2`)
}

export { powerOf2 }
