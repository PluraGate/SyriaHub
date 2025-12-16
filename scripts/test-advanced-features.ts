/**
 * Test script for the research search API
 * Run with: npx tsx scripts/test-advanced-features.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSearchOntology() {
    console.log('\n🔍 Testing Search Ontology Tables...\n')

    // Test discipline_categories
    const { data: categories, error: catError } = await supabase
        .from('discipline_categories')
        .select('*')

    if (catError) {
        console.log('❌ discipline_categories:', catError.message)
    } else {
        console.log(`✅ discipline_categories: ${categories?.length} categories`)
        categories?.forEach(c => console.log(`   - ${c.name}`))
    }

    // Test evidence_tier_mappings
    const { data: tiers, error: tierError } = await supabase
        .from('evidence_tier_mappings')
        .select('*')

    if (tierError) {
        console.log('❌ evidence_tier_mappings:', tierError.message)
    } else {
        console.log(`✅ evidence_tier_mappings: ${tiers?.length} types`)
    }
}

async function testExternalData() {
    console.log('\n🌐 Testing External Data Tables...\n')

    // Test external_data_sources
    const { data: sources, error: srcError } = await supabase
        .from('external_data_sources')
        .select('*')

    if (srcError) {
        console.log('❌ external_data_sources:', srcError.message)
    } else {
        console.log(`✅ external_data_sources: ${sources?.length} sources`)
        sources?.forEach(s => console.log(`   - ${s.name} (${s.id})`))
    }
}

async function testJurySystem() {
    console.log('\n⚖️ Testing Jury System Tables...\n')

    // Test jury_deliberations
    const { data: delibs, error: delibError } = await supabase
        .from('jury_deliberations')
        .select('*')
        .limit(1)

    if (delibError) {
        console.log('❌ jury_deliberations:', delibError.message)
    } else {
        console.log(`✅ jury_deliberations: Table exists`)
    }

    // Test jury_votes
    const { data: votes, error: voteError } = await supabase
        .from('jury_votes')
        .select('*')
        .limit(1)

    if (voteError) {
        console.log('❌ jury_votes:', voteError.message)
    } else {
        console.log(`✅ jury_votes: Table exists`)
    }
}

async function testPeerReview() {
    console.log('\n📝 Testing Peer Review Tables...\n')

    // Test review_requests
    const { data: requests, error: reqError } = await supabase
        .from('review_requests')
        .select('*')
        .limit(1)

    if (reqError) {
        console.log('❌ review_requests:', reqError.message)
    } else {
        console.log(`✅ review_requests: Table exists`)
    }

    // Test peer_reviews
    const { data: reviews, error: revError } = await supabase
        .from('peer_reviews')
        .select('*')
        .limit(1)

    if (revError) {
        console.log('❌ peer_reviews:', revError.message)
    } else {
        console.log(`✅ peer_reviews: Table exists`)
    }

    // Test expert_verifications
    const { data: experts, error: expError } = await supabase
        .from('expert_verifications')
        .select('*')
        .limit(1)

    if (expError) {
        console.log('❌ expert_verifications:', expError.message)
    } else {
        console.log(`✅ expert_verifications: Table exists`)
    }
}

async function testSemanticSearch() {
    console.log('\n🧠 Testing Semantic Search Tables...\n')

    // Test content_embeddings
    const { data: embeddings, error: embError } = await supabase
        .from('content_embeddings')
        .select('id')
        .limit(1)

    if (embError) {
        console.log('❌ content_embeddings:', embError.message)
    } else {
        console.log(`✅ content_embeddings: Table exists`)
    }

    // Test search_sessions
    const { data: sessions, error: sessError } = await supabase
        .from('search_sessions')
        .select('id')
        .limit(1)

    if (sessError) {
        console.log('❌ search_sessions:', sessError.message)
    } else {
        console.log(`✅ search_sessions: Table exists`)
    }

    // Test trust_profiles
    const { data: trust, error: trustError } = await supabase
        .from('trust_profiles')
        .select('id')
        .limit(1)

    if (trustError) {
        console.log('❌ trust_profiles:', trustError.message)
    } else {
        console.log(`✅ trust_profiles: Table exists`)
    }
}

async function main() {
    console.log('='.repeat(60))
    console.log('🧪 SyriaHub Advanced Features - Database Test')
    console.log('='.repeat(60))

    await testSearchOntology()
    await testExternalData()
    await testJurySystem()
    await testPeerReview()
    await testSemanticSearch()

    console.log('\n' + '='.repeat(60))
    console.log('✅ Database test complete!')
    console.log('='.repeat(60))
}

main().catch(console.error)
