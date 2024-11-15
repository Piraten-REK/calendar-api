export function mapGetOrSet <K, V> (map: Map<K, V>, key: K, setter: (() => V)): V {
  if (!map.has(key)) {
    const value = setter()

    map.set(key, value)
    return value
  }

  return map.get(key) as V
}
