# Quick Color Reference Card

## Most Commonly Used Colors

### For Buttons
```
button-primary-bg        #991b1b (Dark Maroon - Main Button)
button-primary-bg-hover  #7f1d1d (Darker Maroon - Hover)
button-primary-text      #ffffff (White Text)

button-secondary-bg      #7f1d1d (Dark Secondary)
button-secondary-bg-hover #6b1515 (Darker Secondary)
button-secondary-text    #ffffff (White Text)

button-success-bg        #10b981 (Green - Success)
button-danger-bg         #ef4444 (Red - Delete/Error)
button-warning-bg        #f59e0b (Amber - Warning)
```

### For Text
```
text-primary      #111827 (Black - Main Text)
text-secondary    #374151 (Dark Gray - Descriptions)
text-tertiary     #6b7280 (Medium Gray - Hints)
text-light        #9ca3af (Light Gray - Disabled)
text-inverse      #ffffff (White - On Dark BG)
```

### For Backgrounds
```
background-primary    #ffffff   (White - Main BG)
background-secondary  #f9fafb   (Off-white - Sections)
background-tertiary   #f3f4f6   (Light Gray - Cards)
background-subtle     #efefef   (Subtle Gray - Hover)
background-dark       #1f2937   (Dark - Dark Sections)
```

### For Borders
```
border-light      #f3f4f6 (Subtle)
border-default    #e5e7eb (Standard)
border-medium     #d1d5db (Medium)
border-dark       #9ca3af (Dark)
border-primary    #991b1b (Maroon - Accent)
border-accent     #f59e0b (Gold - Highlight)
```

### For Status Messages
```
success-light  #d1fae5   error-light   #fee2e2
success-main   #10b981   error-main    #ef4444
success-dark   #047857   error-dark    #dc2626

warning-light  #fef3c7   info-light    #dbeafe
warning-main   #f59e0b   info-main     #3b82f6
warning-dark   #d97706   info-dark     #1d4ed8
```

## Usage in Code

### CSS Variables
```css
background-color: var(--color-button-primary-bg);
color: var(--color-button-primary-text);
border: 1px solid var(--color-border-default);
```

### React Inline Styles
```tsx
style={{
  backgroundColor: 'var(--color-button-primary-bg)',
  color: 'var(--color-text-primary)',
}}
```

### React Hook
```tsx
const { getColor } = useSiteSettings();
const primaryColor = getColor('button-primary-bg');
```

## Accessing Admin Panel
1. Login to Admin Panel
2. Go to "Theme & Media" in sidebar
3. Select color group on left
4. Edit colors and save
5. Changes apply instantly!

---

**Need the full list?** See THEME_SYSTEM_GUIDE.md
**Want examples?** See COMPONENT_MIGRATION_EXAMPLES.tsx
