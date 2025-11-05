# Syrealize Design System

A minimalist, mobile-first design system built with Tailwind CSS, focusing on clarity, accessibility, and responsiveness.

## 🎨 Color Palette

### Primary Colors
```css
Primary (Dark Teal):
- DEFAULT: #10282A
- dark: #0A1B1D
- light: #1A3A3D

Accent (Red):
- DEFAULT: #d91636
- dark: #B01229
- light: #E6385A

Text:
- DEFAULT: #3D4D55
- light: #6B7B83
- dark: #2A3A42

Background:
- DEFAULT: #f7f7f7
- white: #ffffff
- light: #fafafa
```

### Dark Mode Colors
```css
Dark Background: #0F1419
Dark Surface: #1A1F26
Dark Border: #2A3139
Dark Text: #E1E8ED
Dark Text Muted: #8899A6
```

### Usage
```tsx
// Light mode
<div className="bg-primary text-text">
// Dark mode automatically applied
<div className="dark:bg-dark-surface dark:text-dark-text">
```

## 📝 Typography

### Fonts
- **Display/Headings**: Manrope (400, 500, 600, 700, 800)
- **Body**: Inter (300, 400, 500, 600, 700)

### Font Classes
```css
font-sans    → Inter
font-display → Manrope
```

### Heading Scales
```tsx
<h1> → text-4xl md:text-5xl lg:text-6xl (responsive)
<h2> → text-3xl md:text-4xl lg:text-5xl
<h3> → text-2xl md:text-3xl lg:text-4xl
<h4> → text-xl md:text-2xl
```

All headings use:
- `font-display` (Manrope)
- `font-semibold`
- `text-primary dark:text-dark-text`

## 📦 Reusable Components

### 1. Navbar
**File**: `components/Navbar.tsx`

**Features**:
- Sticky header with backdrop blur
- Mobile hamburger menu
- Dark mode toggle
- User authentication states
- ARIA labels for accessibility

**Usage**:
```tsx
import { Navbar } from '@/components/Navbar'

<Navbar user={user} />
```

---

### 2. Footer
**File**: `components/Footer.tsx`

**Features**:
- Responsive grid layout
- Quick links and resources
- Social media icons
- Auto-updating copyright year

**Usage**:
```tsx
import { Footer } from '@/components/Footer'

<Footer />
```

---

### 3. PostCard
**File**: `components/PostCard.tsx`

**Features**:
- Hover states with lift effect
- Tag display with TagChip
- Relative time formatting
- Excerpt truncation
- Accessible card structure

**Props**:
```tsx
interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    created_at: string
    author_email?: string
    author_id: string
    tags?: string[]
  }
  showAuthor?: boolean // default: true
}
```

**Usage**:
```tsx
import { PostCard } from '@/components/PostCard'

<PostCard post={post} showAuthor={true} />
```

---

### 4. TagChip & TagList
**File**: `components/TagChip.tsx`

**Features**:
- Multiple size variants (sm, md, lg)
- Color variants (default, outline, accent)
- Interactive/clickable tags
- Remove button support
- TagList for multiple tags with max display

**Props**:
```tsx
interface TagChipProps {
  tag: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'accent'
  interactive?: boolean
  onRemove?: () => void
  className?: string
}

interface TagListProps {
  tags: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'accent'
  interactive?: boolean
  maxDisplay?: number
  onRemove?: (tag: string) => void
  className?: string
}
```

**Usage**:
```tsx
import { TagChip, TagList } from '@/components/TagChip'

<TagChip tag="research" interactive />
<TagList tags={['ai', 'ml', 'nlp']} maxDisplay={3} interactive />
```

---

### 5. AuthForm
**File**: `components/AuthForm.tsx`

**Features**:
- Login/Signup modes
- Email & password validation
- Show/hide password toggle
- Loading states
- Error handling
- ARIA accessibility

**Props**:
```tsx
interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit?: (email: string, password: string) => Promise<void>
  className?: string
}
```

**Usage**:
```tsx
import { AuthForm } from '@/components/AuthForm'

<AuthForm mode="login" onSubmit={handleLogin} />
<AuthForm mode="signup" />
```

## 🎯 CSS Utility Classes

### Container Classes
```css
.container-custom → max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
.container-narrow → max-w-4xl mx-auto px-4 sm:px-6 lg:px-8
```

### Card Classes
```css
.card → Base card with shadow and border
.card-hover → Adds hover lift effect
```

### Button Classes
```css
.btn → Base button styles
.btn-primary → Primary button (teal)
.btn-accent → Accent button (red)
.btn-outline → Outline button
.btn-ghost → Ghost/transparent button
```

### Input Classes
```css
.input → Styled form input with focus states
```

### Link Classes
```css
.link → Styled text link with hover underline
```

### Layout Classes
```css
.section → Standard section padding (responsive)
.grid-auto → Responsive grid (1-2-3 columns)
```

### Accessibility Classes
```css
.focus-ring → Focus visible ring for keyboard navigation
```

## 🌓 Dark Mode

### Enabling Dark Mode
Dark mode is controlled by the `dark` class on the `<html>` element.

The Navbar component includes a toggle that:
1. Adds/removes `dark` class
2. Saves preference to localStorage
3. Respects system preference on first load

### Dark Mode Classes
All components use Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-dark-surface">
<p className="text-text dark:text-dark-text">
<button className="border-gray-200 dark:border-dark-border">
```

## ♿ Accessibility Features

### ARIA Labels
- All interactive elements have `aria-label`
- Form inputs have `aria-required` and `aria-invalid`
- Error messages use `aria-live="polite"`
- Mobile menus use `aria-expanded`

### Keyboard Navigation
- All components are keyboard accessible
- Focus rings visible via `.focus-ring` class
- Tab order is logical

### Color Contrast
- All text meets WCAA AA standards (4.5:1)
- High contrast mode supported
- Focus indicators have 3:1 contrast

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📱 Responsive Design

### Breakpoints
```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile-First Approach
All components are built mobile-first with progressive enhancement:

```tsx
// Base: Mobile
<h1 className="text-4xl">

// Medium devices and up
<h1 className="text-4xl md:text-5xl">

// Large devices and up
<h1 className="text-4xl md:text-5xl lg:text-6xl">
```

### Grid Layouts
```tsx
// Responsive grid: 1 column → 2 columns → 3 columns
<div className="grid-auto">
// or custom:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 🎨 Spacing System

Uses Tailwind's default spacing scale with custom additions:

```css
0   → 0px
0.5 → 0.125rem (2px)
1   → 0.25rem  (4px)
...
18  → 4.5rem   (72px)  [custom]
88  → 22rem    (352px) [custom]
128 → 32rem    (512px) [custom]
```

## 🔧 Configuration Files

### `tailwind.config.ts`
- Custom color palette
- Font families
- Spacing extensions
- Shadow utilities
- Dark mode config

### `app/globals.css`
- CSS variables for theming
- Base layer styles
- Component utilities
- Custom scrollbar
- Selection colors

### `app/layout.tsx`
- Font loading (Inter & Manrope)
- HTML attributes (lang, suppressHydrationWarning)
- Metadata configuration

## 📚 Design Principles

1. **Minimalism**: Clean interfaces with generous whitespace
2. **Consistency**: Reusable components with predictable behavior
3. **Accessibility**: WCAG AA compliant, keyboard navigable
4. **Responsiveness**: Mobile-first, works on all screen sizes
5. **Performance**: Optimized fonts, efficient CSS
6. **Dark Mode**: Full support with smooth transitions

## 🚀 Quick Start

### Using a Component
```tsx
import { Navbar, Footer, PostCard } from '@/components'

export default function Page() {
  return (
    <>
      <Navbar user={user} />
      <main className="section">
        <div className="container-custom">
          <PostCard post={post} />
        </div>
      </main>
      <Footer />
    </>
  )
}
```

### Creating a Styled Button
```tsx
<button className="btn btn-primary">
  Click Me
</button>
```

### Creating a Card
```tsx
<div className="card card-hover p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

## 📖 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lucide Icons](https://lucide.dev)
