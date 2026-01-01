import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Submit to waitlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, name, reason, affiliation, referralSource } = body

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check if email already exists
        const { data: existing } = await supabase
            .from('waitlist')
            .select('id, status')
            .eq('email', email.toLowerCase().trim())
            .single()

        if (existing) {
            if (existing.status === 'pending') {
                return NextResponse.json({
                    error: 'This email is already on the waitlist',
                    status: 'pending'
                }, { status: 409 })
            } else if (existing.status === 'invited') {
                return NextResponse.json({
                    error: 'You have already been invited! Check your email for the invite code.',
                    status: 'invited'
                }, { status: 409 })
            }
        }

        // Insert into waitlist
        const { error } = await supabase.from('waitlist').insert({
            email: email.toLowerCase().trim(),
            name: name?.trim() || null,
            reason: reason?.trim() || null,
            affiliation: affiliation?.trim() || null,
            referral_source: referralSource || null,
        })

        if (error) {
            console.error('Waitlist insert error:', error)
            return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully joined the waitlist! We\'ll notify you when a spot opens up.'
        })
    } catch (error) {
        console.error('Waitlist API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// Get waitlist entries (admin only)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if admin
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || userData.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'pending'

        const { data, error } = await supabase
            .from('waitlist')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Waitlist fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
        }

        return NextResponse.json({ entries: data })
    } catch (error) {
        console.error('Waitlist API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
