// components/PostFilter.jsx
'use client'

export default function PostFilter({ filter, setFilter, setPosts }) {
  const options = [
    { label: 'ANXIOUS', file: '/emotions/anxious.webp' },
    { label: 'NEUTRAL', file: '/emotions/neutral.webp' },
    { label: 'HAPPY',   file: '/emotions/happy.webp' },
    { label: 'ANGRY',   file: '/emotions/angry.webp' },
    { label: 'SAD',     file: '/emotions/sad.webp' },
  ]

  function toggle(lab) {
    const active = filter === lab
    setFilter(active ? '' : lab)
    setPosts([])
  }

  return (
    <div className="relative">
      {/* horizontal compact bar; labels appear from sm+ */}
      <div className="no-scrollbar justify-center mx-auto flex w-full max-w-full items-center gap-2 overflow-x-auto px-1 py-1.5 sm:justify-center">
        <button
          onClick={() => toggle('')}
          className={`shrink-0 rounded-full border px-2 py-1 text-[11px] transition sm:px-3 sm:py-1.5 sm:text-xs ${
            !filter ? 'border-secondary bg-card text-inverted' : 'border-secondary text-muted hover:bg-card'
          }`}
          aria-pressed={!filter}
        >
          All
        </button>

        {options.map(({ label, file }) => {
          const active = filter === label
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition sm:gap-2 sm:px-2.5 sm:py-1.5 sm:text-xs ${
                active ? 'border-secondary bg-card text-inverted' : 'border-secondary text-muted hover:bg-card'
              }`}
              title={label}
              aria-pressed={active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file} alt={`${label} icon`} className="h-5 w-5 object-contain sm:h-6 sm:w-6" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
