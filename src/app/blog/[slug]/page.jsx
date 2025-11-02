// app/blog/[slug]/page.jsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import prisma from '@/lib/prisma'

export const revalidate = 60

async function getPost(slug) {
  return prisma.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      tags: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  })
}

export default async function BlogPostPage(props) {
  const { params } = props
  const { slug } = await params

  if (!slug || typeof slug !== 'string') return notFound()

  let post = null
  try {
    post = await getPost(slug)
  } catch (e) {
    console.error('BLOG_FETCH_ERROR', slug, e)
    return notFound()
  }
  if (!post || !post.published) return notFound()

  const title   = (post.title || 'Untitled').trim()
  const excerpt = (post.excerpt || '').trim()
  const content = typeof post.content === 'string' ? post.content : ''
  const tags    = Array.isArray(post.tags) ? post.tags.filter(Boolean) : []
  const dateISO = (post.publishedAt || post.createdAt)?.toISOString?.() || ''
  const cover   = (post.coverImage && /^https?:\/\//.test(post.coverImage))
    ? post.coverImage
    : '/images/blog/placeholder.jpg'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER / HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
        <div className="glow-lamp absolute inset-0" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-inverted">
            {title}
          </h1>

          {excerpt ? (
            <p className="mt-2 text-sm text-muted max-w-2xl">{excerpt}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
            {dateISO ? (
              <time dateTime={dateISO}>
                {new Date(dateISO).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            ) : null}
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Cover image */}
          <figure className="mt-6">
            <Image
              src={cover}
              alt={title}
              width={1200}
              height={630}
              className="w-full h-auto rounded-2xl border border-secondary bg-card object-cover"
              priority
            />
          </figure>
        </div>
      </section>

      {/* ARTICLE BODY */}
      <section className="rounded-3xl border border-secondary bg-card p-6 sm:p-8 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (props) => (
              <h2 {...props} className="mt-8 text-2xl font-semibold text-inverted" />
            ),
            h2: (props) => (
              <h3 {...props} className="mt-7 text-xl font-semibold text-inverted" />
            ),
            h3: (props) => (
              <h4 {...props} className="mt-6 text-lg font-semibold text-inverted" />
            ),
            p: (props) => (
              <p {...props} className="mt-3 text-sm leading-7 text-white/90" />
            ),
            ul: (props) => (
              <ul
                {...props}
                className="mt-3 list-disc pl-5 text-sm text-white/90 space-y-1.5"
              />
            ),
            ol: (props) => (
              <ol
                {...props}
                className="mt-3 list-decimal pl-5 text-sm text-white/90 space-y-1.5"
              />
            ),
            a: (props) => (
              <a
                {...props}
                className="underline decoration-white/40 hover:decoration-white text-white/90"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            blockquote: (props) => (
              <blockquote
                {...props}
                className="mt-4 border-l-2 border-white/20 pl-4 text-white/80 italic"
              />
            ),
            code: (props) => (
              <code
                {...props}
                className="rounded bg-white/10 px-1 py-0.5 text-[13px]"
              />
            ),
            pre: (props) => (
              <pre
                {...props}
                className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 text-sm"
              />
            ),
            hr: (props) => <hr {...props} className="my-6 border-white/10" />,
            table: (props) => (
              <div className="mt-4 overflow-x-auto">
                <table {...props} className="w-full text-sm" />
              </div>
            ),
            th: (props) => (
              <th
                {...props}
                className="border-b border-white/10 px-3 py-2 text-left font-semibold text-white/90"
              />
            ),
            td: (props) => (
              <td
                {...props}
                className="border-b border-white/5 px-3 py-2 text-white/80"
              />
            ),
          }}
        >
          {content || '_No content available yet._'}
        </ReactMarkdown>
      </section>
    </div>
  )
}
