import { Filter } from 'bad-words'

const filter = new Filter()

filter.addWords(
  'kill', 'suicide', 'die', 'hate', 'idiot', 'stupid',
  'unalive', 'kys', 'dumb', 'retard', 'stfu'
)

const regexPatterns = [
  /k[^\w]?i[^\w]?l[^\w]?l/i,
  /s[^\w]?u[^\w]?i[^\w]?c[^\w]?i[^\w]?d[^\w]?e/i,
]

export function containsBadWords(text) {
  if (filter.isProfane(text)) return true
  return regexPatterns.some((rx) => rx.test(text))
}
