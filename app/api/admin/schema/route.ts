import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimit'
import { SchemaRegistry, SchemaItem, SchemaField, SchemaFieldVersion } from '@/types'

// Helper to check admin access
async function checkAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    if (!(await checkAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'registries' | 'fields' | 'items'
    const id = searchParams.get('id')

    try {
        if (type === 'registries') {
            const query = supabase
                .from('schema_registries')
                .select('*, items:schema_items(*)')
                .order('created_at', { ascending: false })

            if (id) query.eq('id', id)

            const { data, error } = await query
            if (error) throw error
            return NextResponse.json({ data })
        }

        if (type === 'fields') {
            const query = supabase
                .from('schema_fields')
                .select(`
                    *,
                    current_version:schema_field_versions!fk_schema_fields_current_version(*)
                `)
                .order('created_at', { ascending: false })

            const { data, error } = await query
            if (error) throw error
            return NextResponse.json({ data })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    } catch (error: any) {
        console.error('Schema API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

async function handlePost(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await checkAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { action, data } = body

        // REGISTRY ACTIONS
        if (action === 'create_registry') {
            const { data: registry, error } = await supabase
                .from('schema_registries')
                .insert({ ...data, created_by: user.id })
                .select()
                .single()
            if (error) throw error
            return NextResponse.json({ data: registry })
        }

        if (action === 'update_registry') {
            const { id, ...updates } = data
            const { data: registry, error } = await supabase
                .from('schema_registries')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return NextResponse.json({ data: registry })
        }

        // ITEM ACTIONS
        if (action === 'create_item') {
            const { data: item, error } = await supabase
                .from('schema_items')
                .insert({ ...data, created_by: user.id })
                .select()
                .single()
            if (error) throw error
            return NextResponse.json({ data: item })
        }

        if (action === 'update_item') {
            const { id, ...updates } = data
            const { data: item, error } = await supabase
                .from('schema_items')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            return NextResponse.json({ data: item })
        }

        // FIELD ACTIONS
        if (action === 'create_field') {
            // 1. Create Field Identity
            const { data: field, error: fieldError } = await supabase
                .from('schema_fields')
                .insert({
                    field_key: data.field_key,
                    created_by: user.id
                })
                .select()
                .single()

            if (fieldError) throw fieldError

            // 2. Create Initial Version with all field configuration
            const { data: version, error: versionError } = await supabase
                .from('schema_field_versions')
                .insert({
                    field_id: field.id,
                    version: 1,
                    display_name: data.display_name,
                    field_type: data.field_type,
                    description: data.description || null,
                    is_required: data.is_required || false,
                    applies_to: data.applies_to || ['article'],
                    registry_id: data.registry_id || null,
                    constraints: data.constraints || {},
                    visibility: data.visibility || 'public',
                    is_searchable: data.is_searchable ?? true,
                    is_filterable: data.is_filterable ?? true,
                    sort_order: data.sort_order || 0,
                    created_by: user.id
                })
                .select()
                .single()

            if (versionError) throw versionError

            // 3. Link Version back to Field
            const { error: linkError } = await supabase
                .from('schema_fields')
                .update({ current_version_id: version.id })
                .eq('id', field.id)

            if (linkError) throw linkError

            return NextResponse.json({ data: { field, version } })
        }

        if (action === 'update_field') {
            // For fields, we create a new version instead of updating in place (versioned schema)
            const { id, ...updates } = data
            
            // Get current field and version info
            const { data: field, error: fieldError } = await supabase
                .from('schema_fields')
                .select('*, current_version:schema_field_versions!fk_schema_fields_current_version(*)')
                .eq('id', id)
                .single()
            
            if (fieldError) throw fieldError
            
            const currentVersion = field.current_version
            const newVersionNumber = (currentVersion?.version || 0) + 1

            // Create new version with updates
            const { data: version, error: versionError } = await supabase
                .from('schema_field_versions')
                .insert({
                    field_id: id,
                    version: newVersionNumber,
                    display_name: updates.display_name || currentVersion?.display_name,
                    field_type: updates.field_type || currentVersion?.field_type,
                    description: updates.description ?? currentVersion?.description,
                    is_required: updates.is_required ?? currentVersion?.is_required,
                    applies_to: updates.applies_to || currentVersion?.applies_to,
                    constraints: updates.constraints || currentVersion?.constraints || {},
                    visibility: updates.visibility || currentVersion?.visibility || 'public',
                    is_searchable: updates.is_searchable ?? currentVersion?.is_searchable ?? true,
                    is_filterable: updates.is_filterable ?? currentVersion?.is_filterable ?? true,
                    sort_order: updates.sort_order ?? currentVersion?.sort_order ?? 0,
                    registry_id: updates.registry_id ?? currentVersion?.registry_id,
                    created_by: user.id
                })
                .select()
                .single()

            if (versionError) throw versionError

            // Update field to point to new version
            const { error: linkError } = await supabase
                .from('schema_fields')
                .update({ current_version_id: version.id, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (linkError) throw linkError

            return NextResponse.json({ data: { field: { ...field, current_version: version }, version } })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('Schema API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE handler for removing schema entities
async function handleDelete(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await checkAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { type, id } = body

        if (!type || !id) {
            return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
        }

        if (type === 'registry') {
            // Delete registry (cascade will handle items)
            const { error } = await supabase
                .from('schema_registries')
                .delete()
                .eq('id', id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        if (type === 'item') {
            const { error } = await supabase
                .from('schema_items')
                .delete()
                .eq('id', id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        if (type === 'field') {
            // Deactivate field instead of hard delete (preserve data integrity)
            const { error } = await supabase
                .from('schema_fields')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    } catch (error: any) {
        console.error('Schema Delete Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
export const DELETE = withRateLimit('write')(handleDelete)
