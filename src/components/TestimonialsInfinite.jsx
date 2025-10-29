'use client'

import React from "react"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

export default function TestimonialsInfinite() {
  const testimonials = [
    {
      quote: "I finally said things I couldn't even tell my therapist.",
      name: "Anonymous User #132",
      title: "Posted 2 days ago"
    },
    {
      quote: "This space feels like a soft whisper when the world screams.",
      name: "Anonymous User #219",
      title: "Posted 1 week ago"
    },
    {
      quote: "It’s just comforting to know someone reads what I write.",
      name: "Anonymous User #448",
      title: "Posted today"
    },
    {
      quote: "I cried and wrote. Nobody judged me. That’s rare.",
      name: "Anonymous User #312",
      title: "Posted 3 days ago"
    },
    {
      quote: "No filters. Just raw thoughts. Thank you for this space.",
      name: "Anonymous User #017",
      title: "Posted last night"
    },
    {
      quote: "Writing here is like talking to a warm void that listens.",
      name: "Anonymous User #509",
      title: "Posted 5 hours ago"
    },
  ]

  return (
    <section className="relative py-24 bg-background">
    <div className="max-w-7xl mx-auto px-4">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-text mb-6">
          What users are sharing...
        </h2>
        <p className="text-muted text-base md:text-lg mb-12">
          Real anonymous posts from our community. Honest, raw, and safe.
        </p>
      </div>

      <div className="h-[26rem] rounded-md flex items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
    </section>
  )
}
