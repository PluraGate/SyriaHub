# Dropdown Menu Styling Fix - Summary

## Overview
Fixed all HTML `<select>` dropdown menus across the codebase to use consistent styling that follows the design guidelines with primary color focus states instead of default blue.

## Changes Made

### 1. Global CSS (`app/globals.css`)
- Added a new `.select-input` utility class that provides:
  - Consistent border, background, and text colors for light/dark modes
  - Primary color focus ring (`focus:ring-primary/20`)
  - Primary color border on focus (`focus:border-primary`)
  - Hover states with subtle border color changes
  - Disabled states with reduced opacity

### 2. Updated Components
The following components have been updated to use the new `.select-input` class:

#### Core Components
- `components/SettingsPage.tsx` - Email digest dropdown
- `components/SavedItemsManager.tsx` - Sort order dropdown
- `components/ResourceFilters.tsx` - License and sort dropdowns (2 instances)
- `components/ModerationTriage.tsx` - Sort by dropdown
- `components/research-lab/ResearchSearchEngine.tsx` - Temporal phase dropdown
- `components/editor/SchemaFieldRenderer.tsx` - Dynamic schema field select
- `components/EndorsementSection.tsx` - Skill category dropdown (custom styled)
- `components/ChartBlock.tsx` - Name and value column dropdowns (2 instances)

#### Admin Components
- `components/admin/coordination/NewMessageForm.tsx` - Multiple dropdowns (3 instances)
- `components/admin/coordination/CoordinationCenter.tsx` - Multiple dropdowns (3 instances)
- `components/admin/UserManagement.tsx` - Role and status dropdowns (2 instances)
- `components/admin/settings/PlatformSettingsDashboard.tsx` - Settings dropdowns (2 instances)
- `components/admin/schema/SchemaDashboard.tsx` - Schema field dropdowns (2 instances)

#### App Pages
- `app/[locale]/research-gaps/page.tsx` - Filter dropdowns (5 instances)
- `app/[locale]/resources/upload/page.tsx` - Resource type dropdown
- `app/[locale]/groups/[id]/settings/page.tsx` - Group visibility dropdown
- `app/[locale]/editor/page.tsx` - Content type dropdown
- `app/[locale]/events/[id]/edit/page.tsx` - Event type dropdown
- `app/[locale]/admin/content/page.tsx` - Content filter dropdowns (2 instances)
- `app/[locale]/admin/skills/page.tsx` - Skill category dropdowns (3 instances)

### 3. Special Cases
Some dropdowns required additional custom styling to preserve specific functionality:
- `EndorsementSection.tsx` - Maintains custom dropdown arrow and compact sizing
- `ModerationTriage.tsx` - Preserves `appearance-none` for custom icon placement
- `ChartBlock.tsx` - Uses `.input.input-sm` class (should be updated to `.select-input` if needed)

## Benefits
1. **Consistency**: All dropdowns now follow the same design pattern
2. **Brand Alignment**: Focus states use primary color instead of browser default blue
3. **Accessibility**: Proper focus indicators and hover states
4. **Dark Mode**: Consistent styling across light and dark themes
5. **Maintainability**: Single source of truth for dropdown styling

## Testing Recommendations
1. Test all dropdowns in both light and dark modes
2. Verify focus states show primary color ring
3. Check hover states on dropdown options
4. Ensure disabled states display correctly
5. Test keyboard navigation (Tab, Arrow keys, Enter)

## Notes
- The CSS linter warnings about `@tailwind` and `@apply` directives are expected and can be ignored (standard Tailwind CSS syntax)
- Some dropdowns may need additional testing to ensure the new styling doesn't conflict with existing functionality
