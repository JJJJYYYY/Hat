const UuidSet = new Set<string>()

export function getUuid (): string {
  let id = ''
  do {
    id = Math.random().toString(32).slice(2)
  } while (UuidSet.has(id))

  UuidSet.add(id)
  return id
}
