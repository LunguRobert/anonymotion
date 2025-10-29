// app/admin/blog/new/page.jsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

// Keep in sync with server util lib/excerpt.js (duplicated here for client use)
function makeExcerpt(markdown, max = 180) {
  if (!markdown) return ''
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')                // remove code blocks
    .replace(/`[^`]*`/g, '')                       // remove inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')          // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')       // links → text
    .replace(/[#>*_~\-]+/g, ' ')                   // markdown symbols
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max).trim() + '…' : text
}

function readingTime(markdown) {
  const words = String(markdown || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const wordCount = useMemo(() => (content.trim().match(/\S+/g) || []).length, [content])
  const rtime = useMemo(() => readingTime(content), [content])

  // Mark dirty on any change
  useEffect(() => {
    setDirty(true)
  }, [title, excerpt, coverImage, tags, content])

  // Warn on unload if dirty
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = '' // some browsers need this
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Save with Ctrl/Cmd+S
  useEffect(() => {
    const onKey = (e) => {
      const s = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'
      if (s) {
        e.preventDefault()
        handleSave({ publish: false })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [title, excerpt, coverImage, tags, content])

  function addTagFromInput() {
    const raw = tagInput.split(',').map(s => s.trim()).filter(Boolean)
    if (!raw.length) return
    setTags(prev => {
      const set = new Set(prev)
      raw.forEach(t => set.add(t))
      return Array.from(set)
    })
    setTagInput('')
  }

  function removeTag(t) {
    setTags(prev => prev.filter(x => x !== t))
  }

  const handleSave = useCallback(async ({ publish }) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.')
      return
    }
    setSaving(true)
    try {
      const finalExcerpt = excerpt.trim() ? excerpt.trim() : makeExcerpt(content, 180)
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: finalExcerpt,
          coverImage: coverImage.trim(),
          tags,
          content,
          published: !!publish,
        })
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setDirty(false)
      router.push(`/admin/blog/${data.post.slug}/edit`)
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [title, excerpt, coverImage, tags, content, router])

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-secondary bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-secondary px-2 py-1 text-xs text-muted">New</span>
            <span className="text-inverted font-semibold">New post</span>
            <span className="text-muted text-xs">
              · {wordCount} words · {rtime} min read
            </span>
            {saving ? <span className="text-muted text-xs">· Saving…</span> : dirty ? <span className="text-muted text-xs">· Unsaved changes</span> : <span className="text-muted text-xs">· All changes saved</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/blog" className="rounded-full border border-secondary px-3 py-1.5 text-sm text-inverted hover:bg-card transition">Back</Link>
            <button
              disabled={saving}
              onClick={() => handleSave({ publish: false })}
              className="rounded-full border border-secondary px-4 py-1.5 text-sm text-inverted hover:bg-card transition disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              disabled={saving}
              onClick={() => handleSave({ publish: true })}
              className="rounded-full bg-primary px-4 py-1.5 text-sm text-inverted hover:opacity-90 transition disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: Form */}
        <section className="rounded-3xl border border-secondary bg-card p-6">
          <h1 className="text-xl font-semibold text-inverted mb-4">Write your article</h1>

          {/* Title */}
          <label className="block text-sm text-inverted mb-2">Title</label>
          <input
            className="w-full rounded-lg border border-secondary bg-surface px-3 py-2 text-inverted placeholder:text-muted"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Concise, compelling title"
          />
          <div className="mt-1 text-xs text-muted">
            Aim for 50–65 characters (good for SEO snippets).
          </div>

          {/* Excerpt */}
          <label className="block text-sm text-inverted mt-4 mb-2">Excerpt</label>
          <textarea
            className="w-full rounded-lg border border-secondary bg-surface px-3 py-2 text-inverted placeholder:text-muted"
            rows={3}
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="2–3 lines summarizing the key value (optional; auto-generated if left empty)"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-muted">
            <span>Recommended ~160 characters.</span>
            <button
              type="button"
              onClick={() => setExcerpt(makeExcerpt(content, 180))}
              className="rounded-full border border-secondary px-2 py-1 text-xs text-inverted hover:bg-surface transition"
            >
              Generate from content
            </button>
          </div>

          {/* Cover image */}
          <label className="block text-sm text-inverted mt-4 mb-2">Cover image URL</label>
          <input
            className="w-full rounded-lg border border-secondary bg-surface px-3 py-2 text-inverted placeholder:text-muted"
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://…"
          />
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="mt-2 h-36 w-full rounded-lg border border-secondary object-cover" />
          ) : (
            <div className="mt-2 h-36 w-full rounded-lg border border-secondary bg-surface flex items-center justify-center text-xs text-muted">
              Image preview
            </div>
          )}

          {/* Tags */}
          <label className="block text-sm text-inverted mt-4 mb-2">Tags</label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-secondary bg-surface px-3 py-2 text-inverted placeholder:text-muted"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTagFromInput()
                }
              }}
              placeholder="Type a tag and press Enter…"
            />
            <button
              type="button"
              onClick={addTagFromInput}
              className="rounded-lg border border-secondary px-3 py-2 text-inverted hover:bg-card transition"
            >
              Add
            </button>
          </div>
          {tags.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full border border-secondary px-2 py-1 text-xs text-inverted">
                  #{t}
                  <button onClick={() => removeTag(t)} aria-label={`Remove ${t}`} className="text-muted hover:text-inverted">×</button>
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-muted">Example: mindfulness, journaling, anxiety</div>
          )}

          {/* Content */}
          <label className="block text-sm text-inverted mt-4 mb-2">Content (Markdown)</label>
          <textarea
            className="w-full rounded-lg border border-secondary bg-surface px-3 py-2 text-inverted placeholder:text-muted"
            rows={18}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`Use Markdown: 
## Headings
- lists
**bold**, *italic*, links, tables, etc.`}
          />

          {/* Actions bottom (mobile-friendly) */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              disabled={saving}
              onClick={() => handleSave({ publish: false })}
              className="rounded-full border border-secondary px-4 py-2 text-sm text-inverted hover:bg-card transition disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              disabled={saving}
              onClick={() => handleSave({ publish: true })}
              className="rounded-full bg-primary px-4 py-2 text-sm text-inverted hover:opacity-90 transition disabled:opacity-50"
            >
              Publish
            </button>
            <span className="ml-auto text-xs text-muted">
              ⌘/Ctrl+S to save · {wordCount} words · {rtime} min
            </span>
          </div>
        </section>

        {/* RIGHT: Preview */}
        <section className="rounded-3xl border border-secondary bg-card p-6">
          <h2 className="text-xl font-semibold text-inverted mb-2">Live preview</h2>
          <p className="text-xs text-muted mb-4">This is a rough preview. Final rendering matches the public blog page.</p>

          {/* Title preview */}
          <div className="rounded-2xl border border-secondary bg-surface p-4">
            <h1 className="text-2xl font-semibold text-inverted">{title || 'Your title appears here'}</h1>
            <div className="mt-2 text-xs text-muted">
              {tags.length ? (
                <span>{tags.slice(0, 3).map(t => `#${t}`).join(' · ')}</span>
              ) : 'Add a few tags for structure'}
              <span> · {rtime} min read</span>
            </div>
          </div>

          {/* Cover preview */}
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="mt-4 w-full rounded-xl border border-secondary object-cover" />
          ) : (
            <div className="mt-4 h-40 w-full rounded-xl border border-secondary bg-surface flex items-center justify-center text-xs text-muted">
              Cover image placeholder
            </div>
          )}

          {/* Markdown preview */}
          <div className="prose max-w-none mt-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 className="mt-6 text-inverted text-xl font-semibold">{children}</h2>,
                h3: ({ children }) => <h3 className="mt-4 text-inverted text-lg font-semibold">{children}</h3>,
                p:  ({ children }) => <p className="mt-3 text-muted leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mt-3 list-disc pl-6 text-muted">{children}</ul>,
                ol: ({ children }) => <ol className="mt-3 list-decimal pl-6 text-muted">{children}</ol>,
                a:  ({ href, children }) => <a href={href} className="underline decoration-accent/50 underline-offset-4 hover:decoration-accent text-inverted">{children}</a>,
                pre: ({ children }) => <pre className="mt-4 overflow-x-auto rounded-xl border border-secondary bg-surface p-3">{children}</pre>,
                code:({ inline, children }) => inline
                  ? <code className="rounded bg-surface px-1.5 py-0.5 text-inverted">{children}</code>
                  : <code className="text-inverted">{children}</code>,
                hr: () => <hr className="my-6 border-secondary/60" />,
                img: ({ src = '', alt = '' }) => <img src={src} alt={alt} className="my-4 w-full rounded-xl border border-secondary" />,
              }}
            >
              {content || '*Start typing your article…*'}
            </ReactMarkdown>
          </div>
        </section>
      </div>
    </main>
  )
}
