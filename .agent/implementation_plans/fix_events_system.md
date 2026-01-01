# Implementation Plan - Event System Overhaul

The goal is to establish a distinct, fully functional system for Events, ensuring they are treated separately from standard research posts in terms of navigation, display, and interaction.

## User Issues to Address
1. **Visibility**: Events not showing in the Events panel.
2. **Categorization**: Events appearing mixed with Research in the User Profile.
3. **Identity**: Events appearing as generic "posts" to other users.
4. **Interaction**: Lack of working confirmation/attendance (RSVP) features.

## Proposed Strategy

### 1. Robust Routing & Navigation
**Problem**: Links to events likely default to `/posts/[id]`, causing them to render as generic articles instead of using the specialized Event Details view.
**Solution**: 
- Update `MagazineCard`, `SearchCard`, and any other post lists to check `content_type`.
- If `content_type === 'event'`, route to `/events/[id]`.
- Update `app/[locale]/posts/[id]/page.tsx` to detect if a loaded post is an event and redirect to `/events/[id]` to prevent accidental generic rendering.

### 2. Events Page & Discovery (`/events`)
**Problem**: Events panel might be querying incorrectly or failing to display data.
**Solution**:
- Verify the query in `app/[locale]/events/page.tsx` (Already partially addressed: fixed FK ambiguity).
- Ensure specific metadata fields (`start_time`, `location`) are correctly parsed and displayed.

### 3. Profile Page Separation
**Problem**: Events are cluttering the "Research" tab.
**Solution**:
- (Completed) Updated `UserActivityFeed` to separate "Research" (articles/questions) from "Events".
- (Completed) Added specific "Events" tab using `EventCard`.

### 4. RSVP & Attendance System
**Problem**: Users can't confirm attendance.
**Solution**:
- The `RsvpButton` UI has been redesigned.
- Verify `event_rsvps` table RLS policies (users must be able to insert/update their own rows).
- Ensure the Event Details page correctly fetches and displays the RSVP list.

### 5. Content Feed Polish
**Problem**: Main Home/Feed might be showing events as articles.
**Solution**: 
- Decide if events belong in the main feed. If so, render them with a distinct "Event" badge or card style.
- If not, filter them out of the main `posts` query in the Feed.

## Step-by-Step Plan

### Phase 1: Navigation & Routing (High Priority)
- [ ] **Audit `MagazineCard`**: Ensure dynamic linking based on `content_type`.
- [ ] **Redirect in Post Details**: implementing a server-side redirect in `posts/[id]/page.tsx` if the content is an event.

### Phase 2: Event Details & Interaction
- [ ] **Refine Event Details UI**: Ensure `app/[locale]/events/[id]/page.tsx` is beautiful and informational (using the new `RsvpButton`).
- [ ] **Verify RSVP Permissions**: Check `supabase/migrations` for `event_rsvps` RLS to ensure functionality for non-authors.

### Phase 3: Events Discovery Page
- [ ] **Verify `/events` Query**: Ensure it correctly fetches upcoming vs past events.
- [ ] **Polish `EventCard`**: Ensure it handles missing metadata gracefully.

### Phase 4: Cleanup
- [ ] **Feed Filtering**: Update the main feed query to either exclude events or display them appropriately.

## Verification
- Create an event.
- Click it from the Profile -> Should go to `/events/[id]`.
- Click it from Feed -> Should go to `/events/[id]`.
- Viewing as another user -> Should see RSVP button.
- RSVPing -> Should update the database and UI count.
