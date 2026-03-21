import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import {
  ScanSearch, Upload, FileText, X, Sparkles,
  Building2, ClipboardList, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, RotateCcw,
} from 'lucide-react'

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

/* ── Animated ring ── */
function ScoreRing({ score }) {
  const r    = 54
  const circ = 2 * Math.PI * r
  const color = scoreColor(score)
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}70)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color, lineHeight: 1 }}
        >
          {score}%
        </motion.span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
          compatibility
        </span>
      </div>
    </div>
  )
}

export default function ATSPage() {
  const [file,       setFile]       = useState(null)
  const [resumeText, setResumeText] = useState('')   // parsed skills from upload
  const [resumeSkills, setResumeSkills] = useState(null)
  const [companies,  setCompanies]  = useState('')
  const [jdText,     setJdText]     = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [scanning,   setScanning]   = useState(false)
  const [result,     setResult]     = useState(null)
  const [expandMissing, setExpandMissing] = useState(true)

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
      setResumeSkills(data.parsed.skills)
      toast.success(`Resume parsed — ${data.parsed.skills.length} skills detected`)
    } catch (err) {
      toast.error('Resume parsing failed')
    } finally { setUploading(false) }
  }

  const runScan = async () => {
    if (!resumeSkills) { toast.error('Upload and parse your resume first'); return }
    if (!jdText.trim()) { toast.error('Paste the job description first'); return }
    setScanning(true)
    setResult(null)
    try {
      const { data } = await api.post('/analysis/eligibility-scan', {
        resume_skills: resumeSkills,
        eligibility_text: jdText.trim(),
        target_companies: companies.trim() || null,
      })
      setResult(data)
      toast.success('ATS scan complete!')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Scan failed')
    } finally { setScanning(false) }
  }

  const reset = () => {
    setFile(null); setResumeSkills(null); setCompanies('')
    setJdText(''); setResult(null)
  }

  const color = result ? scoreColor(result.compatibility_score) : '#4f5eff'

  return (
    <div style={{ padding: '36px 40px', maxWidth: 820, margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(79,94,255,0.2), rgba(0,229,255,0.1))',
              border: '1px solid rgba(79,94,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ScanSearch size={20} color="#4f5eff" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'white', margin: 0 }}>
                ATS Scanner
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
                Upload your resume · paste any JD · get a real compatibility score
              </p>
            </div>
          </div>
          {result && (
            <button onClick={reset} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <RotateCcw size={13} /> New Scan
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── Input form ── */}
        {!result && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Resume upload */}
            <div className="glass" style={{ borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 12 }}>
                STEP 1 — UPLOAD RESUME
              </p>

              {!resumeSkills ? (
                <>
                  <div {...getRootProps()} style={{
                    border: `2px dashed ${isDragActive ? '#4f5eff' : file ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                    background: isDragActive ? 'rgba(79,94,255,0.06)' : file ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                  }}>
                    <input {...getInputProps()} />
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
                      background: file ? 'rgba(16,185,129,0.12)' : 'rgba(79,94,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {file ? <FileText size={22} color="#10b981" /> : <Upload size={22} color="#4f5eff" />}
                    </div>
                    {file ? (
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>{file.name}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                        <button onClick={e => { e.stopPropagation(); setFile(null) }}
                          style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <X size={11} /> Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>
                          {isDragActive ? 'Drop it!' : 'Drop your resume here'}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>PDF, DOCX, or TXT</p>
                      </div>
                    )}
                  </div>

                  {file && (
                    <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      onClick={uploadResume} disabled={uploading} className="btn-primary"
                      style={{ width: '100%', marginTop: 12, fontSize: 14 }}>
                      {uploading
                        ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Parsing…</>
                        : <><Sparkles size={15} /> Parse Resume</>
                      }
                    </motion.button>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 11,
                    background: 'rgba(16,185,129,0.07)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white', margin: 0 }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {resumeSkills.length} skills detected
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: 280, justifyContent: 'flex-end' }}>
                    {resumeSkills.slice(0, 6).map(s => (
                      <span key={s.skill} style={{
                        padding: '3px 9px', borderRadius: 20, fontSize: 11,
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}>{s.display}</span>
                    ))}
                    {resumeSkills.length > 6 && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '3px 0' }}>
                        +{resumeSkills.length - 6} more
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* JD input */}
            <div className="glass" style={{ borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 12 }}>
                STEP 2 — PASTE JOB DESCRIPTION
              </p>

              {/* Target company */}
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                <Building2 size={11} /> TARGET COMPANY
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>— optional</span>
              </label>
              <input
                value={companies}
                onChange={e => setCompanies(e.target.value)}
                placeholder="e.g. Google, OpenAI, Anthropic"
                style={{
                  width: '100%', boxSizing: 'border-box', marginBottom: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 10, padding: '10px 13px', fontSize: 13, color: 'white',
                  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(79,94,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
              />

              {/* JD textarea */}
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                <ClipboardList size={11} /> JOB DESCRIPTION / ELIGIBILITY CRITERIA
                <span style={{ color: '#f59e0b', fontSize: 10 }}>required</span>
              </label>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                rows={8}
                placeholder={`Paste the full job description here…\n\nE.g.:\nWe are looking for a Machine Learning Engineer with:\n• 3+ years of Python experience\n• Proficiency in TensorFlow or PyTorch\n• Experience deploying models to production\n• Strong understanding of statistics and ML algorithms\n• Familiarity with cloud platforms (AWS/GCP/Azure)`}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${jdText ? 'rgba(79,94,255,0.3)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 10, padding: '12px 13px',
                  fontSize: 12.5, color: 'white', lineHeight: 1.65,
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 5 }}>
                {jdText.length} chars · more detail = more accurate score
              </p>
            </div>

            {/* Scan button */}
            <motion.button
              onClick={runScan}
              disabled={scanning || !resumeSkills || !jdText.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary"
              style={{
                width: '100%', fontSize: 15, padding: '14px',
                opacity: (!resumeSkills || !jdText.trim()) ? 0.4 : 1,
              }}
            >
              {scanning
                ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Running ATS Scan…</>
                : <><ScanSearch size={17} /> Run ATS Scan</>
              }
            </motion.button>
          </motion.div>
        )}

        {/* ── Results ── */}
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Score hero */}
            <div style={{
              borderRadius: 20,
              background: `linear-gradient(135deg, ${color}0d, rgba(255,255,255,0.02))`,
              border: `1px solid ${color}28`,
              padding: '32px 32px',
              display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
            }}>
              <ScoreRing score={result.compatibility_score} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h2 style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26,
                    color, margin: 0,
                  }}>
                    {scoreLabel(result.compatibility_score)}
                  </h2>
                  {companies && (
                    <span style={{
                      fontSize: 12, color: '#f59e0b',
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'rgba(245,158,11,0.1)', padding: '3px 10px',
                      borderRadius: 20, border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <Building2 size={11} /> {companies}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: 1.6 }}>
                  {result.summary}
                </p>
                {result.verdict && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(79,94,255,0.08)',
                    border: '1px solid rgba(79,94,255,0.18)',
                  }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.65 }}>
                      💡 {result.verdict}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ATS tip */}
            {result.ats_tips && (
              <div style={{
                padding: '13px 16px', borderRadius: 12,
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>📄</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: 0.5, margin: '0 0 3px' }}>
                    ATS RESUME TIP
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
                    {result.ats_tips}
                  </p>
                </div>
              </div>
            )}

            {/* Two columns: matched + missing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Matched */}
              {result.matched_requirements?.length > 0 && (
                <div className="glass" style={{ borderRadius: 16, padding: 18 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 0.5, marginBottom: 12 }}>
                    ✅ YOU HAVE ({result.matched_requirements.length})
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.matched_requirements.map((req, i) => (
                      <span key={i} style={{
                        padding: '5px 11px', borderRadius: 20, fontSize: 12,
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
              {result.missing_skills?.length > 0 && (
                <div className="glass" style={{ borderRadius: 16, padding: 18 }}>
                  <button
                    onClick={() => setExpandMissing(v => !v)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12,
                    }}
                  >
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: 0.5, margin: 0 }}>
                      ❌ SKILLS TO ADD ({result.missing_skills.length})
                    </p>
                    {expandMissing ? <ChevronUp size={13} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.3)" />}
                  </button>

                  <AnimatePresence>
                    {expandMissing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {result.missing_skills.map((skill, i) => (
                            <div key={i} style={{
                              padding: '10px 12px', borderRadius: 10,
                              background: 'rgba(239,68,68,0.05)',
                              border: '1px solid rgba(239,68,68,0.13)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: skill.how_to_learn ? 4 : 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'white', margin: 0 }}>
                                  {skill.name}
                                </p>
                                {skill.priority && (
                                  <span style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                                    padding: '2px 7px', borderRadius: 20, flexShrink: 0,
                                    background: skill.priority === 'critical' ? 'rgba(239,68,68,0.14)' : 'rgba(245,158,11,0.11)',
                                    color: skill.priority === 'critical' ? '#ef4444' : '#f59e0b',
                                  }}>
                                    {skill.priority.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {skill.how_to_learn && (
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>
                                  {skill.how_to_learn}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}