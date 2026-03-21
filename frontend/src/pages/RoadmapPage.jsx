import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Map, Clock, ChevronRight, ExternalLink, Layers, Trophy, Code2, Award, ArrowRight } from 'lucide-react'

const PHASE_COLORS = ['#4f5eff', '#8b5cf6', '#10b981']

function PhaseCard({ phase, index }) {
  const [open, setOpen] = useState(index === 0)
  const color = PHASE_COLORS[index % 3]

  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.14 }}
      style={{ position: 'relative' }}>

      {/* Connector line */}
      {index < 2 && (
        <div style={{
          position: 'absolute', left: 24, top: '100%',
          width: 2, height: 20, zIndex: 1,
          background: `linear-gradient(${color}, ${PHASE_COLORS[(index + 1) % 3]})`,
        }} />
      )}

      <div className="glass" style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
        {/* Header */}
        <button onClick={() => setOpen(o => !o)} style={{
          width: '100%', padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `${color}18`, border: `2px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color,
          }}>
            {index + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'white' }}>
                Phase {index + 1}: {phase.title}
              </span>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 8,
                background: `${color}18`, color, border: `1px solid ${color}35`,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {phase.duration}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
              {phase.skills.length} skills · ~{phase.total_hours}h
            </span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)"
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        </button>

        {/* Body */}
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.22 }}
            style={{ padding: '0 22px 22px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {phase.skills.map((skill, si) => (
                <motion.div key={skill.skill} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.05 }}
                  style={{
                    borderRadius: 12, padding: 16,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.065)',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{skill.display}</span>
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>{skill.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={11} color="rgba(255,255,255,0.3)" />
                      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color }}>
                        {skill.hours}h
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 10 }}>
                    <motion.div style={{ height: '100%', background: color, borderRadius: 99 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (skill.hours / 120) * 100)}%` }}
                      transition={{ duration: 0.8, delay: si * 0.08 }} />
                  </div>
                  {skill.resources?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {skill.resources.map((r, ri) => (
                        <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <ExternalLink size={10} /> {r.title}
                          {r.free && (
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                              FREE
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function RoadmapPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [roadmap,  setRoadmap]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: an } = await api.get(`/analysis/${id}`)
        setAnalysis(an)
        const gaps = (an.skill_gaps ?? []).map(g => g.skill)
        if (!gaps.length) { setLoading(false); return }
        const { data: rm } = await api.post('/roadmap/generate', {
          gaps, role: an.role_id, level: 'intermediate', hours_per_week: 10,
        })
        setRoadmap(rm)
      } catch {
        toast.error('Could not load roadmap')
        navigate('/history')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )

  if (!roadmap || roadmap.phases?.length === 0) return (
    <div style={{ padding: '80px 40px', textAlign: 'center' }}>
      <Trophy size={44} color="#f59e0b" style={{ marginBottom: 16 }} />
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'white', marginBottom: 8 }}>
        No gaps to fill!
      </h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
        You already have all the required skills for this role.
      </p>
    </div>
  )

  return (
    <div style={{ padding: '36px 40px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.32)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Learning Roadmap
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white', marginBottom: 6 }}>
          {analysis?.role_title}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
          ~{roadmap.total_hours}h total · {roadmap.total_duration} to complete at 10h/week
        </p>
      </motion.div>

      {/* Summary bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Hours', value: `~${roadmap.total_hours}h`, icon: Clock,  color: '#4f5eff' },
          { label: 'Timeline',    value: roadmap.total_duration,      icon: Map,    color: '#8b5cf6' },
          { label: 'Phases',      value: roadmap.phases.length,       icon: Layers, color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'white' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Career path */}
      {roadmap.career_path?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="glass" style={{ borderRadius: 18, padding: 22, marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={14} color="#f59e0b" /> Career Path Prediction
          </p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            {roadmap.career_path.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 8, fontWeight: 500,
                  background: i === 0 ? 'rgba(79,94,255,0.2)' : i === roadmap.career_path.length - 1 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                  color:      i === 0 ? '#818cf8'              : i === roadmap.career_path.length - 1 ? '#34d399'                : 'rgba(255,255,255,0.55)',
                  border:     `1px solid ${i === 0 ? 'rgba(79,94,255,0.35)' : 'rgba(255,255,255,0.09)'}`,
                }}>
                  {step}
                </span>
                {i < roadmap.career_path.length - 1 && (
                  <ArrowRight size={12} color="rgba(255,255,255,0.2)" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Phases */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="rgba(255,255,255,0.4)" /> Learning Phases
        </h2>
        {roadmap.phases.map((phase, i) => <PhaseCard key={phase.phase} phase={phase} index={i} />)}
      </div>

      {/* Projects */}
      {roadmap.projects?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass" style={{ borderRadius: 18, padding: 22, marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Code2 size={14} color="#00e5ff" /> Recommended Projects
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {roadmap.projects.map((p, i) => (
              <div key={i} style={{
                borderRadius: 12, padding: 16,
                background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.13)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'white', lineHeight: 1.4 }}>{p.title}</p>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)',
                  }}>
                    {p.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>~{p.hours}h</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Certifications */}
      {roadmap.certifications?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="glass" style={{ borderRadius: 18, padding: 22 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={14} color="#f59e0b" /> Target Certifications
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {roadmap.certifications.map((c, i) => (
              <span key={i} style={{
                fontSize: 12, padding: '7px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.22)',
              }}>
                🏅 {c}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}