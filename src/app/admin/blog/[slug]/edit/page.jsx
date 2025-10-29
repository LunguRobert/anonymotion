// app/admin/blog/[slug]/edit/page.jsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Keep in sync with server util lib/excerpt.js (duplicated for client)
function makeExcerpt(markdown, max = 180) {
  if (!markdown) return ''
  const text = String(markdown)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max).trim() + '…' : text
}
function readingTime(markdown) {
  const words = String(markdown || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : ''
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // form state
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)

  const wordCount = useMemo(() => (content.trim().match(/\S+/g) || []).length, [content])
  const rtime = useMemo(() => readingTime(content), [content])

  // mark dirty on any change
  useEffect(() => {
    if (!loading) setDirty(true)
  }, [title, excerpt, coverImage, tags, content, published, loading])

  // warn on unload if dirty
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // save with Ctrl/Cmd+S
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
  }, [title, excerpt, coverImage, tags, content, published])

  // load post
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        // Prefer a GET by slug that returns drafts too
        const r = await fetch(`/api/blog/${slug}?draft=1`, { cache: 'no-store' })
        if (!r.ok) throw new Error('not ok')
        const p = await r.json()
        if (!active) return
        setTitle(p.title || '')
        setExcerpt(p.excerpt || '')
        setCoverImage(p.coverImage || '')
        setTags(Array.isArray(p.tags) ? p.tags : [])
        setContent(p.content || '')
        setPublished(!!p.published)
      } catch {
        // Fallback: try listing with drafts and pick by slug
        try {
          const adminRes = await fetch(`/api/blog?limit=200&draft=1`, { cache: 'no-store' })
          const data = await adminRes.json()
          const p = (data?.items || []).find(x => x.slug === slug)
          if (p) {
            // If content missing, try an admin endpoint if you have one
            const raw = await fetch(`/api/admin/blog/${slug}`, { cache: 'no-store' }).then(x => x.ok ? x.json() : p).catch(() => p)
            setTitle(raw.title || '')
            setExcerpt(raw.excerpt || '')
            setCoverImage(raw.coverImage || '')
            setTags(Array.isArray(raw.tags) ? raw.tags : [])
            setContent(raw.content || '')
            setPublished(!!raw.published)
          }
        } catch {}
      } finally {
        if (active) {
          setLoading(false)
          setDirty(false)
        }
      }
    }
    if (slug) load()
    return () => { active = false }
  }, [slug])

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
  function removeTag(t) { setTags(prev => prev.filter(x => x !== t)) }

  const handleSave = useCallback(async ({ publish }) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.')
      return
    }
    setSaving(true)
    try {
      const finalExcerpt = excerpt.trim() ? excerpt.trim() : makeExcerpt(content, 180)
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: finalExcerpt,
          coverImage: coverImage.trim(),
          tags,
          content,
          published: publish ?? published,
        })
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setDirty(false)
      // If server regenerated slug from new title
      if (data.post?.slug && data.post.slug !== slug) {
        router.replace(`/admin/blog/${data.post.slug}/edit`)
      } else {
        // refresh current page data
        router.refresh?.()
      }
      alert('Saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [slug, title, excerpt, coverImage, tags, content, published, router])

  async function removePost() {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      router.push('/admin/blog')
    } catch {
      alert('Failed to delete')
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-secondary bg-card p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 bg-surface rounded" />
            <div className="h-8 w-full bg-surface rounded" />
            <div className="h-8 w-2/3 bg-surface rounded" />
            <div className="h-40 w-full bg-surface rounded" />
          </div>
        </div>
      </main>
    )
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : `/blog/${slug}`

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-secondary bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-3 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-secondary px-2 py-1 text-xs text-muted">Edit</span>
            <span className="text-inverted font-semibold">Edit post</span>
            <span className="text-muted text-xs">· {wordCount} words · {rtime} min read</span>
            {saving ? <span className="text-muted text-xs">· Saving…</span> : dirty ? <span className="text-muted text-xs">· Unsaved changes</span> : <span className="text-muted text-xs">· All changes saved</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/blog" className="rounded-full border border-secondary px-3 py-1.5 text-sm text-inverted hover:bg-card transition">Back</Link>
            {published ? (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-secondary px-3 py-1.5 text-sm text-inverted hover:bg-card transition">View</a>
            ) : null}
            <button
              disabled={saving}
              onClick={() => handleSave({ publish: false })}
              className="rounded-full border border-secondary px-4 py-1.5 text-sm text-inverted hover:bg-card transition disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              disabled={saving}
              onClick={() => handleSave({ publish: !published })}
              className="rounded-full bg-primary px-4 py-1.5 text-sm text-inverted hover:opacity-90 transition disabled:opacity-50"
            >
              {published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={removePost}
              className="rounded-full border border-secondary px-4 py-1.5 text-sm text-inverted hover:bg-card transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: Form */}
        <section className="rounded-3xl border border-secondary bg-card p-6">
          <h1 className="text-xl font-semibold text-inverted mb-4">Update your article</h1>

          {/* Title */}
          <label className="block text-sm text-inverted mb-2">Title</label>
          <input
            className="w-full rounded-lg border border-secondary bg-surface px-3 py-2 text-inverted placeholder:text-muted"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Concise, compelling title"
          />
          <div className="mt-1 text-xs text-muted">Aim for 50–65 characters.</div>

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

          {/* Bottom actions */}
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
              onClick={() => handleSave({ publish: !published })}
              className="rounded-full bg-primary px-4 py-2 text-sm text-inverted hover:opacity-90 transition disabled:opacity-50"
            >
              {published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={removePost}
              className="rounded-full border border-secondary px-4 py-2 text-sm text-inverted hover:bg-card transition"
            >
              Delete
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
              {tags.length ? <span>{tags.slice(0, 3).map(t => `#${t}`).join(' · ')}</span> : 'Add a few tags for structure'}
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

          {/* Public link helper */}
          <div className="mt-6 rounded-2xl border border-secondary bg-surface p-4">
            <div className="text-sm text-muted">
              Public URL: <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="underline text-inverted">{publicUrl}</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
