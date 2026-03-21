import React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { strengthColor } from '../utils/helpers'
import { ArrowRight, Brain, History, Search, Map, ChevronDown } from 'lucide-react'

const titleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function MiniGauge({ score, color }) {
  const r = 20; const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <svg viewBox="0 0 48 48" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 11, color,
      }}>
        {score}%
      </div>
    </div>
  )
}

function HistoryCard({ item, index }) {
  const [open, setOpen] = useState(false)
  const color = strengthColor(item.profile_strength)

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.075)', marginBottom: 12 }}>

      {/* Card header row */}
      <div onClick={() => setOpen(o => !o)} style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
        transition: 'background 0.18s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <MiniGauge score={item.match_score} color={color} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'white' }}>
              {titleCase(item.job_role_id)}
            </h3>
            <span style={{
              fontSize: 11, padding: '2px 9px', borderRadius: 7, fontWeight: 600,
              background: `${color}18`, color, border: `1px solid ${color}35`,
            }}>
              {item.profile_strength}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>
              {fmtDate(item.created_at)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
              ATS <span style={{ color: 'rgba(255,255,255,0.55)' }}>{item.ats_score}</span>
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
              Gaps <span style={{ color: '#f43f5e' }}>{item.gap_count}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to={`/results/${item.id}`} onClick={e => e.stopPropagation()} className="btn-ghost"
            style={{ fontSize: 12, padding: '6px 14px' }}>
            Results <ArrowRight size={12} />
          </Link>
          <ChevronDown size={15} color="rgba(255,255,255,0.28)"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ padding: '14px 20px 18px', borderTop: '1px solid rgba(255,255,255,0.065)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 28 }}>
                  {[
                    { label: 'ATS Score',   val: item.ats_score,   c: '#4f5eff' },
                    { label: 'Match Score', val: item.match_score,  c: color     },
                    { label: 'Gaps',        val: item.gap_count,    c: '#f43f5e' },
                  ].map(({ label, val, c }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: c }}>{val}{label !== 'Gaps' ? '%' : ''}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <Link to={`/roadmap/${item.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, padding: '7px 14px', borderRadius: 10, textDecoration: 'none',
                  background: 'rgba(79,94,255,0.12)', color: '#818cf8', border: '1px solid rgba(79,94,255,0.28)',
                }}>
                  <Map size={12} /> View Roadmap
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistoryPage() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    api.get('/analysis/history')
      .then(r => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(it =>
    it.job_role_id?.toLowerCase().includes(search.toLowerCase()) ||
    it.profile_strength?.toLowerCase().includes(search.toLowerCase())
  )

  const avg = items.length
    ? (items.reduce((s, a) => s + a.match_score, 0) / items.length).toFixed(1)
    : null

  return (
    <div style={{ padding: '36px 40px', maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white', marginBottom: 4 }}>
          Analysis History
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)' }}>
          All your past resume analyses
        </p>
      </motion.div>

      {/* Search */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by role or strength…" className="input-glass"
            style={{ paddingLeft: 38 }} />
        </motion.div>
      )}

      {/* Meta bar */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
          {avg && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: 5 }}>
              Overall avg: <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{avg}%</span>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 88 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
          <History size={42} color="rgba(255,255,255,0.1)" style={{ marginBottom: 14 }} />
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 8 }}>
            {search ? 'No results found' : 'No analyses yet'}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 24 }}>
            {search ? 'Try a different search term' : 'Run your first analysis to see results here'}
          </p>
          {!search && (
            <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex' }}>
              <Brain size={16} /> Start Analysis
            </Link>
          )}
        </motion.div>
      ) : (
        <div>
          {filtered.map((item, i) => <HistoryCard key={item.id} item={item} index={i} />)}
        </div>
      )}
    </div>
  )
}