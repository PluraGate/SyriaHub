import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('🌱 Starting seed...')

    // 1. Create a test user if not exists
    const email = 'researcher@syrealize.org'
    const password = 'password123'

    let userId: string

    // Check if user exists
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers()

    if (searchError) {
        console.error('Error listing users:', searchError)
        return
    }

    const existingUser = existingUsers.users.find(u => u.email === email)

    if (existingUser) {
        console.log('User already exists:', email)
        userId = existingUser.id
    } else {
        console.log('Creating user:', email)
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name: 'Dr. Sarah Al-Hassan' }
        })

        if (createError) {
            console.error('Error creating user:', createError)
            return
        }
        userId = newUser.user.id
    }

    // 2. Insert Posts
    const posts = [
        {
            title: 'Emergency Relief Assessment in Northern Syria',
            content: '# Overview\n\nThis research documents the current state of emergency relief operations in northern Syria, focusing on supply chain logistics and distribution challenges.\n\n## Key Findings\n\n1. Distribution networks are fragmented\n2. Cross-border coordination requires improvement\n3. Local NGO capacity needs strengthening\n\n## Methodology\n\nWe conducted 45 interviews with aid workers and 120 beneficiary surveys across three provinces.\n\n## Recommendations\n\n- Establish centralized coordination hubs\n- Invest in local staff training\n- Improve communication infrastructure',
            tags: ['Humanitarian Aid', 'Public Health'],
            author_id: userId
        },
        {
            title: 'Rebuilding Education Systems: A Case Study',
            content: '# Abstract\n\nThis paper examines innovative approaches to rebuilding education infrastructure in conflict-affected regions.\n\n## Introduction\n\nEducation continuity during and after conflict is crucial for long-term stability and development.\n\n## Case Studies\n\n### Mobile Learning Units\nImplementation of mobile classrooms reached 5,000 students in remote areas.\n\n### Teacher Training Programs\nCapacity building for 200 teachers using peer-to-peer methodologies.\n\n## Results\n\nStudent enrollment increased by 40% in pilot regions over 18 months.\n\n## Conclusion\n\nFlexible, community-based approaches show promising results for education recovery.',
            tags: ['Education', 'Social Sciences'],
            author_id: userId
        },
        {
            title: 'Mental Health Support in Displacement Settings',
            content: '# Research Summary\n\n## Background\n\nDisplaced populations face unique mental health challenges requiring culturally appropriate interventions.\n\n## Study Design\n\n- Population: 350 internally displaced persons\n- Duration: 12 months\n- Location: Three displacement camps\n\n## Interventions Tested\n\n1. Group therapy sessions\n2. Individual counseling\n3. Community support networks\n4. Psychoeducation programs\n\n## Outcomes\n\n- 65% reduction in reported PTSD symptoms\n- Improved community cohesion scores\n- Enhanced coping mechanisms\n\n## Implications\n\nCommunity-based mental health approaches can be effectively scaled in resource-limited settings.',
            tags: ['Public Health', 'Psychology'],
            author_id: userId
        },
        {
            title: 'Sustainable Water Infrastructure Solutions',
            content: '# Engineering Assessment\n\n## Problem Statement\n\nAccess to clean water remains a critical challenge in conflict-affected areas.\n\n## Technical Approach\n\n### Solar-Powered Pumping Systems\n- Installation of 15 systems\n- Average capacity: 50,000 liters/day\n- Maintenance training for local technicians\n\n### Water Quality Monitoring\n- Implementation of testing protocols\n- Community-based monitoring teams\n\n## Cost-Benefit Analysis\n\n| Metric | Traditional | Solar-Powered |\n|--------|-------------|---------------|\n| Initial Cost | $15,000 | $25,000 |\n| Annual Operating | $8,000 | $1,200 |\n| Lifespan | 5 years | 15 years |\n\n## Recommendations\n\nInvest in renewable energy solutions for long-term sustainability.',
            tags: ['Infrastructure', 'Engineering', 'Environmental Studies'],
            author_id: userId
        },
        {
            title: 'Microfinance Programs for Women Entrepreneurs',
            content: '# Economic Empowerment Study\n\n## Executive Summary\n\nThis research evaluates microfinance initiatives targeting women-led businesses in post-conflict regions.\n\n## Program Overview\n\n- 240 beneficiaries\n- Average loan size: $500-$2,000\n- 18-month repayment period\n- Financial literacy training included\n\n## Success Metrics\n\n- 87% repayment rate\n- Average income increase: 45%\n- 120 new jobs created\n- 60% of businesses still operating after 2 years\n\n## Challenges Identified\n\n1. Limited access to markets\n2. Regulatory barriers\n3. Security concerns affecting operations\n\n## Scalability Considerations\n\nPartnership with local financial institutions essential for growth.',
            tags: ['Economic Development', 'Social Sciences'],
            author_id: userId
        }
    ]

    console.log('Inserting posts...')

    for (const post of posts) {
        const { error } = await supabase
            .from('posts')
            .insert(post)

        if (error) {
            console.error('Error inserting post:', post.title, error)
        } else {
            console.log('Inserted:', post.title)
        }
    }

    console.log('✅ Seed complete!')
}

seed().catch(console.error)
