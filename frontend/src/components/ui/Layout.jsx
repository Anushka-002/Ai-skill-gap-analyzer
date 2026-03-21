import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { xpToLevel, xpForNextLevel } from '../../utils/helpers'
import {
  LayoutDashboard, Brain, History,
  TrendingUp, LogOut, Zap, Sparkles, ScanSearch,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/analyze',   icon: Brain,           label: 'New Analysis'   },
  { to: '/ats',       icon: ScanSearch,      label: 'ATS Scanner'    },
  { to: '/history',   icon: History,         label: 'History'        },
  { to: '/insights',  icon: TrendingUp,      label: 'Market Insights'},
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const level      = xpToLevel(user?.xp ?? 0)
  const nextXp     = xpForNextLevel(level)
  const xpProgress = Math.min(100, ((user?.xp ?? 0) / nextXp) * 100)

  return (
    <div className="flex min-h-screen bg-grid" style={{ background: '#050508' }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: 232,
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10, 10, 18, 0.92)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f5eff, #00e5ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={17} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'white', lineHeight: 1.2 }}>
                SkillGap AI
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Analyzer v1.0</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #4f5eff, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'white',
              }}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user?.name}
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.38)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user?.email}
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} color="#f59e0b" /> Level {level}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                {user?.xp ?? 0} XP
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, #4f5eff, #00e5ff)', borderRadius: 99 }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 10px 0' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              style={{ marginBottom: 2 }}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '8px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </motion.aside>

      {/* ── Page content ───────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}