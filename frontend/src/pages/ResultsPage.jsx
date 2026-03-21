import React from 'react'
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import api from '../utils/api'
import { strengthColor } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  CheckCircle2, XCircle, Star, ArrowRight, Map,
  ExternalLink, ChevronDown, ChevronUp, ClipboardList,
  Building2, Sparkles,
} from 'lucide-react'

/* ── Priority helper ───────────────────────────────────────────────── */
const priorityClass = (priority) => {
  switch (priority) {
    case 'critical':    return 'badge-critical'
    case 'important':   return 'badge-warning'
    case 'nice-to-have':return 'badge-success'
    default:            return ''
  }
}

/* ── Animated SVG gauge ─────────────────────────────────────────────── */
function Gauge({ score, label, color }) {
  const r    = 48
  const circ = 2 * Math.PI * r
  const off  = circ - (score / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg viewBox="0 0 108 108" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
          <motion.circle
            cx="54" cy="54" r={r} fill="none"
            stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.25 }}
            style={{ filter: `drop-shadow(0 0 7px ${color}80)` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white' }}>
            {score}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>/100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  )
}

/* ── Expandable gap card ────────────────────────────────────────────── */
function GapCard({ gap, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        borderRadius: 14, overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '13px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <XCircle size={15} color="#f43f5e" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{gap.display}</span>
            <span className={priorityClass(gap.priority)} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
            }}>
              {gap.priority}
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.38)', fontSize: 10 }}>
              {gap.category}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>
            {gap.learn_time} · {gap.learn_hours}h to learn
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.28)' }}>
            {(gap.jd_weight * 100).toFixed(0)}% JD weight
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div style={{ paddingTop: 14 }} />
          {gap.prereqs_have?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11 }}>✅ Prerequisites you have:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {gap.prereqs_have.map(p => <span key={p} className="badge-matched">{p}</span>)}
              </div>
            </div>
          )}
          {gap.prereqs_missing?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11 }}>⚠️ Learn these first:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {gap.prereqs_missing.map(p => <span key={p} className="badge-critical">{p}</span>)}
              </div>
            </div>
          )}
          {gap.resources?.length > 0 && (
            <div>
              <p style={{ fontSize: 11 }}>📚 Resources:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {gap.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={11} /> {r.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ── Eligibility Scan Result Card ───────────────────────────────────── */
function EligibilityResultCard({ scan }) {
  const [open, setOpen] = useState(true)

  const scoreColor = (pct) => {
    if (pct >= 75) return '#10b981'
    if (pct >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const scoreLabel = (pct) => {
    if (pct >= 85) return 'Excellent Fit'
    if (pct >= 70) return 'Strong Match'
    if (pct >= 50) return 'Good Potential'
    if (pct >= 30) return 'Partial Match'
    return 'Needs Work'
  }

  const color = scoreColor(scan.compatibility_score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        borderRadius: 16, overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${color}22`,
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ClipboardList size={16} color={color} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0, fontFamily: 'Syne, sans-serif' }}>
                Eligibility Scan
              </p>
              {scan.companies && (
                <span style={{
                  fontSize: 11, color: '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Building2 size={11} /> {scan.companies}
                </span>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {scan.summary}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Mini score ring */}
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg viewBox="0 0 52 52" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
              <motion.circle
                cx="26" cy="26" r="21" fill="none"
                stroke={color} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 21}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 21 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 21 * (1 - scan.compatibility_score / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'Syne, sans-serif' }}>
                {scan.compatibility_score}%
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color, margin: 0, fontFamily: 'Syne, sans-serif' }}>
              {scoreLabel(scan.compatibility_score)}
            </p>
          </div>

          {open ? <ChevronUp size={15} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={15} color="rgba(255,255,255,0.3)" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ paddingTop: 16 }} />

              {/* Two-column: matched + missing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                {/* Matched */}
                {scan.matched_requirements?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 0.5, marginBottom: 10 }}>
                      ✅ YOU HAVE ({scan.matched_requirements.length})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {scan.matched_requirements.map((req, i) => (
                        <span key={i} style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11,
                          background: 'rgba(16,185,129,0.1)', color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing */}
                {scan.missing_skills?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: 0.5, marginBottom: 10 }}>
                      ❌ TO ADD ({scan.missing_skills.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {scan.missing_skills.map((skill, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 11px', borderRadius: 9, gap: 10,
                          background: 'rgba(239,68,68,0.05)',
                          border: '1px solid rgba(239,68,68,0.13)',
                        }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'white', margin: '0 0 2px' }}>
                              {skill.name}
                            </p>
                            {skill.how_to_learn && (
                              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.4 }}>
                                {skill.how_to_learn}
                              </p>
                            )}
                          </div>
                          {skill.priority && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: 0.4, flexShrink: 0,
                              padding: '2px 7px', borderRadius: 20,
                              background: skill.priority === 'critical' ? 'rgba(239,68,68,0.14)' : 'rgba(245,158,11,0.11)',
                              color: skill.priority === 'critical' ? '#ef4444' : '#f59e0b',
                            }}>
                              {skill.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verdict */}
              {scan.verdict && (
                <div style={{
                  padding: '11px 14px', borderRadius: 10,
                  background: 'rgba(79,94,255,0.07)',
                  border: '1px solid rgba(79,94,255,0.16)',
                }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>
                    💡 {scan.verdict}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── MAIN PAGE ───────────────────────────────────────────── */
export default function ResultsPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('gaps')
  const [eligScan,  setEligScan]  = useState(null)

  useEffect(() => {
    api.get(`/analysis/${id}`)
      .then(r => setData(r.data))
      .catch(() => {
        toast.error('Analysis not found')
        navigate('/history')
      })
      .finally(() => setLoading(false))

    // Load eligibility scan from session (set during Step 3)
    try {
      const raw = sessionStorage.getItem('eligibility_scan')
      if (raw) setEligScan(JSON.parse(raw))
    } catch (_) {}
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!data)   return null

  const radarData = Object.entries(data.radar_data ?? {})
    .map(([subject, value]) => ({ subject, value, fullMark: 100 }))

  const critical  = data.skill_gaps?.filter(g => g.priority === 'critical')    ?? []
  const important = data.skill_gaps?.filter(g => g.priority === 'important')   ?? []
  const nice      = data.skill_gaps?.filter(g => g.priority === 'nice-to-have') ?? []

  const color = strengthColor(data.profile_strength)

  return (
    <div style={{ padding: 40 }}>
      <h1>{data.role_title}</h1>

      {/* ATS + Match gauges */}
      <div style={{ display: 'flex', gap: 20 }}>
        <Gauge score={data.ats_score}   label="ATS Score"   color="#4f5eff" />
        <Gauge score={data.match_score} label="Match Score" color={color}   />
      </div>

      {/* ── Eligibility Scan Card (shown only if user ran it) ── */}
      {eligScan && (
        <div style={{ marginTop: 28 }}>
          <EligibilityResultCard scan={eligScan} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginTop: 30 }}>
        <button onClick={() => setActiveTab('gaps')}>Gaps</button>
        <button onClick={() => setActiveTab('matched')}>Matched</button>
      </div>

      {activeTab === 'gaps' && (
        <div>
          {critical.map((g, i)  => <GapCard key={g.skill} gap={g} index={i} />)}
          {important.map((g, i) => <GapCard key={g.skill} gap={g} index={i} />)}
          {nice.map((g, i)      => <GapCard key={g.skill} gap={g} index={i} />)}
        </div>
      )}

      {activeTab === 'matched' && (
        <div>
          {data.matched_skills?.map(s => (
            <div key={s.skill}>{s.display}</div>
          ))}
        </div>
      )}
    </div>
  )
}