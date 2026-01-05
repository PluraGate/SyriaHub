'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Layers, Database, ChevronRight, Loader2, X, Save, AlertCircle } from 'lucide-react'
import { SchemaRegistry, SchemaField, SchemaItem, ContentType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

const CONTENT_TYPES: ContentType[] = ['article', 'question', 'answer', 'resource', 'event', 'trace']
const FIELD_TYPES_NEEDING_REGISTRY = ['registry_ref', 'registry_ref_multi']
const FIELD_TYPES_NEEDING_OPTIONS = ['select', 'multiselect']

type EditMode = 'none' | 'registry' | 'item' | 'field'

interface EditState {
    mode: EditMode
    id?: string // for editing existing
    parentId?: string // for creating items under a registry
}

export function SchemaDashboard() {
    const [registries, setRegistries] = useState<SchemaRegistry[]>([])
    const [fields, setFields] = useState<SchemaField[]>([])
    const [loading, setLoading] = useState(true)
    const [editState, setEditState] = useState<EditState>({ mode: 'none' })
    const { showToast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [regRes, fieldRes] = await Promise.all([
                fetch('/api/admin/schema?type=registries'),
                fetch('/api/admin/schema?type=fields')
            ])

            if (regRes.ok) {
                const { data } = await regRes.json()
                setRegistries(data || [])
            }
            if (fieldRes.ok) {
                const { data } = await fieldRes.json()
                setFields(data || [])
            }
        } catch (err) {
            console.error('Failed to load schema data', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(type: 'registry' | 'item' | 'field', id: string) {
        if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return
        
        try {
            const res = await fetch('/api/admin/schema', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id })
            })
            
            if (res.ok) {
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`, 'success')
                loadData()
            } else {
                const { error } = await res.json()
                showToast(error || 'Delete failed', 'error')
            }
        } catch (err) {
            showToast('Delete failed', 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 dark:bg-teal-900/50">
                        <Database className="w-6 h-6 text-primary dark:text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-primary dark:text-white">
                            Schema Registry
                        </h1>
                        <p className="text-sm text-text-light dark:text-gray-400">
                            Manage dynamic data models and vocabularies.
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="registries" className="w-full">
                <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <TabsTrigger value="registries" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white rounded-md px-4 py-2">
                        <Database className="w-4 h-4" />
                        Registries
                    </TabsTrigger>
                    <TabsTrigger value="fields" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white rounded-md px-4 py-2">
                        <Layers className="w-4 h-4" />
                        Fields
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="registries">
                    <div className="mb-4">
                        <Button onClick={() => setEditState({ mode: 'registry' })} className="gap-2 bg-primary hover:bg-primary-dark text-white">
                            <Plus className="w-4 h-4" /> New Registry
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {registries.map(reg => (
                            <RegistryCard 
                                key={reg.id} 
                                registry={reg} 
                                onEdit={() => setEditState({ mode: 'registry', id: reg.id })}
                                onDelete={() => handleDelete('registry', reg.id)}
                                onAddItem={() => setEditState({ mode: 'item', parentId: reg.id })}
                                onEditItem={(itemId) => setEditState({ mode: 'item', id: itemId, parentId: reg.id })}
                                onDeleteItem={(itemId) => handleDelete('item', itemId)}
                            />
                        ))}
                        {registries.length === 0 && (
                            <div className="card p-8 text-center">
                                <Database className="w-12 h-12 mx-auto text-text-light dark:text-gray-500 mb-3" />
                                <p className="text-text-light dark:text-gray-400">No registries yet. Create your first registry to get started.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="fields">
                    <div className="mb-4">
                        <Button onClick={() => setEditState({ mode: 'field' })} className="gap-2 bg-primary hover:bg-primary-dark text-white">
                            <Plus className="w-4 h-4" /> New Field
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {fields.map(field => (
                            <FieldCard 
                                key={field.id} 
                                field={field}
                                onEdit={() => setEditState({ mode: 'field', id: field.id })}
                                onDelete={() => handleDelete('field', field.id)}
                            />
                        ))}
                        {fields.length === 0 && (
                            <div className="card p-8 text-center">
                                <Layers className="w-12 h-12 mx-auto text-text-light dark:text-gray-500 mb-3" />
                                <p className="text-text-light dark:text-gray-400">No fields yet. Create your first field to get started.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            {editState.mode !== 'none' && (
                <EditModal
                    mode={editState.mode}
                    id={editState.id}
                    parentId={editState.parentId}
                    registries={registries}
                    fields={fields}
                    onClose={() => setEditState({ mode: 'none' })}
                    onSaved={() => {
                        setEditState({ mode: 'none' })
                        loadData()
                    }}
                />
            )}
        </div>
    )
}

interface RegistryCardProps {
    registry: SchemaRegistry
    onEdit: () => void
    onDelete: () => void
    onAddItem: () => void
    onEditItem: (id: string) => void
    onDeleteItem: (id: string) => void
}

function RegistryCard({ registry, onEdit, onDelete, onAddItem, onEditItem, onDeleteItem }: RegistryCardProps) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="card card-hover p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-lg text-primary dark:text-white">
                            {registry.display_name}
                        </h3>
                        <span className="px-2 py-0.5 text-xs bg-primary/10 dark:bg-teal-800/50 text-primary dark:text-teal-300 rounded-full font-mono">
                            {registry.registry_key}
                        </span>
                    </div>
                    <p className="text-sm text-text-light dark:text-gray-300">
                        {registry.description}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={onEdit} title="Edit registry" className="text-text-light dark:text-gray-400 hover:text-primary dark:hover:text-white">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDelete} title="Delete registry" className="text-text-light dark:text-gray-400 hover:text-accent dark:hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light dark:text-gray-400">
                        Items ({registry.items?.length || 0})
                    </h4>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onAddItem} className="text-xs gap-1 text-primary dark:text-teal-400 hover:bg-primary/10">
                            <Plus className="w-3 h-3" /> Add Item
                        </Button>
                        {(registry.items?.length || 0) > 4 && (
                            <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary dark:text-teal-400 hover:underline font-medium">
                                {expanded ? 'Show less' : 'Show all'}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {registry.items?.sort((a, b) => a.sort_order - b.sort_order).slice(0, expanded ? undefined : 8).map(item => (
                        <div key={item.id} className="group flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-text dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-600 hover:border-primary/30 dark:hover:border-teal-500/50 transition-colors">
                            <span>{item.display_name}</span>
                            <button 
                                onClick={() => onEditItem(item.id)} 
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-primary/10 rounded ml-0.5"
                            >
                                <Edit2 className="w-2.5 h-2.5 text-primary dark:text-teal-400" />
                            </button>
                            <button 
                                onClick={() => onDeleteItem(item.id)} 
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-accent/10 rounded"
                            >
                                <Trash2 className="w-2.5 h-2.5 text-accent dark:text-red-400" />
                            </button>
                        </div>
                    ))}
                    {(!registry.items || registry.items.length === 0) && (
                        <p className="text-sm text-text-light dark:text-gray-400 italic">No items yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}

interface FieldCardProps {
    field: SchemaField
    onEdit: () => void
    onDelete: () => void
}

function FieldCard({ field, onEdit, onDelete }: FieldCardProps) {
    const version = field.current_version

    return (
        <div className="card card-hover p-5">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-display font-semibold text-lg text-primary dark:text-white">
                            {version?.display_name || field.field_key}
                        </h3>
                        <span className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full font-mono">
                            {field.field_key}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-text-light dark:text-gray-300 rounded-full">
                            v{version?.version}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-light dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <span className="text-xs uppercase font-medium">Type:</span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-text dark:text-gray-200">{version?.field_type}</code>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-xs uppercase font-medium">Applies to:</span>
                            <span className="text-text dark:text-gray-200">{version?.applies_to?.join(', ')}</span>
                        </span>
                        {version?.is_required && (
                            <span className="px-2 py-0.5 text-xs bg-accent/10 dark:bg-red-900/30 text-accent dark:text-red-400 rounded-full font-medium">Required</span>
                        )}
                    </div>
                    {version?.description && (
                        <p className="mt-2 text-sm text-text-light dark:text-gray-400">{version.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={onEdit} title="Edit field" className="text-text-light dark:text-gray-400 hover:text-primary dark:hover:text-white">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDelete} title="Delete field" className="text-text-light dark:text-gray-400 hover:text-accent dark:hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface EditModalProps {
    mode: 'registry' | 'item' | 'field'
    id?: string
    parentId?: string
    registries: SchemaRegistry[]
    fields: SchemaField[]
    onClose: () => void
    onSaved: () => void
}

function EditModal({ mode, id, parentId, registries, fields, onClose, onSaved }: EditModalProps) {
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const { showToast } = useToast()
    const isNew = !id

    useEffect(() => {
        if (id) {
            // Load existing data
            if (mode === 'registry') {
                const reg = registries.find(r => r.id === id)
                if (reg) setFormData({ display_name: reg.display_name, registry_key: reg.registry_key, description: reg.description })
            } else if (mode === 'item') {
                const registry = registries.find(r => r.id === parentId)
                const item = registry?.items?.find(i => i.id === id)
                if (item) setFormData({ display_name: item.display_name, item_key: item.item_key, sort_order: item.sort_order })
            } else if (mode === 'field') {
                const field = fields.find(f => f.id === id)
                if (field) {
                    const v = field.current_version
                    setFormData({ 
                        field_key: field.field_key, 
                        display_name: v?.display_name || '',
                        field_type: v?.field_type || 'text',
                        description: v?.description || '',
                        is_required: v?.is_required || false,
                        applies_to: v?.applies_to || ['article'],
                        registry_id: v?.registry_id || '',
                        options: v?.constraints?.options || []
                    })
                }
            }
        } else {
            // Defaults for new
            if (mode === 'registry') setFormData({ display_name: '', registry_key: '', description: '' })
            else if (mode === 'item') setFormData({ display_name: '', item_key: '', sort_order: 0, registry_id: parentId })
            else if (mode === 'field') setFormData({ field_key: '', display_name: '', field_type: 'text', description: '', is_required: false, applies_to: ['article'], registry_id: '', options: [] })
        }
    }, [id, mode, registries, fields, parentId])

    async function handleSave() {
        // Validation for field constraints
        if (mode === 'field') {
            const fieldType = formData.field_type
            if (FIELD_TYPES_NEEDING_REGISTRY.includes(fieldType) && !formData.registry_id) {
                showToast('Please select a registry for this field type', 'error')
                return
            }
            if (FIELD_TYPES_NEEDING_OPTIONS.includes(fieldType) && (!formData.options || formData.options.length === 0)) {
                showToast('Please add at least one option for this field type', 'error')
                return
            }
            if (!formData.applies_to || formData.applies_to.length === 0) {
                showToast('Please select at least one content type this field applies to', 'error')
                return
            }
        }

        setSaving(true)
        try {
            const action = isNew 
                ? `create_${mode}` 
                : `update_${mode}`

            // Build payload, moving options into constraints for fields
            const payload: any = { action, data: { ...formData } }
            if (mode === 'field') {
                // Move options into constraints object
                if (formData.options && formData.options.length > 0) {
                    payload.data.constraints = { options: formData.options }
                }
                delete payload.data.options
            }
            if (!isNew) payload.data.id = id
            if (mode === 'item' && parentId) payload.data.registry_id = parentId

            const res = await fetch('/api/admin/schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} saved`, 'success')
                onSaved()
            } else {
                const { error } = await res.json()
                showToast(error || 'Save failed', 'error')
            }
        } catch (err) {
            showToast('Save failed', 'error')
        } finally {
            setSaving(false)
        }
    }

    const title = isNew ? `Create ${mode}` : `Edit ${mode}`

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl border border-gray-200 dark:border-dark-border max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-semibold text-primary dark:text-dark-text capitalize">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-text-light hover:text-text">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {mode === 'registry' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Display Name</label>
                                <Input value={formData.display_name || ''} onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Research Domains" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Registry Key</label>
                                <Input value={formData.registry_key || ''} onChange={e => setFormData(p => ({ ...p, registry_key: e.target.value }))} disabled={!isNew} placeholder="e.g. research_domains" className="font-mono" />
                                {isNew && <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">Unique identifier. Cannot be changed after creation.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Description</label>
                                <Textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe this registry..." />
                            </div>
                        </>
                    )}

                    {mode === 'item' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Display Name</label>
                                <Input value={formData.display_name || ''} onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Urban Planning" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Item Key</label>
                                <Input value={formData.item_key || ''} onChange={e => setFormData(p => ({ ...p, item_key: e.target.value }))} disabled={!isNew} placeholder="e.g. urban_planning" className="font-mono" />
                                {isNew && <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">Unique identifier. Cannot be changed after creation.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Sort Order</label>
                                <Input type="number" value={formData.sort_order || 0} onChange={e => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                                <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">Lower numbers appear first.</p>
                            </div>
                        </>
                    )}

                    {mode === 'field' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Field Key</label>
                                <Input value={formData.field_key || ''} onChange={e => setFormData(p => ({ ...p, field_key: e.target.value }))} disabled={!isNew} placeholder="e.g. research_domain" className="font-mono" />
                                {isNew && <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">Unique identifier. Cannot be changed after creation.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Display Name</label>
                                <Input value={formData.display_name || ''} onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Research Domain" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Field Type</label>
                                <select 
                                    value={formData.field_type || 'text'} 
                                    onChange={e => setFormData(p => ({ ...p, field_type: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="date">Date</option>
                                    <option value="datetime">Datetime</option>
                                    <option value="url">URL</option>
                                    <option value="rich_text">Rich Text</option>
                                    <option value="select">Select</option>
                                    <option value="multiselect">Multi-select</option>
                                    <option value="registry_ref">Registry Reference</option>
                                    <option value="registry_ref_multi">Registry Multi-ref</option>
                                    <option value="geo_point">Geo Point</option>
                                    <option value="geo_polygon">Geo Polygon</option>
                                    <option value="json">JSON</option>
                                    <option value="file">File</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">Description</label>
                                <Textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe this field..." />
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                <input 
                                    type="checkbox" 
                                    id="is_required" 
                                    checked={formData.is_required || false} 
                                    onChange={e => setFormData(p => ({ ...p, is_required: e.target.checked }))}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="is_required" className="text-sm text-text dark:text-dark-text font-medium">Required field</label>
                            </div>

                            {/* Applies To - Content Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">Applies To</label>
                                <div className="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                    {CONTENT_TYPES.map(ct => (
                                        <label key={ct} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(formData.applies_to || []).includes(ct)}
                                                onChange={e => {
                                                    const current = formData.applies_to || []
                                                    const updated = e.target.checked
                                                        ? [...current, ct]
                                                        : current.filter((t: string) => t !== ct)
                                                    setFormData(p => ({ ...p, applies_to: updated }))
                                                }}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-text dark:text-dark-text capitalize">{ct}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Registry Picker - Only for registry_ref types */}
                            {FIELD_TYPES_NEEDING_REGISTRY.includes(formData.field_type) && (
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                        Registry <span className="text-accent">*</span>
                                    </label>
                                    {registries.length === 0 ? (
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            No registries available. Create a registry first.
                                        </div>
                                    ) : (
                                        <select
                                            value={formData.registry_id || ''}
                                            onChange={e => setFormData(p => ({ ...p, registry_id: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        >
                                            <option value="">Select a registry...</option>
                                            {registries.map(reg => (
                                                <option key={reg.id} value={reg.id}>
                                                    {reg.display_name} ({reg.registry_key})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Options Editor - Only for select/multiselect types */}
                            {FIELD_TYPES_NEEDING_OPTIONS.includes(formData.field_type) && (
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Options <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {(formData.options || []).map((opt: { value: string; label: string }, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Input
                                                    value={opt.value}
                                                    onChange={e => {
                                                        const opts = [...(formData.options || [])]
                                                        opts[idx] = { ...opts[idx], value: e.target.value }
                                                        setFormData(p => ({ ...p, options: opts }))
                                                    }}
                                                    placeholder="Value (key)"
                                                    className="flex-1"
                                                />
                                                <Input
                                                    value={opt.label}
                                                    onChange={e => {
                                                        const opts = [...(formData.options || [])]
                                                        opts[idx] = { ...opts[idx], label: e.target.value }
                                                        setFormData(p => ({ ...p, options: opts }))
                                                    }}
                                                    placeholder="Label (display)"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const opts = (formData.options || []).filter((_: any, i: number) => i !== idx)
                                                        setFormData(p => ({ ...p, options: opts }))
                                                    }}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const opts = [...(formData.options || []), { value: '', label: '' }]
                                                setFormData(p => ({ ...p, options: opts }))
                                            }}
                                            className="gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Option
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <Button variant="ghost" onClick={onClose} className="text-text-light hover:text-text">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-primary-dark text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
