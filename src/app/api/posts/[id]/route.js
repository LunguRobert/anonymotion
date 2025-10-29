// app/api/posts/[id]/route.js
export const runtime = 'nodejs';

import { enforceRateLimit } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

export async function GET(req, ctx) {
  const limited = await enforceRateLimit(req, "common");
  if (limited) return limited;

  // ⬇️ Next 15: params este async
  const { id } = await ctx.params;

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { reactions: true },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    return Response.json(post);
  } catch (err) {
    console.error("GET /api/posts/[id] error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
