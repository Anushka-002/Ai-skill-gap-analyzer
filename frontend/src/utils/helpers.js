/** Map profile strength to a hex color */
export function strengthColor(s) {
  return { 
    Excellent: '#10b981', 
    Strong: '#4f5eff', 
    Good: '#f59e0b', 
    Fair: '#f97316', 
    Weak: '#f43f5e' 
  }[s] ?? '#888'
}

/** Map gap priority to CSS class name */
export function priorityClass(p) {
  return { 
    critical: 'badge-critical', 
    important: 'badge-important', 
    'nice-to-have': 'badge-nice' 
  }[p] ?? 'badge-nice'
}

/** Compute level from total XP */
export function xpToLevel(xp = 0) {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

/** XP required to reach next level */
export function xpForNextLevel(level) {
  return level * level * 50
}

/** Pretty-print a number to 1 decimal */
export function fmt(n) {
  return typeof n === 'number' ? n.toFixed(1) : (n ?? '—')
}

/** Format an ISO date string to readable label */
export function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

/** Capitalise first letter of every word */
export function titleCase(str = '') {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}