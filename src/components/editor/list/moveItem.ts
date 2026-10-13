/** Devuelve una copia con el elemento `id` desplazado una posición; sin cambios si llega a un extremo. */
export function moveItem<T extends { id: number }>(items: T[], id: number, direction: -1 | 1): T[] {
  const index = items.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
