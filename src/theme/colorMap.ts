/**
 * Color Mapping Utility
 * Maps Tailwind color classes to dynamic CSS variables
 * This allows components to use dynamic theme colors instead of hardcoded colors
 */

export type TailwindColorClass = string;
export type CSSColorVariable = string;

/**
 * Maps common Tailwind color classes to CSS variables
 * Usage:
 *   const cssVar = getTailwindColorVariable('maroon-700');
 *   // Returns: 'var(--color-primary-800)'
 * 
 *   Or use directly in className:
 *   className={`${getTailwindColorVariable('maroon-700') ? 'text-[color:var(--color-primary-800)]' : ''}`}
 */
export const tailwindToCSSVarMap: Record<string, string> = {
  // Maroon colors (Primary)
  'maroon-50': 'var(--color-primary-50)',
  'maroon-100': 'var(--color-primary-100)',
  'maroon-200': 'var(--color-primary-200)',
  'maroon-300': 'var(--color-primary-300)',
  'maroon-400': 'var(--color-primary-400)',
  'maroon-500': 'var(--color-primary-500)',
  'maroon-600': 'var(--color-primary-600)',
  'maroon-700': 'var(--color-primary-800)', // Most used dark
  'maroon-800': 'var(--color-primary-800)',
  'maroon-900': 'var(--color-primary-900)',

  // Gold/Amber colors (Accent)
  'gold-50': 'var(--color-accent-50)',
  'gold-100': 'var(--color-accent-100)',
  'gold-200': 'var(--color-accent-200)',
  'gold-300': 'var(--color-accent-300)',
  'gold-400': 'var(--color-accent-400)',
  'gold-500': 'var(--color-accent-500)',
  'gold-600': 'var(--color-accent-600)',
  'amber-50': 'var(--color-accent-50)',
  'amber-100': 'var(--color-accent-100)',
  'amber-500': 'var(--color-accent-500)',
  'amber-600': 'var(--color-accent-600)',

  // Status colors
  'green-50': 'var(--color-success-light)',
  'green-100': 'var(--color-success-light)',
  'green-500': 'var(--color-success-main)',
  'green-600': 'var(--color-success-main)',
  'red-50': 'var(--color-error-light)',
  'red-100': 'var(--color-error-light)',
  'red-500': 'var(--color-error-main)',
  'red-600': 'var(--color-error-dark)',
  'blue-50': 'var(--color-info-light)',
  'blue-100': 'var(--color-info-light)',
  'blue-500': 'var(--color-info-main)',
  'blue-600': 'var(--color-info-main)',

  // Gray colors (Backgrounds, borders, text)
  'gray-50': 'var(--color-background-secondary)',
  'gray-100': 'var(--color-background-tertiary)',
  'gray-200': 'var(--color-border-light)',
  'gray-300': 'var(--color-border-default)',
  'gray-400': 'var(--color-border-medium)',
  'gray-500': 'var(--color-text-light)',
  'gray-600': 'var(--color-text-secondary)',
  'gray-700': 'var(--color-text-primary)',
  'gray-800': 'var(--color-text-primary)',
  'gray-900': 'var(--color-text-primary)',

  // White/Black
  'white': 'var(--color-background-primary)',
  'black': 'var(--color-text-primary)',
};

/**
 * Get the CSS variable for a Tailwind color
 * @example
 *   getCSSVariable('bg-maroon-700') // 'var(--color-primary-800)'
 *   getCSSVariable('text-maroon-800') // 'var(--color-primary-800)'
 *   getCSSVariable('border-gray-300') // 'var(--color-border-default)'
 */
export function getTailwindColorVariable(
  tailwindClass: string
): string {
  // Extract color from format like "bg-maroon-700" or "maroon-700"
  const colorPart = tailwindClass.replace(/^(bg|text|border|from|to)-/, '');
  return tailwindToCSSVarMap[colorPart] || 'unset';
}

/**
 * Convert a style object with Tailwind colors to CSS variables
 * @example
 *   convertToStyleObject({
 *     backgroundColor: 'maroon-700',
 *     color: 'white'
 *   })
 *   // Returns: {
 *   //   backgroundColor: 'var(--color-primary-800)',
 *   //   color: 'var(--color-background-primary)'
 *   // }
 */
export function convertToStyleObject(
  tailwindColorMap: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(tailwindColorMap)) {
    result[key] = getTailwindColorVariable(value);
  }
  return result;
}

/**
 * Helper for inline styles - converts Tailwind colors to CSS variables
 * @example
 *   <div style={useDynamicColor({
 *     backgroundColor: 'maroon-700',
 *     color: 'white'
 *   })}>
 *     Content
 *   </div>
 */
export const useDynamicColor = convertToStyleObject;

/**
 * Map of all color keys to their CSS variable names for easy lookup
 */
export const colorKeyToCSSVar: Record<string, string> = {
  // Primary colors
  'primary-50': 'var(--color-primary-50)',
  'primary-100': 'var(--color-primary-100)',
  'primary-200': 'var(--color-primary-200)',
  'primary-300': 'var(--color-primary-300)',
  'primary-400': 'var(--color-primary-400)',
  'primary-500': 'var(--color-primary-500)',
  'primary-600': 'var(--color-primary-600)',
  'primary-700': 'var(--color-primary-700)',
  'primary-800': 'var(--color-primary-800)',
  'primary-900': 'var(--color-primary-900)',

  // Button colors
  'button-primary-bg': 'var(--color-button-primary-bg)',
  'button-primary-bg-hover': 'var(--color-button-primary-bg-hover)',
  'button-primary-text': 'var(--color-button-primary-text)',
  'button-secondary-bg': 'var(--color-button-secondary-bg)',
  'button-secondary-bg-hover': 'var(--color-button-secondary-bg-hover)',
  'button-secondary-text': 'var(--color-button-secondary-text)',
  'button-success-bg': 'var(--color-button-success-bg)',
  'button-success-hover': 'var(--color-button-success-hover)',
  'button-danger-bg': 'var(--color-button-danger-bg)',
  'button-danger-hover': 'var(--color-button-danger-hover)',
  'button-warning-bg': 'var(--color-button-warning-bg)',
  'button-warning-hover': 'var(--color-button-warning-hover)',

  // Text colors
  'text-primary': 'var(--color-text-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  'text-tertiary': 'var(--color-text-tertiary)',
  'text-light': 'var(--color-text-light)',
  'text-inverse': 'var(--color-text-inverse)',
  'text-muted': 'var(--color-text-muted)',

  // Background colors
  'background-primary': 'var(--color-background-primary)',
  'background-secondary': 'var(--color-background-secondary)',
  'background-tertiary': 'var(--color-background-tertiary)',
  'background-subtle': 'var(--color-background-subtle)',
  'background-dark': 'var(--color-background-dark)',

  // Border colors
  'border-light': 'var(--color-border-light)',
  'border-default': 'var(--color-border-default)',
  'border-medium': 'var(--color-border-medium)',
  'border-dark': 'var(--color-border-dark)',
  'border-primary': 'var(--color-border-primary)',
  'border-accent': 'var(--color-border-accent)',

  // Status colors
  'success-light': 'var(--color-success-light)',
  'success-main': 'var(--color-success-main)',
  'success-dark': 'var(--color-success-dark)',
  'warning-light': 'var(--color-warning-light)',
  'warning-main': 'var(--color-warning-main)',
  'warning-dark': 'var(--color-warning-dark)',
  'error-light': 'var(--color-error-light)',
  'error-main': 'var(--color-error-main)',
  'error-dark': 'var(--color-error-dark)',
  'info-light': 'var(--color-info-light)',
  'info-main': 'var(--color-info-main)',
  'info-dark': 'var(--color-info-dark)',
};

/**
 * Get CSS variable directly by color key
 * @example
 *   getCSSVariableByKey('button-primary-bg') // 'var(--color-button-primary-bg)'
 */
export function getCSSVariableByKey(colorKey: string): string {
  return colorKeyToCSSVar[colorKey] || `var(--color-${colorKey})`;
}
