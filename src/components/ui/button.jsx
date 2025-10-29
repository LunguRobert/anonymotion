// components/ui/WowButton.jsx
'use client'

import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  onClick,
  icon: Icon,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`relative px-5 py-2 rounded-full font-semibold text-white bg-white/10 border border-white/20 backdrop-blur
        hover:bg-pink-500/20 hover:border-pink-400 shadow-md
        transition-all duration-300 flex items-center gap-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}`}
      {...props}
    >
      {/* Glow effect on hover */}
      <span className="absolute inset-0 bg-pink-500/20 blur-lg opacity-0 hover:opacity-100 transition duration-500 rounded-full pointer-events-none" />

      {/* Icon or Loader */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin z-10" />
      ) : (
        Icon && <Icon className="w-4 h-4 z-10" />
      )}

      {/* Label */}
      <span className="z-10">{children}</span>
    </button>
  )
}
