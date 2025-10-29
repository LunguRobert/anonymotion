// components/LogoPng.jsx
import Link from 'next/link'

export default function LogoPng() {
return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2"
      aria-label="Anonymotion home"
    >
      {/* Mark (PNG @1x/2x/3x) */}
      <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-secondary/60 bg-card/60">
        <img
          src="/logo-32.png"
          srcSet="/logo-32.png 1x, /logo-64.png 2x, /logo-96.png 3x"
          alt=""
          className="h-full w-full object-contain"
          decoding="async"
          loading="eager"
        />
        {/* subtil ring la hover (fără animații grele) */}
        <i
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[0.8rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            padding: "2px",
            background:
              "conic-gradient(from 0deg, rgba(34,211,238,.30), rgba(192,132,252,.30), rgba(249,168,212,.24), rgba(34,211,238,.30))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </span>

      {/* Wordmark ca text (rămâne mereu crisp) */}
      <span className="font-bold tracking-tight text-inverted">
        Anonymotion
      </span>
    </Link>
  );
}
