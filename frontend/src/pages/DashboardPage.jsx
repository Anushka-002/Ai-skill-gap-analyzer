import React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { strengthColor, titleCase, fmtDate, xpToLevel, xpForNextLevel } from '../utils/helpers'
import api from '../utils/api'
import { Brain, Target, Zap, Award, ArrowRight, History, Flame, TrendingUp } from 'lucide-react'

function StatCard({ label, value, sub, color, icon: Icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass glass-hover" style={{ borderRadius: 18, padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</span>
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: 'white', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{label}</div>
    </motion.div>
  )
}

function Skeleton({ h = 80 }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 14 }} />
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analysis/history')
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const best = history.reduce((b, a) => (a.match_score > (b?.match_score ?? 0) ? a : b), null)
  const avg  = history.length
    ? (history.reduce((s, a) => s + a.match_score, 0) / history.length).toFixed(1)
    : '—'

  const level = xpToLevel(user?.xp ?? 0)

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>👋</span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white' }}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14 }}>
          Your AI career intelligence dashboard
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Analyses run"   value={history.length} sub="total"               color="#4f5eff" icon={Brain}    delay={0.08} />
        <StatCard label="Avg match"      value={avg}            sub="score"               color="#10b981" icon={Target}   delay={0.14} />
        <StatCard label="Your XP"        value={user?.xp ?? 0}  sub={`Level ${level}`}    color="#f59e0b" icon={Zap}      delay={0.20} />
        <StatCard label="Best match"     value={best ? `${best.match_score}%` : '—'}
                                          sub={best?.profile_strength ?? '—'}              color="#8b5cf6" icon={Award}   delay={0.26} />
      </div>

      {/* Lower row: CTA + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{
            borderRadius: 20, padding: 28,
            background: 'linear-gradient(135deg, rgba(79,94,255,0.14), rgba(0,229,255,0.07))',
            border: '1px solid rgba(79,94,255,0.25)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: 200,
          }}
        >
          <div>
            <div style={{
              width: 46, height: 46, borderRadius: 14, marginBottom: 18,
              background: 'rgba(79,94,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={22} color="#7088ff" />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 19, color: 'white', marginBottom: 8 }}>
              Analyze your resume
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Upload your resume and pick a target role to get instant AI skill gap insights and a learning roadmap.
            </p>
          </div>
          <Link to="/analyze" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: 20 }}>
            Start Analysis <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Recent analyses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="glass" style={{ borderRadius: 20, padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={15} color="rgba(255,255,255,0.4)" /> Recent Analyses
            </h2>
            <Link to="/history" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} h={64} />)}
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
              <Flame size={28} color="rgba(255,255,255,0.1)" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>No analyses yet</p>
              <Link to="/analyze" className="btn-ghost" style={{ marginTop: 14, fontSize: 12, padding: '8px 16px', display: 'inline-flex' }}>
                Run your first →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 5).map((a, i) => {
                const color = strengthColor(a.profile_strength)
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}>
                    <Link to={`/results/${a.id}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 12, textDecoration: 'none',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.065)',
                      transition: 'all 0.18s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(79,94,255,0.25)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.065)' }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>
                          {titleCase(a.job_role_id)}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>{fmtDate(a.created_at)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color }}>{a.match_score}%</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{a.profile_strength}</div>
                        </div>
                        <ArrowRight size={13} color="rgba(255,255,255,0.18)" />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Market insight nudge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 20 }}>
        <Link to="/insights"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderRadius: 14, textDecoration: 'none',
            background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.07)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Check today's market insights — salary ranges, trending skills & top companies
            </span>
          </div>
          <ArrowRight size={14} color="rgba(255,255,255,0.3)" />
        </Link>
      </motion.div>
    </div>
  )
}