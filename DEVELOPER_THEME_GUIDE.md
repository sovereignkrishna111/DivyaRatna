# 🎨 Dynamic Theme System - Developer Guide

## Overview
Your website now has a **fully dynamic theme system**. All colors are managed through a centralized admin panel and applied instantly across the entire site. No more hardcoded colors!

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Admin Panel (Theme Manager)            │
│  - 70+ managed colors                   │
│  - Real-time updates                    │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Supabase    │
        │  Database    │
        │ (site_theme) │
        └──────┬───────┘
               │
               ▼
    ┌──────────────────────────┐
    │  SiteSettings Context    │
    │  - Fetches colors from DB│
    │  - Applies CSS variables │
    │  - Real-time subscriptions
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  CSS Variables in :root  │
    │  --color-primary-800, etc│
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Your Components         │
    │  Use: var(--color-...)   │
    └──────────────────────────┘
```

---

## How It Works

### 1. Database Schema
```sql
-- site_theme table
{
  id: 1,
  colors: {
    "primary-800": "#991b1b",
    "primary-900": "#7f1d1d",
    "button-primary-bg": "#991b1b",
    "accent-500": "#f59e0b",
    ... (70+ colors)
  },
  color_mode: 'light' | 'dark',
  updated_at: timestamp
}
```

### 2. Frontend System
- `src/theme/siteSettings.ts` - React Context that manages all colors
- `src/theme/colorMap.ts` - Maps Tailwind colors to CSS variables
- `src/theme/dynamicColors.tsx` - Helper components for easy color usage
- `src/index.css` - CSS variables definition (:root)

### 3. Real-time Updates
When you change a color in the admin panel:
1. Color is saved to database
2. Supabase triggers a "postgres_changes" event
3. React Context updates instantly
4. CSS variables are applied to :root
5. All components using those variables update automatically (no refresh needed!)

---

## Using Dynamic Colors in Components

### Method 1: CSS Variables (Recommended)
```tsx
// Simplest - use CSS variables directly
<button style={{ 
  backgroundColor: 'var(--color-button-primary-bg)',
  color: 'var(--color-button-primary-text)',
}}>
  Click Me
</button>
```

**Benefits:**
- ✅ Super simple
- ✅ No component imports needed
- ✅ Works with all HTML elements
- ✅ Best performance

### Method 2: Helper Functions
```tsx
import { getDynamicColorValue, getDynamicColorStyle } from '@/theme/colorMap';

// Get a single color value
const bgColor = getDynamicColorValue('maroon-700');
// Returns: 'var(--color-primary-800)'

// Create a style object
const styles = getDynamicColorStyle('backgroundColor', 'maroon-700');
// Returns: { backgroundColor: 'var(--color-primary-800)' }

<div style={styles}>Content</div>
```

### Method 3: Pre-built Components
```tsx
import { 
  DynamicBg, 
  DynamicText, 
  DynamicButton,
  DynamicBorder 
} from '@/theme/dynamicColors';

// Dynamic background
<DynamicBg color="maroon-700" className="p-4">
  Content with maroon background
</DynamicBg>

// Dynamic text
<DynamicText color="maroon-800">
  Dark maroon text
</DynamicText>

// Dynamic button
<DynamicButton variant="primary">
  Click Me
</DynamicButton>

// Dynamic border
<DynamicBorder color="gray-200" className="p-4">
  Content with border
</DynamicBorder>
```

### Method 4: useSiteSettings Hook
```tsx
import { useSiteSettings } from '@/theme/siteSettings';

export function MyComponent() {
  const { getColor } = useSiteSettings();
  
  return (
    <div style={{
      backgroundColor: getColor('background-primary'),
      color: getColor('text-primary'),
    }}>
      <h1>Hello</h1>
    </div>
  );
}
```

---

## Available Colors (Complete Reference)

### Primary Colors (Brand - Maroon)
```
--color-primary-50 through --color-primary-900
Most used: primary-800 (#991b1b)
```

### Secondary Colors
```
--color-secondary-50 through --color-secondary-900
```

### Accent Colors (Gold/Amber)
```
--color-accent-50 through --color-accent-900
Most used: accent-500 (#f59e0b)
```

### Backgrounds
```
--color-background-primary     (#ffffff)
--color-background-secondary   (#f9fafb)
--color-background-tertiary    (#f3f4f6)
--color-background-subtle      (#efefef)
--color-background-dark        (#1f2937)
```

### Text Colors
```
--color-text-primary      (#111827)
--color-text-secondary    (#374151)
--color-text-tertiary     (#6b7280)
--color-text-light        (#9ca3af)
--color-text-inverse      (#ffffff)
--color-text-muted        (#d1d5db)
```

### Button Colors
```
--color-button-primary-bg        (#991b1b)
--color-button-primary-bg-hover  (#7f1d1d)
--color-button-primary-text      (#ffffff)
--color-button-secondary-bg      (#7f1d1d)
--color-button-secondary-bg-hover (#6b1515)
--color-button-secondary-text    (#ffffff)
--color-button-success-bg        (#10b981)
--color-button-success-hover     (#059669)
--color-button-danger-bg         (#ef4444)
--color-button-danger-hover      (#dc2626)
--color-button-warning-bg        (#f59e0b)
--color-button-warning-hover     (#d97706)
```

### Border Colors
```
--color-border-light      (#f3f4f6)
--color-border-default    (#e5e7eb)
--color-border-medium     (#d1d5db)
--color-border-dark       (#9ca3af)
--color-border-primary    (#991b1b)
--color-border-accent     (#f59e0b)
```

### Status Colors
```
Success:
--color-success-light     (#d1fae5)
--color-success-main      (#10b981)
--color-success-dark      (#047857)

Warning:
--color-warning-light     (#fef3c7)
--color-warning-main      (#f59e0b)
--color-warning-dark      (#d97706)

Error:
--color-error-light       (#fee2e2)
--color-error-main        (#ef4444)
--color-error-dark        (#dc2626)

Info:
--color-info-light        (#dbeafe)
--color-info-main         (#3b82f6)
--color-info-dark         (#1d4ed8)
```

### Legacy Variables (backward compatible)
```
--brand            (main brand color)
--brand-2          (secondary brand color)
--accent           (accent color)
--site-bg          (main background)
--site-text        (main text color)
```

---

## Migration Guide: From Hardcoded to Dynamic

### ❌ OLD - Hardcoded Colors
```tsx
// BAD: Hardcoded Tailwind classes
<button className="bg-maroon-700 hover:bg-maroon-800 text-white px-6 py-2 rounded">
  Click Me
</button>

// BAD: Hardcoded hex values
<div style={{ backgroundColor: '#991b1b', color: '#ffffff' }}>
  Content
</div>
```

### ✅ NEW - Dynamic Colors
```tsx
// GOOD: CSS variables (simplest)
<button style={{
  backgroundColor: 'var(--color-button-primary-bg)',
  color: 'var(--color-button-primary-text)',
}} className="px-6 py-2 rounded hover:opacity-90">
  Click Me
</button>

// GOOD: Helper components
import { DynamicButton } from '@/theme/dynamicColors';

<DynamicButton variant="primary">
  Click Me
</DynamicButton>

// GOOD: Hook-based
const { getColor } = useSiteSettings();
<button style={{
  backgroundColor: getColor('button-primary-bg'),
  color: getColor('button-primary-text'),
}}>
  Click Me
</button>
```

---

## Real Component Examples

### Example 1: Simple Heading
```tsx
// Dynamic heading that changes with theme
<h1 style={{
  color: 'var(--color-text-primary)',
  fontSize: '2rem',
  fontWeight: 'bold',
}}>
  My Heading
</h1>
```

### Example 2: Card Component
```tsx
<div style={{
  backgroundColor: 'var(--color-background-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: '8px',
  padding: '16px',
}}>
  <h2 style={{ color: 'var(--color-text-primary)' }}>Title</h2>
  <p style={{ color: 'var(--color-text-secondary)' }}>Description</p>
  
  <button style={{
    backgroundColor: 'var(--color-button-primary-bg)',
    color: 'var(--color-button-primary-text)',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
  }}>
    Action
  </button>
</div>
```

### Example 3: Status Message
```tsx
const StatusMessage = ({ status, message }) => {
  const colorMap = {
    success: { bg: 'success-light', text: 'success-main', border: 'success-main' },
    error: { bg: 'error-light', text: 'error-main', border: 'error-main' },
    warning: { bg: 'warning-light', text: 'warning-main', border: 'warning-main' },
    info: { bg: 'info-light', text: 'info-main', border: 'info-main' },
  };

  const colors = colorMap[status];

  return (
    <div style={{
      backgroundColor: `var(--color-${colors.bg})`,
      color: `var(--color-${colors.text})`,
      border: `1px solid var(--color-${colors.border})`,
      borderRadius: '4px',
      padding: '12px 16px',
    }}>
      {message}
    </div>
  );
};
```

### Example 4: Interactive Button with Hover
```tsx
const HoverButton = ({ children }) => {
  return (
    <button
      style={{
        backgroundColor: 'var(--color-button-primary-bg)',
        color: 'var(--color-button-primary-text)',
        border: 'none',
        borderRadius: '4px',
        padding: '12px 24px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg)';
      }}
    >
      {children}
    </button>
  );
};
```

---

## Best Practices

### ✅ DO

1. **Use CSS variables** for maximum simplicity
   ```tsx
   style={{ color: 'var(--color-text-primary)' }}
   ```

2. **Use semantic color names**
   ```tsx
   // Good
   backgroundColor: 'var(--color-button-primary-bg)'
   
   // Avoid
   backgroundColor: 'var(--color-primary-800)'
   ```

3. **Reference the complete color list** when adding new features
4. **Test color changes** from the admin panel on your new components
5. **Use transitions** for smooth color changes
   ```tsx
   style={{ transition: 'background-color 0.2s ease' }}
   ```

### ❌ DON'T

1. **Don't hardcode hex colors**
   ```tsx
   // BAD
   backgroundColor: '#991b1b'
   ```

2. **Don't use Tailwind color classes** for brand colors
   ```tsx
   // BAD
   className="bg-maroon-700"
   ```

3. **Don't duplicate color definitions**
   ```tsx
   // BAD
   const colors = { primary: '#991b1b' };
   ```

4. **Don't forget hover states**
   ```tsx
   // Remember to handle hover!
   onMouseEnter/onMouseLeave or CSS :hover
   ```

---

## Troubleshooting

### Colors don't update when I change the admin theme?
1. Check browser console for errors
2. Verify Supabase subscription is active
3. Try refreshing the page (Ctrl+F5)
4. Check that you're using CSS variables, not hardcoded colors

### CSS variables show as "unset"?
1. Verify the variable name is spelled correctly
2. Check `src/theme/siteSettings.ts` for the variable name
3. See the complete list in this file above

### Component colors don't match the theme?
1. Check if the component is using hardcoded colors
2. Look for `bg-maroon-*` or hardcoded hex in the JSX
3. Replace with `var(--color-...)`

---

## Performance Notes

- CSS variables are **extremely fast** (no performance penalty)
- Real-time updates use Supabase subscriptions (efficient)
- Changes apply instantly without page reload
- No hydration issues or flashing

---

## Future Enhancements

- [ ] Dark mode support (color_mode in database)
- [ ] Color presets (saved color combinations)
- [ ] Color gradient builder
- [ ] A/B testing colors
- [ ] Color accessibility checker

---

## File Reference

| File | Purpose |
|------|---------|
| `src/theme/siteSettings.ts` | React Context, color fetching, real-time subscriptions |
| `src/theme/colorMap.ts` | Tailwind to CSS variable mappings |
| `src/theme/dynamicColors.tsx` | Helper components & hooks |
| `src/index.css` | CSS variable definitions |
| `src/admin/pages/ComprehensiveThemeEditor.tsx` | Admin UI for changing colors |

---

## Questions?

- Check `README_THEME_SYSTEM.md` for system overview
- Check `ADMIN_THEME_GUIDE.md` for admin instructions
- Check `COMPONENT_MIGRATION_EXAMPLES.tsx` for code examples
- Check database schema in `supabase/migrations/024_comprehensive_theme_colors.sql`
