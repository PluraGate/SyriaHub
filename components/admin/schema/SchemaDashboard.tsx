'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
    const t = useTranslations('Admin')
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
        if (!confirm(t(`schemaRegistry.${type}.deleteConfirm`))) return

        try {
            const res = await fetch('/api/admin/schema', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id })
            })

            if (res.ok) {
                showToast(t(`schemaRegistry.${type}.deleted`), 'success')
                loadData()
            } else {
                const { error } = await res.json()
                showToast(error || t('schemaRegistry.actions.deleteFailed'), 'error')
            }
        } catch (err) {
            showToast(t('schemaRegistry.actions.deleteFailed'), 'error')
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
                            {t('schemaRegistry.title')}
                        </h1>
                        <p className="text-sm text-text-light dark:text-gray-400">
                            {t('schemaRegistry.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="registries" className="w-full">
                <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <TabsTrigger value="registries" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white rounded-md px-4 py-2">
                        <Database className="w-4 h-4" />
                        {t('schemaRegistry.tabs.registries')}
                    </TabsTrigger>
                    <TabsTrigger value="fields" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white rounded-md px-4 py-2">
                        <Layers className="w-4 h-4" />
                        {t('schemaRegistry.tabs.fields')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="registries">
                    <div className="mb-4">
                        <Button onClick={() => setEditState({ mode: 'registry' })} className="gap-2 bg-primary hover:bg-primary-dark text-white">
                            <Plus className="w-4 h-4" /> {t('schemaRegistry.newRegistry')}
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
                                <p className="text-text-light dark:text-gray-400">{t('schemaRegistry.noRegistries')}</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="fields">
                    <div className="mb-4">
                        <Button onClick={() => setEditState({ mode: 'field' })} className="gap-2 bg-primary hover:bg-primary-dark text-white">
                            <Plus className="w-4 h-4" /> {t('schemaRegistry.newField')}
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
                                <p className="text-text-light dark:text-gray-400">{t('schemaRegistry.noFields')}</p>
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
    const t = useTranslations('Admin')
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
                        {t('schemaRegistry.registry.items')} ({registry.items?.length || 0})
                    </h4>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onAddItem} className="text-xs gap-1 text-primary dark:text-teal-400 hover:bg-primary/10">
                            <Plus className="w-3 h-3" /> {t('schemaRegistry.registry.addItem')}
                        </Button>
                        {(registry.items?.length || 0) > 4 && (
                            <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary dark:text-teal-400 hover:underline font-medium">
                                {expanded ? t('schemaRegistry.registry.showLess') : t('schemaRegistry.registry.showAll')}
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
                        <p className="text-sm text-text-light dark:text-gray-400 italic">{t('schemaRegistry.registry.noItems')}</p>
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
    const t = useTranslations('Admin')
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
                            <span className="text-xs uppercase font-medium">{t('schemaRegistry.field.type')}:</span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-text dark:text-gray-200">{t(`schemaRegistry.types.${version?.field_type}`)}</code>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-xs uppercase font-medium">{t('schemaRegistry.field.appliesTo')}:</span>
                            <span className="text-text dark:text-gray-200">{version?.applies_to?.map(ct => t(`schemaRegistry.contentTypes.${ct}`)).join(', ')}</span>
                        </span>
                        {version?.is_required && (
                            <span className="px-2 py-0.5 text-xs bg-accent/10 dark:bg-red-900/30 text-accent dark:text-red-400 rounded-full font-medium">{t('schemaRegistry.field.required')}</span>
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
    const t = useTranslations('Admin')
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
                showToast(t('schemaRegistry.field.errors.registry'), 'error')
                return
            }
            if (FIELD_TYPES_NEEDING_OPTIONS.includes(fieldType) && (!formData.options || formData.options.length === 0)) {
                showToast(t('schemaRegistry.field.errors.options'), 'error')
                return
            }
            if (!formData.applies_to || formData.applies_to.length === 0) {
                showToast(t('schemaRegistry.field.errors.appliesTo'), 'error')
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
                showToast(t(`schemaRegistry.${mode}.saved`), 'success')
                onSaved()
            } else {
                const { error } = await res.json()
                showToast(error || t('schemaRegistry.actions.saveFailed'), 'error')
            }
        } catch (err) {
            showToast(t('schemaRegistry.actions.saveFailed'), 'error')
        } finally {
            setSaving(false)
        }
    }

    const title = isNew
        ? t(`schemaRegistry.${mode}.create`)
        : t(`schemaRegistry.${mode}.edit`)

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
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.registry.displayName')}</label>
                                <Input value={formData.display_name || ''} onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Research Domains" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.registry.key')}</label>
                                <Input value={formData.registry_key || ''} onChange={e => setFormData(p => ({ ...p, registry_key: e.target.value }))} disabled={!isNew} placeholder="e.g. research_domains" className="font-mono" />
                                {isNew && <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">{t('schemaRegistry.registry.keyHint')}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.registry.description')}</label>
                                <Textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe this registry..." />
                            </div>
                        </>
                    )}

                    {mode === 'item' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.item.displayName')}</label>
                                <Input value={formData.display_name || ''} onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Urban Planning" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.item.key')}</label>
                                <Input value={formData.item_key || ''} onChange={e => setFormData(p => ({ ...p, item_key: e.target.value }))} disabled={!isNew} placeholder="e.g. urban_planning" className="font-mono" />
                                {isNew && <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">{t('schemaRegistry.item.keyHint')}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.item.sortOrder')}</label>
                                <Input type="number" value={formData.sort_order || 0} onChange={e => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                                <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">{t('schemaRegistry.item.sortOrderHint')}</p>
                            </div>
                        </>
                    )}

                    {mode === 'field' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.field.key')}</label>
                                <Input value={formData.field_key || ''} onChange={e => setFormData(p => ({ ...p, field_key: e.target.value }))} disabled={!isNew} placeholder="e.g. research_domain" className="font-mono" />
                                {isNew && <p className="mt-1 text-xs text-text-light dark:text-dark-text-muted">{t('schemaRegistry.field.keyHint')}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.field.displayName')}</label>
                                <Input value={formData.display_name || ''} onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. Research Domain" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.field.type')}</label>
                                <select
                                    value={formData.field_type || 'text'}
                                    onChange={e => setFormData(p => ({ ...p, field_type: e.target.value }))}
                                    className="select-input"
                                >
                                    <option value="text">{t('schemaRegistry.types.text')}</option>
                                    <option value="number">{t('schemaRegistry.types.number')}</option>
                                    <option value="boolean">{t('schemaRegistry.types.boolean')}</option>
                                    <option value="date">{t('schemaRegistry.types.date')}</option>
                                    <option value="datetime">{t('schemaRegistry.types.datetime')}</option>
                                    <option value="url">{t('schemaRegistry.types.url')}</option>
                                    <option value="rich_text">{t('schemaRegistry.types.rich_text')}</option>
                                    <option value="select">{t('schemaRegistry.types.select')}</option>
                                    <option value="multiselect">{t('schemaRegistry.types.multiselect')}</option>
                                    <option value="registry_ref">{t('schemaRegistry.types.registry_ref')}</option>
                                    <option value="registry_ref_multi">{t('schemaRegistry.types.registry_ref_multi')}</option>
                                    <option value="geo_point">{t('schemaRegistry.types.geo_point')}</option>
                                    <option value="geo_polygon">{t('schemaRegistry.types.geo_polygon')}</option>
                                    <option value="json">{t('schemaRegistry.types.json')}</option>
                                    <option value="file">{t('schemaRegistry.types.file')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">{t('schemaRegistry.field.description')}</label>
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
                                <label htmlFor="is_required" className="text-sm text-text dark:text-dark-text font-medium">{t('schemaRegistry.field.required')}</label>
                            </div>

                            {/* Applies To - Content Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">{t('schemaRegistry.field.appliesTo')}</label>
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
                                            <span className="text-sm text-text dark:text-dark-text capitalize">{t(`schemaRegistry.contentTypes.${ct}`)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Registry Picker - Only for registry_ref types */}
                            {FIELD_TYPES_NEEDING_REGISTRY.includes(formData.field_type) && (
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-1.5">
                                        {t('schemaRegistry.field.registry')} <span className="text-accent">*</span>
                                    </label>
                                    {registries.length === 0 ? (
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {t('schemaRegistry.noRegistries')}
                                        </div>
                                    ) : (
                                        <select
                                            value={formData.registry_id || ''}
                                            onChange={e => setFormData(p => ({ ...p, registry_id: e.target.value }))}
                                            className="select-input"
                                        >
                                            <option value="">{t('schemaRegistry.types.select')}...</option>
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
                                        {t('schemaRegistry.field.options')} <span className="text-red-500">*</span>
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
                                                    placeholder={t('schemaRegistry.field.value')}
                                                    className="flex-1"
                                                />
                                                <Input
                                                    value={opt.label}
                                                    onChange={e => {
                                                        const opts = [...(formData.options || [])]
                                                        opts[idx] = { ...opts[idx], label: e.target.value }
                                                        setFormData(p => ({ ...p, options: opts }))
                                                    }}
                                                    placeholder={t('schemaRegistry.field.label')}
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
                                            <Plus className="w-3 h-3" /> {t('schemaRegistry.field.addOption')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <Button variant="ghost" onClick={onClose} className="text-text-light hover:text-text">{t('schemaRegistry.actions.cancel')}</Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-primary-dark text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? t('schemaRegistry.actions.saving') : t('schemaRegistry.actions.save')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
