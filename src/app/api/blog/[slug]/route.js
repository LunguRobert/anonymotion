// src/app/api/blog/[slug]/route.js (sau calea ta reală)
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isAdminEmail } from '@/lib/authz';
import { slugify } from '@/lib/slugify';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/same-origin';

// GET /api/blog/:slug  (public: doar published)
export async function GET(_req, ctx) {
  try {
    const { slug } = await ctx.params;          // 👈 Next 15: await
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.published) {
      // doar articolele publicate sunt vizibile pe ruta publică
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    console.error('GET /api/blog/[slug] failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/blog/:slug  (admin)
export async function PUT(req, ctx) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  try {
    const session = await getServerSession(authOptions);
    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { slug } = await ctx.params;          // 👈 await
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const {
      title = existing.title,
      content = existing.content,
      excerpt = existing.excerpt || '',
      coverImage = existing.coverImage || '',
      tags = existing.tags || [],
      published = existing.published,
    } = body || {};

    // Regenerează slug dacă s-a schimbat titlul
    let newSlug = existing.slug;
    if (title && title !== existing.title) {
      const base = slugify(title);
      newSlug = base;
      let i = 1;
      // evită coliziuni; permite același slug dacă este chiar articolul curent
      while (true) {
        const conflict = await prisma.blogPost.findUnique({ where: { slug: newSlug } });
        if (!conflict || conflict.id === existing.id) break;
        newSlug = `${base}-${i++}`;
      }
    }

    const post = await prisma.blogPost.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        content,
        excerpt,
        coverImage,
        tags,
        published,
        publishedAt: published ? (existing.publishedAt || new Date()) : null,
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error('PUT /api/blog/[slug] failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/blog/:slug  (admin)
export async function DELETE(req, ctx) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  try {
    const session = await getServerSession(authOptions);
    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { slug } = await ctx.params;          // 👈 await
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    await prisma.blogPost.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/blog/[slug] failed:', err);
    // dacă nu există deja: 404
    if (String(err?.code) === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
