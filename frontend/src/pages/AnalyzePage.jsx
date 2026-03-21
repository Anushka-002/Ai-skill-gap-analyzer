import React from 'react'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { Upload, FileText, Brain, Zap, Check, X, Building2, ClipboardList, Sparkles } from 'lucide-react'

const ROLES = [
  { id: 'ml-engineer',             label: 'Machine Learning Engineer' },
  { id: 'llm-engineer',            label: 'LLM / GenAI Engineer'      },
  { id: 'data-scientist',          label: 'Data Scientist'            },
  { id: 'data-engineer',           label: 'Data Engineer'             },
  { id: 'nlp-engineer',            label: 'NLP Engineer'              },
  { id: 'computer-vision-engineer',label: 'Computer Vision Engineer'  },
  { id: 'mlops-engineer',          label: 'MLOps Engineer'            },
]

function StepIndicator({ step }) {
  const steps = ['Upload Resume', 'Select Role', 'Check Eligibility', 'Analyzing']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
      {steps.map((label, i) => {
        const idx    = i + 1
        const done   = step > idx
        const active = step === idx
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              transition: 'all 0.3s',
              background: done ? '#10b981' : active ? '#4f5eff' : 'rgba(255,255,255,0.08)',
              color: (done || active) ? 'white' : 'rgba(255,255,255,0.3)',
              boxShadow: active ? '0 0 16px rgba(79,94,255,0.5)' : 'none',
            }}>
              {done ? <Check size={12} /> : idx}
            </div>
            <span style={{ fontSize: 11, color: active ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ width: 20, height: 1, background: step > idx ? '#4f5eff' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s', flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Eligibility Scanner sub-component ─────────────────────────────────────────
function EligibilityScanner({ resumeSkills, skipped, setSkipped }) {
  const [companies, setCompanies] = useState('')
  const [eligText,  setEligText]  = useState('')
  const [scanning,  setScanning]  = useState(false)
  const [result,    setResult]    = useState(null)

  const scan = async () => {
    if (!eligText.trim()) { toast.error('Paste the eligibility criteria first'); return }
    setScanning(true)
    setResult(null)
    try {
      const { data } = await api.post('/analysis/eligibility-scan', {
        resume_skills: resumeSkills,
        eligibility_text: eligText.trim(),
        target_companies: companies.trim() || null,
      })
      setResult(data)
      sessionStorage.setItem("eligibility_scan", JSON.stringify({ ...data, companies: companies.trim() || null }))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Scan failed')
    } finally { setScanning(false) }
  }

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

  // ── Skipped state ──────────────────────────────────────────────────────────
  if (skipped) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 18px', borderRadius: 13,
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.1)',
          position: 'relative', zIndex: 1, pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <ClipboardList size={14} color="rgba(255,255,255,0.25)" />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            Eligibility Scanner skipped
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setSkipped(false) }}
          style={{
            background: 'rgba(79,94,255,0.12)',
            border: '1px solid rgba(79,94,255,0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12, color: '#4f5eff', fontWeight: 600,
            padding: '6px 14px',
            pointerEvents: 'auto',
            position: 'relative', zIndex: 2,
          }}
        >
          Undo
        </button>
      </motion.div>
    )
  }

  // ── Main panel (always open) ───────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass"
      style={{ borderRadius: 16, border: '1px solid rgba(245,158,11,0.15)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ClipboardList size={15} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>
              Eligibility Compatibility Scanner
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Paste a JD — find out how well you match & what's missing
            </p>
          </div>
        </div>
        <button
          onClick={() => { setSkipped(true); setResult(null); runAnalysis() }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 8, padding: '5px 11px', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          }}
        >
          <X size={11} /> Skip
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Target companies */}
        <div>
          <label style={{
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, letterSpacing: 0.4,
          }}>
            <Building2 size={11} /> TARGET COMPANIES
            <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.22)' }}>— optional</span>
          </label>
          <input
            value={companies}
            onChange={e => setCompanies(e.target.value)}
            placeholder="e.g. Google, OpenAI, Anthropic"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10, padding: '10px 13px',
              fontSize: 13, color: 'white', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
        </div>

        {/* Eligibility textarea */}
        <div>
          <label style={{
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, letterSpacing: 0.4,
          }}>
            <ClipboardList size={11} /> ELIGIBILITY CRITERIA
            <span style={{ color: '#f59e0b', fontSize: 10 }}>required to scan</span>
          </label>
          <textarea
            value={eligText}
            onChange={e => setEligText(e.target.value)}
            rows={6}
            placeholder={`Paste the job description or eligibility requirements here…\n\nE.g.:\n• 3+ years of Python experience\n• Proficiency in TensorFlow or PyTorch\n• Experience with MLOps pipelines\n• Strong knowledge of statistics`}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${eligText ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: 10, padding: '12px 13px',
              fontSize: 12.5, color: 'white', lineHeight: 1.65,
              outline: 'none', resize: 'vertical', fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 5 }}>
            {eligText.length} chars · Tip: paste straight from the company's careers page
          </p>
        </div>

        {/* Scan button */}
        <button
          onClick={scan}
          disabled={scanning || !eligText.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 11, border: 'none',
            cursor: scanning || !eligText.trim() ? 'not-allowed' : 'pointer',
            background: eligText.trim()
              ? 'linear-gradient(135deg,#f59e0b,#d97706)'
              : 'rgba(255,255,255,0.05)',
            color: eligText.trim() ? 'white' : 'rgba(255,255,255,0.22)',
            fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif',
            transition: 'all 0.2s',
            boxShadow: eligText.trim() ? '0 4px 22px rgba(245,158,11,0.28)' : 'none',
          }}
        >
          {scanning
            ? <><span className="spinner" style={{ width: 15, height: 15, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Scanning…</>
            : <><Sparkles size={14} /> Scan Compatibility</>
          }
        </button>

        {/* ── Results ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Score card */}
              <div style={{
                borderRadius: 13,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${scoreColor(result.compatibility_score)}30`,
                padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 18,
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width={80} height={80} viewBox="0 0 80 80">
                    <circle cx={40} cy={40} r={33} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                    <circle cx={40} cy={40} r={33} fill="none"
                      stroke={scoreColor(result.compatibility_score)} strokeWidth={7}
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 33}`}
                      strokeDashoffset={`${2 * Math.PI * 33 * (1 - result.compatibility_score / 100)}`}
                      transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: 18, fontWeight: 800, lineHeight: 1,
                      color: scoreColor(result.compatibility_score),
                      fontFamily: 'Syne, sans-serif',
                    }}>
                      {result.compatibility_score}%
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif', margin: '0 0 4px' }}>
                    {scoreLabel(result.compatibility_score)}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.55 }}>
                    {result.summary}
                  </p>
                  {companies && (
                    <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={11} /> {companies}
                    </p>
                  )}
                </div>
              </div>

              {/* Matched */}
              {result.matched_requirements?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 0.5, marginBottom: 8 }}>
                    ✅ YOU ALREADY HAVE ({result.matched_requirements.length})
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.matched_requirements.map((req, i) => (
                      <span key={i} style={{
                        padding: '4px 11px', borderRadius: 20, fontSize: 12,
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}>
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.missing_skills?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: 0.5, marginBottom: 8 }}>
                    ❌ SKILLS TO ADD ({result.missing_skills.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {result.missing_skills.map((skill, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        padding: '10px 13px', borderRadius: 10, gap: 12,
                        background: 'rgba(239,68,68,0.05)',
                        border: '1px solid rgba(239,68,68,0.14)',
                      }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', margin: '0 0 3px' }}>
                            {skill.name}
                          </p>
                          {skill.how_to_learn && (
                            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>
                              {skill.how_to_learn}
                            </p>
                          )}
                        </div>
                        {skill.priority && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.4, flexShrink: 0,
                            padding: '3px 9px', borderRadius: 20,
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

              {/* Verdict */}
              {result.verdict && (
                <div style={{
                  padding: '12px 15px', borderRadius: 10,
                  background: 'rgba(79,94,255,0.07)',
                  border: '1px solid rgba(79,94,255,0.17)',
                }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', margin: 0, lineHeight: 1.65 }}>
                    💡 {result.verdict}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const [file,      setFile]      = useState(null)
  const [role,      setRole]      = useState('')
  const [hpw,       setHpw]       = useState(10)
  const [step,      setStep]      = useState(1)
  const [parsed,    setParsed]    = useState(null)
  const [resumeId,  setResumeId]  = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [eligSkipped, setEligSkipped] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback(accepted => { if (accepted[0]) setFile(accepted[0]) }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': [],
    },
    maxFiles: 1,
  })

  const uploadResume = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/resume/upload', fd)
      setResumeId(data.resume_id)
      setParsed(data.parsed)
      setStep(2)
      toast.success(`Detected ${data.parsed.skills.length} skills!`)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Upload failed')
    } finally { setUploading(false) }
  }

  const runAnalysis = async () => {
    if (!role) { toast.error('Please select a job role first'); return }
    setAnalyzing(true)
    setStep(4)
    try {
      const { data } = await api.post('/analysis/run', {
        resume_id: resumeId, job_role_id: role, hours_per_week: hpw,
      })
      toast.success('Analysis complete! +50 XP 🎉')
      navigate(`/results/${data.analysis_id}`)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Analysis failed')
      setStep(3)
    } finally { setAnalyzing(false) }
  }

  return (
    <div style={{ padding: '36px 40px', maxWidth: 720, margin: '0 auto' }}>

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white', marginBottom: 4 }}>
          New Analysis
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14 }}>
          Upload your resume and get instant AI-powered skill gap insights
        </p>
      </motion.div>

      <StepIndicator step={step} />

      <AnimatePresence mode="wait">

        {/* Step 1: Upload */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? '#4f5eff' : file ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 18, padding: '52px 32px', textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(79,94,255,0.07)' : file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.25s',
            }}>
              <input {...getInputProps()} />
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
                background: file ? 'rgba(16,185,129,0.15)' : 'rgba(79,94,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {file
                  ? <FileText size={26} color="#10b981" />
                  : <Upload size={26} color="#4f5eff" />
                }
              </div>
              {file ? (
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 6 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={e => { e.stopPropagation(); setFile(null) }}
                    style={{ marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 6 }}>
                    {isDragActive ? 'Drop it here!' : 'Drop your resume here'}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    PDF, DOCX, or TXT · max 5 MB
                  </p>
                </div>
              )}
            </div>

            {file && (
              <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={uploadResume} disabled={uploading} className="btn-primary"
                style={{ width: '100%', marginTop: 16, fontSize: 15 }}>
                {uploading
                  ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Parsing resume...</>
                  : <><Zap size={16} /> Parse & Continue</>
                }
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 2: Role selection */}
        {step === 2 && parsed && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Detected skills */}
            <div className="glass" style={{ borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                Detected Skills ({parsed.skills.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {parsed.skills.slice(0, 24).map(s => (
                  <span key={s.skill} className="badge-matched">{s.display}</span>
                ))}
                {parsed.skills.length > 24 && (
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.38)' }}>
                    +{parsed.skills.length - 24} more
                  </span>
                )}
              </div>
            </div>

            {/* Role picker */}
            <div className="glass" style={{ borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                Target Job Role
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 14px', borderRadius: 11, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                    background: role === r.id ? 'rgba(79,94,255,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${role === r.id ? 'rgba(79,94,255,0.55)' : 'rgba(255,255,255,0.08)'}`,
                    color: role === r.id ? 'white' : 'rgba(255,255,255,0.55)',
                  }}>
                    {r.label}
                    {role === r.id && <Check size={13} color="#4f5eff" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours slider */}
            <div className="glass" style={{ borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                Study time available:&nbsp;
                <span className="text-gradient" style={{ fontFamily: 'Syne, sans-serif', fontSize: 14 }}>{hpw} hrs / week</span>
              </p>
              <input type="range" min={2} max={40} step={2} value={hpw}
                onChange={e => setHpw(+e.target.value)}
                style={{ width: '100%', accentColor: '#4f5eff', marginTop: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>
                <span>2h</span><span>40h</span>
              </div>
            </div>

            <button onClick={() => { if (!role) { toast.error('Please select a job role first'); return } setStep(3) }}
              disabled={!role} className="btn-primary" style={{ width: '100%', fontSize: 15 }}>
              <ClipboardList size={16} /> Next: Check Eligibility
            </button>
          </motion.div>
        )}

        {/* Step 3: Eligibility Scanner */}
        {step === 3 && parsed && (
          <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <EligibilityScanner resumeSkills={parsed.skills} skipped={eligSkipped} setSkipped={setEligSkipped} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep(2); setEligSkipped(false) }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                }}>
                ← Back
              </button>
              <button onClick={runAnalysis} className="btn-primary" style={{ flex: 3, fontSize: 15 }}>
                <Brain size={17} /> Run AI Analysis
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Running */}
        {step === 4 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', paddingTop: 64, paddingBottom: 64 }}>
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 24px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(79,94,255,0.15)',
                animation: 'pulseRing 1.5s ease-in-out infinite',
              }} />
              <div style={{
                position: 'relative', width: 96, height: 96, borderRadius: '50%',
                background: 'rgba(79,94,255,0.12)',
                border: '2px solid rgba(79,94,255,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={38} color="#7088ff" />
              </div>
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 8 }}>
              Analyzing your skills…
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
              Comparing your resume against job requirements
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#4f5eff',
                  animation: 'bounce 0.9s ease-in-out infinite',
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
            <style>{`
              @keyframes pulseRing{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.2);opacity:0.2}}
              @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}