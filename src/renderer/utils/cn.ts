/**
 * Utility for merging class names
 * Similar to clsx but simpler
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}