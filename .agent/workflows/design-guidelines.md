---
description: Design guidelines and UI/UX standards for SyriaHub
---

# SyriaHub Design Guidelines

## Core Principles

1. **Minimalist & Clean** - Less is more. Avoid visual clutter.
2. **Professional** - Academic/research context requires mature design choices.
3. **Accessible** - High contrast, readable fonts, clear hierarchy.
4. **Consistent** - Same patterns across all components.

---

## Icons

### ✅ DO: Use Lucide React Icons
- Simple, consistent line-weight icons
- Professional and minimal aesthetic
- Always use the same icon size within a context

```tsx
import { FileText, Database, Wrench } from 'lucide-react'

<FileText className="w-4 h-4" />
```

### ❌ DON'T: Use Emoji Icons
- Emoji icons look "cheesy" and unprofessional
- They render differently across platforms
- They break the visual consistency

```tsx
// BAD - Never do this
<span>📊</span>
<span>📄</span>
```

### Icon Sizes
| Context | Size |
|---------|------|
| Inline with text | `w-4 h-4` |
| Buttons | `w-4 h-4` or `w-5 h-5` |
| Feature cards | `w-6 h-6` to `w-8 h-8` |
| Hero/empty states | `w-12 h-12` to `w-16 h-16` |

---

## Colors

### Dark Mode
- Use `dark:bg-dark-bg` or `dark:bg-dark-surface` for backgrounds
- Text should be `dark:text-gray-200` or `dark:text-dark-text`
- Ensure contrast ratio of at least 4.5:1

### Buttons (Unselected State)
```
Light: bg-white border-gray-300 text-gray-700
Dark:  bg-dark-bg border-dark-border text-gray-200
```

### Buttons (Selected State)
```
bg-primary text-white border-primary
```

---

## Typography

- **Headings**: Use `font-display` (configured font)
- **Body**: System font stack
- **Monospace**: For code, file sizes, technical data

---

## Spacing

Use Tailwind's spacing scale consistently:
- `gap-2` between related elements
- `gap-4` between sections
- `p-4` or `p-6` for card padding
- `mb-4` or `mb-6` between vertical sections

---

## Components

### Cards
- Use consistent border radius: `rounded-xl`
- Border: `border border-gray-200 dark:border-dark-border`
- Shadow: `shadow-sm` (subtle)

### Form Inputs
- Height: `h-10`
- Border radius: `rounded-md`
- Always include focus states

### Buttons
- Use the `<Button>` component from `@/components/ui/button`
- Variants: `default`, `outline`, `ghost`
- Always include hover states

---

## Anti-Patterns to Avoid

1. **Cheesy icons** - No emojis, clipart, or overly colorful icons
2. **Inconsistent sizing** - Stick to the Tailwind scale
3. **Poor contrast** - Always test in both light and dark modes
4. **Over-animation** - Subtle transitions only
5. **Clashing colors** - Use the defined color palette
