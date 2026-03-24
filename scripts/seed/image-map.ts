// ─── Image Map ────────────────────────────────────────────────────────────────
// EDIT THIS FILE before running the seeder.
//
// Each key is a symbolic name referenced by `cover_image_key` in the data files.
// Each value is an absolute path to a JPG on your local machine, or null to skip.
//
// The runner uploads each image at most once per run (memoised by key → URL),
// so assigning the same scan to multiple posts is safe and efficient.
//
// The 13 scanned images are from:
//   C:\Users\AvArc\OneDrive\Documents\GitHub\Data-Driven-Design\Scanned Documents\
//
// Open each image and decide which article it suits best, then leave the others
// assigned or set them to null. You can also point any key to a different image.

import type { ImageMap } from './types'

export const imageMap: ImageMap = {
  // December 17 batch — likely lecture sketches or diagrams
  'scan-dec17-a': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20241217_170353.jpg',
  'scan-dec17-b': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20241217_170411.jpg',
  'scan-dec17-c': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20241217_170427.jpg',
  'scan-dec17-d': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20241217_170452.jpg',

  // December 20 — philosophical quotes (Wittgenstein, Bayes)
  'scan-dec20':   'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20241220_201624.jpg',

  // December 27 — likely Arabic/Islamic urbanism text
  'scan-dec27':   'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20241227_164319.jpg',

  // January 22 batch — dense lecture notes
  'scan-jan22-a': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194510.jpg',
  'scan-jan22-b': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194515.jpg',
  'scan-jan22-c': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194537.jpg',
  'scan-jan22-d': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194547.jpg',
  'scan-jan22-e': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194550.jpg',
  'scan-jan22-f': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194619.jpg',
  'scan-jan22-g': 'C:/Users/AvArc/OneDrive/Documents/GitHub/Data-Driven-Design/Scanned Documents/IMG_20250122_194626.jpg',
}
