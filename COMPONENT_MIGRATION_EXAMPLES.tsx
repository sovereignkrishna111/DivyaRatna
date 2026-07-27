/**
 * EXAMPLE: How to Migrate Components to Use Dynamic Theme Colors
 * 
 * This file shows the pattern for updating any component to use
 * the new dynamic theme system instead of hardcoded colors.
 */

// ============================================================================
// EXAMPLE 1: Simple Button Component
// ============================================================================

// BEFORE (Hardcoded)
export function OldButton() {
  return (
    <button className="bg-maroon-700 hover:bg-maroon-800 text-white px-4 py-2 rounded">
      Click Me
    </button>
  );
}

// AFTER (Dynamic - Using CSS Variables)
export function NewButton() {
  return (
    <button 
      style={{
        backgroundColor: 'var(--color-button-primary-bg)',
        color: 'var(--color-button-primary-text)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg)'}
      className="px-4 py-2 rounded transition-colors cursor-pointer"
    >
      Click Me
    </button>
  );
}

// ============================================================================
// EXAMPLE 2: Using React Hook (For Complex Logic)
// ============================================================================

import { useSiteSettings } from '../theme/siteSettings';

export function SmartButton() {
  const { getColor } = useSiteSettings();
  
  return (
    <button 
      style={{
        backgroundColor: getColor('button-primary-bg'),
        color: getColor('button-primary-text'),
      }}
      className="px-4 py-2 rounded hover:opacity-90 transition-all"
    >
      Click Me
    </button>
  );
}

// ============================================================================
// EXAMPLE 3: Heading with Dynamic Colors
// ============================================================================

// BEFORE (Hardcoded)
export function OldHeading() {
  return (
    <h1 className="text-4xl font-bold text-maroon-800">Welcome</h1>
  );
}

// AFTER (Dynamic)
export function NewHeading() {
  return (
    <h1 
      style={{
        fontSize: '2.25rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
      }}
    >
      Welcome
    </h1>
  );
}

// ============================================================================
// EXAMPLE 4: Card with Dynamic Border and Background
// ============================================================================

// BEFORE (Hardcoded)
export function OldCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-maroon-800">Card Title</h2>
      <p className="text-gray-600">Card content here</p>
    </div>
  );
}

// AFTER (Dynamic)
export function NewCard() {
  return (
    <div 
      style={{
        backgroundColor: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
      }}
    >
      <h2 
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: 'var(--color-text-primary)',
        }}
      >
        Card Title
      </h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Card content here
      </p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Navigation Bar with Multiple Color States
// ============================================================================

// BEFORE (Hardcoded)
export function OldNavBar() {
  const items = ['Home', 'About', 'Services', 'Contact'];
  
  return (
    <nav className="bg-maroon-800 text-white px-6 py-4">
      <div className="flex gap-4">
        {items.map(item => (
          <a 
            key={item}
            href={`/${item.toLowerCase()}`}
            className="text-white hover:text-maroon-100 transition-colors"
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}

// AFTER (Dynamic)
export function NewNavBar() {
  const items = ['Home', 'About', 'Services', 'Contact'];
  
  return (
    <nav 
      style={{
        backgroundColor: 'var(--color-primary-800)',
        color: 'var(--color-text-inverse)',
        padding: '1rem 1.5rem',
      }}
    >
      <div className="flex gap-4">
        {items.map(item => (
          <a 
            key={item}
            href={`/${item.toLowerCase()}`}
            style={{
              color: 'var(--color-text-inverse)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-100)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-inverse)'}
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ============================================================================
// EXAMPLE 6: Status Messages (Success, Error, Warning)
// ============================================================================

import React from 'react';

export function OldStatusMessage({ type, message }) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };
  
  return (
    <div className={`${styles[type]} border rounded-lg p-4`}>
      {message}
    </div>
  );
}

export function NewStatusMessage({ type, message }) {
  const colorMap = {
    success: {
      bg: 'var(--color-success-light)',
      text: 'var(--color-success-dark)',
      border: 'var(--color-success-main)',
    },
    error: {
      bg: 'var(--color-error-light)',
      text: 'var(--color-error-dark)',
      border: 'var(--color-error-main)',
    },
    warning: {
      bg: 'var(--color-warning-light)',
      text: 'var(--color-warning-dark)',
      border: 'var(--color-warning-main)',
    },
  };
  
  const colors = colorMap[type] || colorMap.success;
  
  return (
    <div 
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
      }}
    >
      {message}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Using CSS Variables in Gradients
// ============================================================================

export function GradientSection() {
  return (
    <section 
      style={{
        background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%)',
        color: 'var(--color-text-inverse)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Featured Section
      </h2>
      <p>
        This section uses dynamic gradient colors that can be changed from the admin panel!
      </p>
    </section>
  );
}

// ============================================================================
// EXAMPLE 8: Using CSS Class Method
// ============================================================================

/**
 * If you prefer using CSS classes, create them in your CSS file:
 * 
 * .btn-primary {
 *   background-color: var(--color-button-primary-bg);
 *   color: var(--color-button-primary-text);
 *   padding: 0.5rem 1rem;
 *   border-radius: 0.25rem;
 *   border: none;
 *   cursor: pointer;
 *   transition: background-color 0.2s;
 * }
 * 
 * .btn-primary:hover {
 *   background-color: var(--color-button-primary-bg-hover);
 * }
 * 
 * .btn-secondary {
 *   background-color: var(--color-button-secondary-bg);
 *   color: var(--color-button-secondary-text);
 * }
 * 
 * .btn-secondary:hover {
 *   background-color: var(--color-button-secondary-bg-hover);
 * }
 */

export function ButtonWithClass() {
  return (
    <button className="btn-primary">
      Click Me
    </button>
  );
}

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/**
 * When updating a component, follow these steps:
 * 
 * 1. ✓ Find all hardcoded color classes:
 *    - bg-maroon-*, text-maroon-*, border-maroon-*
 *    - Any inline style colors
 * 
 * 2. ✓ Map to new color keys:
 *    - Maroon buttons → button-primary-bg
 *    - Maroon text → text-primary
 *    - Gold accents → accent-500
 * 
 * 3. ✓ Replace with CSS variables:
 *    - style={{ backgroundColor: 'var(--color-button-primary-bg)' }}
 *    - Or use useSiteSettings hook for complex logic
 * 
 * 4. ✓ Test in admin panel:
 *    - Change colors and verify update
 *    - Check hover states work
 *    - Ensure no visual regressions
 * 
 * 5. ✓ Clean up old classes:
 *    - Remove unused Tailwind color classes
 *    - Remove hardcoded style props
 */

// ============================================================================
// QUICK REFERENCE: Color Mapping
// ============================================================================

/**
 * OLD TAILWIND → NEW VARIABLE MAPPING:
 * 
 * BUTTONS:
 *   bg-maroon-700              → var(--color-button-primary-bg)
 *   hover:bg-maroon-800        → var(--color-button-primary-bg-hover)
 *   text-white (on maroon)     → var(--color-button-primary-text)
 *   bg-amber-500               → var(--color-accent-500)
 * 
 * TEXT:
 *   text-maroon-800            → var(--color-text-primary)
 *   text-gray-600              → var(--color-text-secondary)
 *   text-gray-500              → var(--color-text-tertiary)
 *   text-gray-400              → var(--color-text-light)
 *   text-white                 → var(--color-text-inverse)
 * 
 * BACKGROUNDS:
 *   bg-white                   → var(--color-background-primary)
 *   bg-gray-50                 → var(--color-background-secondary)
 *   bg-gray-100                → var(--color-background-tertiary)
 * 
 * BORDERS:
 *   border-gray-200            → var(--color-border-default)
 *   border-gray-300            → var(--color-border-medium)
 *   border-maroon-700          → var(--color-border-primary)
 * 
 * STATUS:
 *   bg-green-50                → var(--color-success-light)
 *   text-red-800               → var(--color-error-dark)
 *   bg-yellow-100              → var(--color-warning-light)
 */
