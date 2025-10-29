// app/sitemap.js
import prisma from "@/lib/prisma";

export const revalidate = 3600; // 1h

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://anonymotions.com";

  const staticRoutes = [
    "", "feed", "blog", "user", // adaugă/ajustează după site
  ].map((p) => ({
    url: `${base}/${p}`.replace(/\/+$/, "/"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // extrage ultimele articole publice
  let posts = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 500,
    });
  } catch {}

  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
