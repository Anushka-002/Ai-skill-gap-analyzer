import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Sparkles, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

const FIELDS = [
  { key: 'name',     icon: User, placeholder: 'Your full name',    type: 'text',     label: 'Full name'       },
  { key: 'email',    icon: Mail, placeholder: 'you@example.com',   type: 'email',    label: 'Email address'   },
  { key: 'password', icon: Lock, placeholder: 'Min 6 characters',  type: 'password', label: 'Password'        },
]

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signup }  = useAuth()
  const navigate    = useNavigate()

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return }
    if (form.password.length < 6)    { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signup(form.name.trim(), form.email, form.password)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Signup failed — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-grid flex items-center justify-center p-4"
      style={{ background: '#050508' }}
    >
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(79,94,255,0.18), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4f5eff, #00e5ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: 'white', marginBottom: 6 }}>
            Create account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14 }}>
            Start analyzing your skill gaps today — free
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {FIELDS.map(({ key, icon: Icon, placeholder, type, label }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)' }} />
                  <input
                    type={key === 'password' && showPw ? 'text' : type}
                    required value={form[key]} onChange={set(key)}
                    placeholder={placeholder} className="input-glass"
                    style={{ paddingLeft: 38, paddingRight: key === 'password' ? 42 : 16 }}
                  />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPw(p => !p)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.28)', padding: 2,
                    }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
              {loading
                ? <span className="spinner" style={{ width: 18, height: 18 }} />
                : <><span>Create Account</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}