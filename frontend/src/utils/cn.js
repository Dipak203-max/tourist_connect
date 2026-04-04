import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes with support for conditional logic.
 * Uses clsx for conditional mapping and tailwind-merge to resolve conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
