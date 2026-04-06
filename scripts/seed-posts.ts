/**
 * SyriaHub seed script — initial content from the Data-Driven Design lecture series.
 *
 * ─── Before running ───────────────────────────────────────────────────────────
 *
 * 1. Add to .env.local:
 *      SEED_AUTHOR_EMAIL=latif@lavartstudio.com
 *    The account must already exist in Supabase Auth.
 *
 * 2. Review scripts/seed/image-map.ts
 *    Open each of the 13 scanned images in:
 *      C:\Users\AvArc\OneDrive\Documents\GitHub\Data-Driven-Design\Scanned Documents\
 *    Then assign covers by editing cover_image_key values in:
 *      scripts/seed/data/articles.ts
 *    Set cover_image_key: null to skip cover upload for any item.
 *    You can also point any key in image-map.ts to a different image entirely.
 *
 * 3. Edit any content in scripts/seed/data/ before running.
 *    All 20 items exist as data files — articles, questions, resources, research-gaps.
 *    The runner is idempotent: re-running skips items that already exist by title + author.
 *
 * ─── Run ──────────────────────────────────────────────────────────────────────
 *
 *    npx tsx scripts/seed-posts.ts
 *
 * ─── What gets inserted ───────────────────────────────────────────────────────
 *
 *    6 articles   × 2 languages = 12 posts
 *    5 questions  × 2 languages = 10 posts
 *    5 resources  × 2 languages = 10 posts
 *    4 gaps       × 2 languages =  8 research_gaps rows
 *    ─────────────────────────────────────────
 *                               40 posts + 8 gaps
 */

import { run } from './seed/runner'

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
