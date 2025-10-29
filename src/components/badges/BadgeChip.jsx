export default function BadgeChip({ emoji, label, color = 'yellow', className = '' }) {
  const palette = {
    yellow: 'bg-yellow-400/10 border-yellow-400/40 text-yellow-300',
    purple: 'bg-purple-400/10 border-purple-400/40 text-purple-300',
    blue:   'bg-blue-400/10 border-blue-400/40 text-blue-300',
    pink:   'bg-pink-400/10 border-pink-400/40 text-pink-300',
  }
  const base = palette[color] || palette.yellow

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium shadow flex items-center gap-2 border ${base} ${className}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  )
}