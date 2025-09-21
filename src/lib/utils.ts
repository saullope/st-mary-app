/**
 * Combina clases CSS de manera condicional
 * Similar a clsx pero más simple
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Genera clases CSS responsivas
 */
export function responsive(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}): string {
  const result: string[] = [];
  
  if (classes.base) result.push(classes.base);
  if (classes.sm) result.push(`sm:${classes.sm}`);
  if (classes.md) result.push(`md:${classes.md}`);
  if (classes.lg) result.push(`lg:${classes.lg}`);
  if (classes.xl) result.push(`xl:${classes.xl}`);
  
  return result.join(' ');
}

/**
 * Genera variantes de componentes
 */
export function variants<T extends Record<string, string>>(
  base: string,
  variants: T,
  selected?: keyof T
): string {
  const classes = [base];
  if (selected && variants[selected]) {
    classes.push(variants[selected]);
  }
  return classes.join(' ');
}
