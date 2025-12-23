# Spatial Insight Engine

The Spatial Insight Engine adds geographic intelligence to SyriaHub, helping researchers understand the spatial context of their content and discover relevant patterns.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Creates/Views Post                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Spatial Editor                               │
│  • Draw points, circles, polygons on map                         │
│  • Search places via Nominatim geocoding                         │
│  • Saved as GeoJSON in post.spatial_geometry                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Pattern Detection Engine                       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    P1    │  │    P2    │  │    P3    │  │    P4    │  ...   │
│  │ Network  │  │ Service  │  │ Boundary │  │  Access  │        │
│  │Bottleneck│  │ Coverage │  │ Spill    │  │  Discont │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  Confidence = pattern_match×0.4 + completeness×0.3 +            │
│               temporal×0.2 + trust×0.1                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Awareness Flags                               │
│  • Displayed if confidence ≥ 0.6                                 │
│  • Dismissible (session-only)                                    │
│  • Uses cautious language ("may", "could")                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Precedent System                               │
│  • Matches detected patterns to curated case studies             │
│  • Admins create/publish precedents via /admin/precedents        │
│  • Surfaces relevant historical context                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pattern Detectors

### P1: Network Bottleneck
**Purpose:** Identifies areas with limited road access that could become isolated.

**How it works:**
1. Queries OSM Overpass API for roads within 15km radius
2. Counts primary roads (motorways, trunk, primary)
3. Flags if < 3 primary roads and < 10 total road segments

**Data source:** OpenStreetMap via Overpass API (real-time)

### P2: Service Coverage Question
**Purpose:** Prompts inquiry about service availability in large, sparse governorates.

**How it works:**
1. Determines which governorate contains the point
2. Checks if governorate is in the "large governorate" list:
   - Deir-ez-Zor (~33,060 km²)
   - Homs (~42,223 km²)
   - Al-Hasakeh (~23,334 km²)
   - Ar-Raqqa (~19,616 km²)
   - Rural Damascus (~18,032 km²)

**Data source:** Pre-defined list based on geographic area

### P3: Boundary Spill-over
**Purpose:** Detects when content spans multiple administrative areas.

**How it works:**
1. Loads Syria governorate polygons (OSM admin boundaries)
2. For polygon/circle geometries, checks intersection with each governorate
3. Flags if geometry overlaps 2+ governorates

**Data source:** `syria-governorates-polygons.json` (geoBoundaries, CC BY 3.0 IGO)

### P4: Access Discontinuity
**Purpose:** Highlights when administrative boundaries don't match physical access patterns.

**How it works:**
1. Finds nearest governorate center to the point
2. Checks if point is >50km from its assigned center
3. Flags if closer to another governorate center (<30km)

**Data source:** Governorate polygon centroids

### P5: Aid Activity Pattern
**Purpose:** Identifies areas that may be underserved by humanitarian coverage.

**How it works:**
1. Checks nearby posts for humanitarian keywords
2. Keywords: aid, humanitarian, relief, refugee, ngo, unhcr, etc.
3. Flags if area has few posts and no humanitarian content

**Data source:** SyriaHub's own posts

---

## Confidence Scoring

Each pattern produces a confidence score (0-1):

```
confidence = (pattern_match × 0.4) + 
             (data_completeness × 0.3) + 
             (temporal_relevance × 0.2) + 
             (source_trust × 0.1)
```

| Factor | Weight | Description |
|--------|--------|-------------|
| pattern_match | 40% | Binary: pattern detected (1) or not (0) |
| data_completeness | 30% | How complete is the required data |
| temporal_relevance | 20% | How current is the data (decays over time) |
| source_trust | 10% | Trustworthiness of data source |

**Threshold:** Only patterns with confidence ≥ 0.6 are displayed.

---

## Awareness Flags

Detected patterns are shown as dismissible "awareness flags" on the SpatialContextCard:

- **Non-judgmental language:** Uses "may", "could", "suggests inquiry"
- **Session-only dismissal:** Dismissing a flag hides it for the current session
- **Confidence indicator:** Subtle bar showing confidence level
- **Disclaimer:** "These patterns suggest questions, not conclusions"

---

## Precedent System

Admins can curate historical case studies that get surfaced when patterns are detected.

### Database Schema

**precedents table:**
- title, summary (en + ar)
- pattern_id (P1-P5)
- governorate (optional filter)
- source_url, source_name, trust_level
- is_published (draft/published)

**precedent_matches table:**
- Links precedents to posts
- Tracks confidence at match time
- Collects user feedback (was_helpful)

### Admin Workflow

1. Go to `/admin/precedents`
2. Create new precedent with title, summary, pattern
3. Optionally add source attribution
4. Publish when ready

### Display

When a post triggers a pattern, the PrecedentCard fetches matching precedents and displays them as "Related Case Studies."

---

## File Structure

```
lib/
├── spatialQueries.ts      # Geometry utilities (distance, containment)
├── patternDetector.ts     # Pattern detection engine
└── overpassClient.ts      # OSM road network API

components/spatial/
├── SpatialMap.tsx         # Leaflet map wrapper
├── SpatialEditor.tsx      # Drawing tools + geocoding
├── SpatialContextCard.tsx # Pattern display container
├── AwarenessFlag.tsx      # Individual pattern flag
└── PrecedentCard.tsx      # Case study display

public/data/
└── syria-governorates-polygons.json  # OSM admin boundaries

app/api/precedents/
├── route.ts               # List/create precedents
└── [id]/route.ts          # Detail/update/delete

app/[locale]/admin/precedents/
└── page.tsx               # Admin curation UI
```

---

## Data Sources

| Data | Source | License | Notes |
|------|--------|---------|-------|
| Governorate boundaries | geoBoundaries | CC BY 3.0 IGO | Commit 9469f09, 2017 representation |
| Road network | OSM Overpass API | ODbL | Real-time queries |
| Humanitarian keywords | Internal | — | Defined in patternDetector.ts |

---

## Design Principles

1. **Suggest, don't conclude:** Patterns raise questions, not answers
2. **Transparent confidence:** Users can see how confident the system is
3. **Dismissible:** Users control what they see
4. **Conservative detection:** Prefer false negatives over false positives
5. **Binary pattern matching:** Until calibration data exists, patterns are on/off
