/**
 * Dynamic Color Components and Hooks
 * 
 * Easy way to apply theme colors without manually writing CSS variables
 * Works seamlessly with Tailwind + dynamic theme system
 * 
 * Usage Examples:
 * 
 * 1. For backgrounds:
 *    <DynamicBg color="maroon-700" className="p-4 rounded">Content</DynamicBg>
 * 
 * 2. For text:
 *    <DynamicText color="maroon-800">Heading</DynamicText>
 * 
 * 3. For borders:
 *    <DynamicBorder color="gray-200" className="p-4">Content</DynamicBorder>
 * 
 * 4. For custom styling:
 *    <div style={getDynamicColorStyle('backgroundColor', 'maroon-700')}>Content</div>
 */

import { CSSProperties, ReactNode } from 'react';
import { useSiteSettings } from './siteSettings';

/**
 * Map of simple color names to theme color keys
 */
const colorAliasMap: Record<string, string> = {
  'maroon-700': 'primary-800',
  'maroon-800': 'primary-800',
  'maroon-900': 'primary-900',
  'gold-600': 'accent-600',
  'gold-500': 'accent-500',
  'amber-600': 'accent-600',
  'white': 'background-primary',
  'black': 'text-primary',
};

/**
 * Get the dynamic color value for a Tailwind-like color name
 */
export function getDynamicColorValue(colorName: string): string {
  const alias = colorAliasMap[colorName];
  if (alias) {
    return `var(--color-${alias})`;
  }
  // Try direct color key
  return `var(--color-${colorName})`;
}

/**
 * Create a style object for a CSS property with dynamic color
 * @example
 *   getDynamicColorStyle('backgroundColor', 'maroon-700')
 *   // Returns: { backgroundColor: 'var(--color-primary-800)' }
 */
export function getDynamicColorStyle(
  cssProperty: string,
  colorName: string
): CSSProperties {
  return {
    [cssProperty]: getDynamicColorValue(colorName),
  } as CSSProperties;
}

/**
 * Component: Apply dynamic background color easily
 * @example
 *   <DynamicBg color="maroon-700" className="p-4">Content</DynamicBg>
 */
export function DynamicBg({
  color,
  className = '',
  children,
  ...props
}: {
  color: string;
  className?: string;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: getDynamicColorValue(color),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Component: Apply dynamic text color easily
 * @example
 *   <DynamicText color="maroon-800">Heading</DynamicText>
 */
export function DynamicText({
  color,
  className = '',
  children,
  ...props
}: {
  color: string;
  className?: string;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <span
      className={className}
      style={{
        color: getDynamicColorValue(color),
      }}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Component: Apply dynamic border color easily
 * @example
 *   <DynamicBorder color="gray-200" className="p-4">Content</DynamicBorder>
 */
export function DynamicBorder({
  color,
  className = '',
  children,
  side = 'all',
  width = '1px',
  ...props
}: {
  color: string;
  className?: string;
  children: ReactNode;
  side?: 'all' | 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  [key: string]: any;
}) {
  const colorValue = getDynamicColorValue(color);
  const borderStyle = `${width} solid ${colorValue}`;

  const borderProps =
    side === 'all'
      ? { borderWidth: '1px', borderColor: colorValue }
      : {
          [`border${side.charAt(0).toUpperCase()}${side.slice(1)}`]: borderStyle,
        };

  return (
    <div
      className={className}
      style={borderProps}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Hook: Use dynamic color values in your components
 * @example
 *   const DynamicButton = () => {
 *     const { getColor } = useSiteSettings();
 *     return (
 *       <button style={{
 *         backgroundColor: getColor('button-primary-bg'),
 *         color: getColor('button-primary-text'),
 *         padding: '10px 20px',
 *         border: 'none',
 *         borderRadius: '4px',
 *         cursor: 'pointer',
 *       }}>
 *         Click Me
 *       </button>
 *     );
 *   };
 */
export function useDynamicColor(colorName: string): string {
  return getDynamicColorValue(colorName);
}

/**
 * Component: Dynamic button with theme colors
 * @example
 *   <DynamicButton variant="primary">Click Me</DynamicButton>
 *   <DynamicButton variant="secondary">Click Me</DynamicButton>
 */
export function DynamicButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const colorMap: Record<string, { bg: string; text: string; hover: string }> =
    {
      primary: {
        bg: 'button-primary-bg',
        text: 'button-primary-text',
        hover: 'button-primary-bg-hover',
      },
      secondary: {
        bg: 'button-secondary-bg',
        text: 'button-secondary-text',
        hover: 'button-secondary-bg-hover',
      },
      success: {
        bg: 'button-success-bg',
        text: 'text-inverse',
        hover: 'button-success-hover',
      },
      danger: {
        bg: 'button-danger-bg',
        text: 'text-inverse',
        hover: 'button-danger-hover',
      },
      outline: {
        bg: 'background-primary',
        text: 'text-primary',
        hover: 'background-secondary',
      },
    };

  const colors = colorMap[variant];

  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors ${className}`}
      style={{
        backgroundColor: `var(--color-${colors.bg})`,
        color: `var(--color-${colors.text})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `var(--color-${colors.hover})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `var(--color-${colors.bg})`;
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Utility: Apply dynamic color to any element
 * Best for one-off color overrides
 * @example
 *   <h1 style={applyDynamicColor('h1', 'maroon-800')}>Heading</h1>
 */
export function applyDynamicColor(
  elementType: string,
  colorName: string,
  cssProperty: 'color' | 'backgroundColor' | 'borderColor' = 'color'
): CSSProperties {
  return {
    [cssProperty]: getDynamicColorValue(colorName),
  } as CSSProperties;
}
