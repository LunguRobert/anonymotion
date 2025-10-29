'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const Aurora = dynamic(() => import('@/components/ui/Aurora'), { ssr: false })

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden isolate">
      {/* Aurora Background (canvas) */}
      <Aurora
        colorStops={[
          '#7f5af0',
          '#ffb5c0',
          '#c084fc'
        ]}
        blend={0.4}
        amplitude={0.6}
        speed={0.5}
      />

      {/* Content over canvas */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-primary drop-shadow-lg leading-tight">
          Share how you feel. <br className="hidden md:inline" />
          Stay anonymous.
        </h1>

        <p className="text-muted mt-4 text-lg md:text-xl max-w-xl">
          A calm space to express emotions and connect — without judgment.
        </p>

        <Link
          href="/feed"
          className="mt-8 inline-block bg-secondary text-inverted font-medium px-6 py-3 rounded-lg hover:bg-primary transition"
        >
          Start journaling
        </Link>
      </div>
    </section>
  )
}
