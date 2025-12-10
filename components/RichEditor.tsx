'use client'

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import {
  commonmark,
  toggleStrongCommand,
  toggleEmphasisCommand,
  wrapInHeadingCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  insertHrCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand
} from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { insert, callCommand } from '@milkdown/utils'
import { createClient } from '@/lib/supabase/client'
import {
  ImagePlus, Loader2, Check, Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link2, Minus, HelpCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  userId?: string
}

// Image upload helper
async function uploadImage(file: File, userId: string): Promise<string | null> {
  const supabase = createClient()

  if (!file.type.startsWith('image/')) {
    console.error('Not an image file')
    return null
  }

  if (file.size > 5 * 1024 * 1024) {
    console.error('Image too large (max 5MB)')
    return null
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `content/${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post_images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('post_images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  }
}

// Toolbar button helper component
interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  onClick: () => void
  disabled?: boolean
}

function ToolbarButton({ icon: Icon, title, onClick, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded-lg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border hover:text-text dark:hover:text-dark-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

// Inner editor component with ref for inserting content
interface MilkdownEditorHandle {
  insertMarkdown: (markdown: string) => void
  runCommand: (command: any, payload?: any) => void
}

const MilkdownEditorInner = forwardRef<MilkdownEditorHandle, RichEditorProps & { onPasteImage?: (file: File) => void }>(
  function MilkdownEditorInner({ value, onChange, placeholder, onPasteImage }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const { get } = useEditor((root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root)
          ctx.set(defaultValueCtx, value)
          ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              onChange(markdown)
            }
          })
        })
        .config(nord)
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener),
      [onChange]
    )

    // Expose insert function and command execution via ref
    useImperativeHandle(ref, () => ({
      insertMarkdown: (markdown: string) => {
        const editor = get()
        if (editor) {
          editor.action(insert(markdown))
        }
      },
      runCommand: (command: any, payload?: any) => {
        const editor = get()
        if (editor) {
          editor.action(callCommand(command, payload))
        }
      }
    }), [get])

    // Handle paste events for images
    useEffect(() => {
      const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            e.preventDefault()
            const file = item.getAsFile()
            if (file && onPasteImage) {
              onPasteImage(file)
            }
            break
          }
        }
      }

      const wrapper = wrapperRef.current
      if (wrapper) {
        wrapper.addEventListener('paste', handlePaste)
        return () => wrapper.removeEventListener('paste', handlePaste)
      }
    }, [onPasteImage])

    return (
      <div ref={wrapperRef}>
        <Milkdown />
      </div>
    )
  }
)

export function RichEditor({ value, onChange, placeholder, userId }: RichEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [lastInsertedImage, setLastInsertedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<MilkdownEditorHandle>(null)
  const { showToast } = useToast()

  // Clear the last inserted image notification after a delay
  useEffect(() => {
    if (lastInsertedImage) {
      const timer = setTimeout(() => setLastInsertedImage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastInsertedImage])

  // Insert image markdown directly into the editor
  const insertImageIntoEditor = useCallback((url: string, altText: string = 'image') => {
    const imageMarkdown = `\n![${altText}](${url})\n`

    // Try to insert directly into editor first
    if (editorRef.current) {
      editorRef.current.insertMarkdown(imageMarkdown)
      setLastInsertedImage(altText)
    } else {
      // Fallback: append to content
      onChange(value + imageMarkdown)
      setLastInsertedImage(altText)
    }
  }, [value, onChange])

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!userId) {
      showToast('Please log in to upload images', 'warning')
      return
    }

    setIsUploading(true)

    try {
      const url = await uploadImage(file, userId)
      if (url) {
        insertImageIntoEditor(url, file.name.split('.')[0])
        showToast('Image inserted!', 'success')
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch (error) {
      showToast('Failed to upload image', 'error')
    } finally {
      setIsUploading(false)
    }
  }, [userId, insertImageIntoEditor, showToast])

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleImageUpload])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = dropZoneRef.current?.getBoundingClientRect()
    if (rect) {
      const { clientX, clientY } = e
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragging(false)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(f => f.type.startsWith('image/'))

    if (imageFile) {
      await handleImageUpload(imageFile)
    }
  }, [handleImageUpload])

  return (
    <div
      ref={dropZoneRef}
      className="rich-editor-wrapper relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Image Upload Button */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {lastInsertedImage && !isUploading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm text-green-700 dark:text-green-400 animate-fade-in">
            <Check className="w-4 h-4" />
            Image added
          </div>
        )}
        {isUploading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-sm text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !userId}
          className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
          title="Insert image"
        >
          <ImagePlus className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center">
          <div className="text-center">
            <ImagePlus className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-lg font-medium text-primary">Drop image here</p>
            <p className="text-sm text-text-light">PNG, JPG, GIF, WEBP up to 5MB</p>
          </div>
        </div>
      )}

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50 rounded-t-xl">
        {/* Headings */}
        <div className="flex items-center border-r border-gray-200 dark:border-dark-border pr-1 mr-1">
          <ToolbarButton
            icon={Heading1}
            title="Heading 1 (Ctrl+Alt+1)"
            onClick={() => editorRef.current?.runCommand(wrapInHeadingCommand.key, 1)}
          />
          <ToolbarButton
            icon={Heading2}
            title="Heading 2 (Ctrl+Alt+2)"
            onClick={() => editorRef.current?.runCommand(wrapInHeadingCommand.key, 2)}
          />
        </div>

        {/* Text formatting */}
        <div className="flex items-center border-r border-gray-200 dark:border-dark-border pr-1 mr-1">
          <ToolbarButton
            icon={Bold}
            title="Bold (Ctrl+B)"
            onClick={() => editorRef.current?.runCommand(toggleStrongCommand.key)}
          />
          <ToolbarButton
            icon={Italic}
            title="Italic (Ctrl+I)"
            onClick={() => editorRef.current?.runCommand(toggleEmphasisCommand.key)}
          />
          <ToolbarButton
            icon={Code}
            title="Inline code"
            onClick={() => editorRef.current?.runCommand(toggleInlineCodeCommand.key)}
          />
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-200 dark:border-dark-border pr-1 mr-1">
          <ToolbarButton
            icon={List}
            title="Bullet list"
            onClick={() => editorRef.current?.runCommand(wrapInBulletListCommand.key)}
          />
          <ToolbarButton
            icon={ListOrdered}
            title="Numbered list"
            onClick={() => editorRef.current?.runCommand(wrapInOrderedListCommand.key)}
          />
        </div>

        {/* Blocks */}
        <div className="flex items-center border-r border-gray-200 dark:border-dark-border pr-1 mr-1">
          <ToolbarButton
            icon={Quote}
            title="Quote"
            onClick={() => editorRef.current?.runCommand(wrapInBlockquoteCommand.key)}
          />
          <ToolbarButton
            icon={Minus}
            title="Horizontal line"
            onClick={() => editorRef.current?.runCommand(insertHrCommand.key)}
          />
        </div>

        {/* Link & Image */}
        <div className="flex items-center">
          <ToolbarButton
            icon={Link2}
            title="Add link to selected text"
            onClick={() => {
              const url = prompt('Enter URL:')
              if (url) {
                editorRef.current?.runCommand(toggleLinkCommand.key, { href: url })
              }
            }}
          />
          <ToolbarButton
            icon={ImagePlus}
            title="Insert image"
            onClick={() => fileInputRef.current?.click()}
            disabled={!userId}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Help tooltip */}
        <div className="relative group">
          <button
            type="button"
            className="p-1.5 rounded-lg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <p className="font-semibold mb-2 text-text dark:text-dark-text">Markdown Tips:</p>
            <ul className="space-y-1 text-text-light dark:text-dark-text-muted">
              <li><code className="bg-gray-100 dark:bg-dark-bg px-1 rounded"># H1</code> <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">## H2</code> for headings</li>
              <li><code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">**bold**</code> <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">*italic*</code></li>
              <li><code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">- item</code> for bullet lists</li>
              <li><code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">[text](url)</code> for links</li>
              <li>Drag & drop or paste images</li>
            </ul>
          </div>
        </div>
      </div>

      <MilkdownProvider>
        <MilkdownEditorInner
          ref={editorRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onPasteImage={handleImageUpload}
        />
      </MilkdownProvider>

      <style jsx global>{`
        .rich-editor-wrapper {
          min-height: 20rem;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .rich-editor-wrapper:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(26, 61, 64, 0.1);
        }
        
        .dark .rich-editor-wrapper {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .dark .rich-editor-wrapper:focus-within {
          border-color: var(--color-primary-light);
          box-shadow: 0 0 0 3px rgba(74, 163, 165, 0.15);
        }
        
        .milkdown {
          position: relative;
          box-sizing: border-box;
        }
        
        .milkdown .editor {
          outline: none;
        }
        
        .milkdown .ProseMirror {
          outline: none;
          padding: 1rem 1.5rem;
          padding-top: 3.5rem;
          min-height: 18rem;
        }

        .milkdown .ProseMirror {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--color-text);
        }
        
        .dark .milkdown .ProseMirror {
          color: var(--color-text);
        }
        
        .milkdown .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--color-primary);
        }
        
        .dark .milkdown .ProseMirror h1 {
          color: var(--color-text);
        }
        
        .milkdown .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--color-primary);
        }
        
        .dark .milkdown .ProseMirror h2 {
          color: var(--color-text);
        }
        
        .milkdown .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .milkdown .ProseMirror p {
          margin-bottom: 1rem;
        }
        
        .milkdown .ProseMirror strong {
          font-weight: 600;
          color: var(--color-text);
        }
        
        .milkdown .ProseMirror em {
          font-style: italic;
        }
        
        .milkdown .ProseMirror code {
          font-family: 'Fira Code', 'SF Mono', Monaco, monospace;
          font-size: 0.875em;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          background: rgba(26, 61, 64, 0.08);
          color: var(--color-accent);
        }
        
        .dark .milkdown .ProseMirror code {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-accent-light);
        }
        
        .milkdown .ProseMirror pre {
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 0.5rem;
          background: #1a1a2e;
          overflow-x: auto;
        }
        
        .milkdown .ProseMirror pre code {
          background: transparent;
          color: #e0e0e0;
          padding: 0;
        }
        
        .milkdown .ProseMirror blockquote {
          border-left: 4px solid var(--color-primary);
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: var(--color-text-light);
          font-style: italic;
          background: rgba(26, 61, 64, 0.04);
          padding: 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .dark .milkdown .ProseMirror blockquote {
          background: rgba(255, 255, 255, 0.03);
          border-left-color: var(--color-primary-light);
        }
        
        .milkdown .ProseMirror ul,
        .milkdown .ProseMirror ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .milkdown .ProseMirror li {
          margin-bottom: 0.5rem;
        }
        
        .milkdown .ProseMirror a {
          color: var(--color-primary);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        
        .milkdown .ProseMirror a:hover {
          border-bottom-color: var(--color-primary);
        }
        
        .dark .milkdown .ProseMirror a {
          color: var(--color-primary-light);
        }
        
        .milkdown .ProseMirror hr {
          border: none;
          height: 1px;
          background: var(--color-border);
          margin: 2rem 0;
        }
        
        .milkdown .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .milkdown .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        .milkdown .ProseMirror th,
        .milkdown .ProseMirror td {
          border: 1px solid var(--color-border);
          padding: 0.75rem;
          text-align: left;
        }
        
        .milkdown .ProseMirror th {
          background: rgba(26, 61, 64, 0.05);
          font-weight: 600;
        }
        
        .dark .milkdown .ProseMirror th {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .milkdown .ProseMirror:empty::before {
          content: attr(data-placeholder);
          color: var(--color-text-muted);
          pointer-events: none;
        }
        
        .milkdown .ProseMirror input[type="checkbox"] {
          width: 1.125rem;
          height: 1.125rem;
          margin-right: 0.5rem;
          accent-color: var(--color-primary);
        }
      `}</style>
    </div>
  )
}

export default RichEditor
