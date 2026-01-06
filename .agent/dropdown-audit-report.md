# Complete Dropdown Audit Report

## Summary
Found **28 HTML `<select>` elements** across the codebase that need attention.

## Status Breakdown

### ✅ Already Updated (9 files)
These have been updated to use the `.select-input` class:
1. `components/SettingsPage.tsx` - Email digest dropdown
2. `components/SavedItemsManager.tsx` - Sort order dropdown
3. `components/ResourceFilters.tsx` - License and sort dropdowns (2 instances)
4. `components/ModerationTriage.tsx` - Sort by dropdown
5. `components/research-lab/ResearchSearchEngine.tsx` - Temporal phase dropdown
6. `components/editor/SchemaFieldRenderer.tsx` - Dynamic schema field select
7. `components/admin/UserManagement.tsx` - Role and sort dropdowns (2 instances) ✨ **JUST FIXED**

### ⚠️ Needs Immediate Update (19 remaining)

#### Admin Components (High Priority)
1. **`components/admin/coordination/NewMessageForm.tsx`** - Lines 177, 198, 222
   - Priority, visibility, and recipient dropdowns
   
2. **`components/admin/coordination/CoordinationCenter.tsx`** - Lines 207, 222, 234
   - Filter dropdowns
   
3. **`components/admin/settings/PlatformSettingsDashboard.tsx`** - Lines 282, 321
   - Settings dropdowns
   
4. **`components/admin/schema/SchemaDashboard.tsx`** - Lines 501, 574
   - Schema field type dropdowns
   
5. **`app/[locale]/admin/content/page.tsx`** - Lines 314, 328
   - Content type and status filters
   
6. **`app/[locale]/admin/skills/page.tsx`** - Lines 332, 496, 594
   - Skill category dropdowns (3 instances)

#### App Pages (Medium Priority)
7. **`app/[locale]/research-gaps/page.tsx`** - Lines 342, 354, 366, 483, 500
   - Multiple filter dropdowns (5 instances)
   
8. **`app/[locale]/resources/upload/page.tsx`** - Line 584
   - Resource type dropdown
   
9. **`app/[locale]/groups/[id]/settings/page.tsx`** - Line 242
   - Group visibility dropdown
   
10. **`app/[locale]/editor/page.tsx`** - Line 969
    - Content type dropdown
    
11. **`app/[locale]/events/[id]/edit/page.tsx`** - Line 293
    - Event type dropdown

#### Component Files (Low Priority)
12. **`components/WaitlistForm.tsx`** - Line 162
    - Referral source dropdown
    
13. **`components/EndorsementSection.tsx`** - Line 478
    - Skill category dropdown (has custom styling)
    
14. **`components/ChartBlock.tsx`** - Lines 396, 411
    - Name and value column dropdowns (2 instances)

## Quick Fix Command

To update all remaining dropdowns at once, replace their className with:
```tsx
className="select-input"
```

For dropdowns with custom icons (like chevron), use:
```tsx
className="select-input appearance-none pr-8"
```

## Recommended Migration to Radix UI Select

For the best consistency (especially in dark mode), these should be migrated to Radix UI Select:

### High Priority
- All Admin panel dropdowns
- User Management (✅ Already uses .select-input)
- Content Management
- Skills Management

### Reference Implementation
See `components/admin/SearchAnalytics.tsx` lines 108-121 for the perfect example.

## Testing Checklist
- [ ] Test all dropdowns in light mode
- [ ] Test all dropdowns in dark mode  
- [ ] Verify primary color focus states (not blue)
- [ ] Check hover states on options
- [ ] Test keyboard navigation
- [ ] Verify mobile/touch interaction

## Next Steps
1. Run the audit script: `node scripts/audit-dropdowns.js`
2. Update remaining dropdowns systematically
3. Consider migrating critical admin dropdowns to Radix UI Select
4. Test thoroughly in both themes
