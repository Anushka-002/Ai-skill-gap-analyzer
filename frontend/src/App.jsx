import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout        from './components/ui/Layout'
import LoginPage     from './pages/LoginPage'
import SignupPage    from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage   from './pages/AnalyzePage'
import ResultsPage   from './pages/ResultsPage'
import RoadmapPage   from './pages/RoadmapPage'
import InsightsPage  from './pages/InsightsPage'
import HistoryPage   from './pages/HistoryPage'
import ATSPage       from './pages/ATSPage'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '2px solid rgba(79,94,255,0.3)',
        borderTopColor: '#4f5eff',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login"  element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="analyze"      element={<AnalyzePage />} />
        <Route path="ats"          element={<ATSPage />} />
        <Route path="results/:id"  element={<ResultsPage />} />
        <Route path="roadmap/:id"  element={<RoadmapPage />} />
        <Route path="insights"     element={<InsightsPage />} />
        <Route path="history"      element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}