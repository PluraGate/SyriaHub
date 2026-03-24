import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

import { imageMap } from './image-map'
import { articles } from './data/articles'
import { questions } from './data/questions'
import { resources } from './data/resources'
import { researchGaps } from './data/research-gaps'
import type { SeedPost } from './types'

// ─── Environment ─────────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const authorEmail = process.env.SEED_AUTHOR_EMAIL

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!authorEmail) {
  console.error('❌  Missing SEED_AUTHOR_EMAIL in .env.local')
  console.error('    Set it to the email of the account you want content attributed to.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ─── Image upload (memoised per run) ─────────────────────────────────────────
const urlCache = new Map<string, string>()
let authorId: string

async function uploadCover(imageKey: string | null): Promise<string | null> {
  if (!imageKey) return null
  if (urlCache.has(imageKey)) return urlCache.get(imageKey)!

  const localPath = imageMap[imageKey]
  if (!localPath) {
    console.warn(`  ⚠  Image key "${imageKey}" has no path in image-map.ts — skipping cover`)
    return null
  }
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠  Image file not found at ${localPath} — skipping cover`)
    return null
  }

  const ext = path.extname(localPath).replace('.', '')
  const storagePath = `covers/${authorId}/${Date.now()}-${imageKey}.${ext}`
  const buffer = fs.readFileSync(localPath)

  const { error: uploadError } = await supabase.storage
    .from('post_images')
    .upload(storagePath, buffer, { contentType: `image/${ext}`, upsert: false })

  if (uploadError) {
    console.warn(`  ⚠  Cover upload failed for "${imageKey}":`, uploadError.message)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('post_images')
    .getPublicUrl(storagePath)

  urlCache.set(imageKey, publicUrl)
  return publicUrl
}

// ─── Post insertion (bilingual, idempotent) ───────────────────────────────────
async function seedPosts(items: SeedPost[]) {
  for (const item of items) {
    // Upload cover once; both locales share the same image
    const coverUrl = await uploadCover(item.cover_image_key)

    for (const locale of ['en', 'ar'] as const) {
      const { title, content } = item[locale]

      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('title', title)
        .eq('author_id', authorId)
        .maybeSingle()

      if (existing) {
        console.log(`  ↷  SKIP [${locale}] ${title}`)
        continue
      }

      const { error } = await supabase.from('posts').insert({
        title,
        content,
        tags: item.tags,
        content_type: item.content_type,
        status: item.status,
        author_id: authorId,
        cover_image_url: coverUrl,
        metadata: { ...(item.metadata ?? {}), locale },
      })

      if (error) {
        console.error(`  ✗  ERROR [${locale}] ${title}`)
        console.error('     ', error.message)
      } else {
        console.log(`  ✓  [${locale}] ${title}`)
      }
    }
  }
}

// ─── Research gap insertion (bilingual, idempotent) ───────────────────────────
async function seedResearchGaps() {
  for (const gap of researchGaps) {
    const { en, ar, ...shared } = gap

    for (const [locale, lc] of [['en', en], ['ar', ar]] as const) {
      const { data: existing } = await supabase
        .from('research_gaps')
        .select('id')
        .eq('title', lc.title)
        .eq('created_by', authorId)
        .maybeSingle()

      if (existing) {
        console.log(`  ↷  SKIP gap [${locale}] ${lc.title}`)
        continue
      }

      const { error } = await supabase.from('research_gaps').insert({
        ...shared,
        title: lc.title,
        description: lc.description,
        created_by: authorId,
        status: 'identified',
      })

      if (error) {
        console.error(`  ✗  ERROR gap [${locale}] ${lc.title}`)
        console.error('     ', error.message)
      } else {
        console.log(`  ✓  gap [${locale}] ${lc.title}`)
      }
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function run() {
  console.log('\n🌱  SyriaHub seed — Data-Driven Design lecture content')
  console.log('─'.repeat(60))

  // Resolve author
  const { data: authorRow, error: authorError } = await supabase
    .from('users')
    .select('id')
    .eq('email', authorEmail)
    .single()

  if (authorError || !authorRow) {
    console.error(`❌  Author not found for email: ${authorEmail}`)
    console.error('    Make sure this account exists in Supabase Auth before running.')
    process.exit(1)
  }
  authorId = authorRow.id
  console.log(`✓  Author resolved: ${authorEmail} (${authorId})\n`)

  // Articles
  console.log(`📄  Seeding articles (${articles.length} items → ${articles.length * 2} posts)...`)
  await seedPosts(articles)

  // Questions
  console.log(`\n❓  Seeding questions (${questions.length} items → ${questions.length * 2} posts)...`)
  await seedPosts(questions)

  // Resources
  console.log(`\n📚  Seeding resources (${resources.length} items → ${resources.length * 2} posts)...`)
  await seedPosts(resources)

  // Research gaps
  console.log(`\n🔍  Seeding research gaps (${researchGaps.length} items → ${researchGaps.length * 2} rows)...`)
  await seedResearchGaps()

  const totalPosts = (articles.length + questions.length + resources.length) * 2
  const totalGaps = researchGaps.length * 2
  console.log('\n─'.repeat(60))
  console.log(`✅  Done. ${totalPosts} posts + ${totalGaps} research gaps processed.`)
  console.log('    Re-run safely — existing items will be skipped.\n')
}
