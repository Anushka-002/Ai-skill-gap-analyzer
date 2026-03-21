import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../utils/api'
import { TrendingUp, DollarSign, Activity, Building2, Award, Zap, Briefcase, Calendar } from 'lucide-react'

const ROLES = [
  { id: 'ml-engineer',             label: 'ML Engineer'    },
  { id: 'llm-engineer',            label: 'LLM / GenAI'   },
  { id: 'data-scientist',          label: 'Data Scientist' },
  { id: 'data-engineer',           label: 'Data Engineer'  },
  { id: 'nlp-engineer',            label: 'NLP Engineer'   },
  { id: 'computer-vision-engineer',label: 'CV Engineer'    },
  { id: 'mlops-engineer',          label: 'MLOps Eng.'     },
]

function formatINR(value) {
  value = parseFloat(value)
  if (value >= 10000000) return '\u20B9' + (value / 10000000).toFixed(1) + 'Cr'
  if (value >= 100000)   return '\u20B9' + (value / 100000).toFixed(1) + 'L'
  if (value >= 1000)     return '\u20B9' + (value / 1000).toFixed(0) + 'K'
  return '\u20B9' + value
}

const SALARY_DATA = {
  'ml-engineer':             { min: 800000,  max: 2500000 },
  'llm-engineer':            { min: 1200000, max: 4000000 },
  'data-scientist':          { min: 600000,  max: 1800000 },
  'data-engineer':           { min: 700000,  max: 2000000 },
  'nlp-engineer':            { min: 900000,  max: 2800000 },
  'computer-vision-engineer':{ min: 850000,  max: 2600000 },
  'mlops-engineer':          { min: 900000,  max: 2800000 },
}

const INTERNSHIP_DATA = {
  'ml-engineer':             { min: 15000, max: 50000 },
  'llm-engineer':            { min: 20000, max: 60000 },
  'data-scientist':          { min: 12000, max: 40000 },
  'data-engineer':           { min: 12000, max: 35000 },
  'nlp-engineer':            { min: 15000, max: 45000 },
  'computer-vision-engineer':{ min: 15000, max: 45000 },
  'mlops-engineer':          { min: 12000, max: 40000 },
}

const EXPERIENCE_DATA = {
  'ml-engineer':             { fresher: '6L-12L', mid: '15L-30L', senior: '35L-80L' },
  'llm-engineer':            { fresher: '10L-18L', mid: '20L-45L', senior: '50L-1Cr' },
  'data-scientist':          { fresher: '5L-10L', mid: '12L-25L', senior: '28L-60L' },
  'data-engineer':           { fresher: '5L-10L', mid: '12L-22L', senior: '25L-55L' },
  'nlp-engineer':            { fresher: '7L-14L', mid: '16L-32L', senior: '35L-75L' },
  'computer-vision-engineer':{ fresher: '7L-13L', mid: '15L-30L', senior: '32L-70L' },
  'mlops-engineer':          { fresher: '7L-14L', mid: '16L-32L', senior: '35L-75L' },
}

const SEASON_DATA = {
  'ml-engineer':             ['Jan-Mar', 'Aug-Oct'],
  'llm-engineer':            ['Jan-Mar', 'Aug-Oct'],
  'data-scientist':          ['Feb-Apr', 'Sep-Nov'],
  'data-engineer':           ['Jan-Mar', 'Jul-Sep'],
  'nlp-engineer':            ['Jan-Mar', 'Aug-Oct'],
  'computer-vision-engineer':['Feb-Apr', 'Aug-Oct'],
  'mlops-engineer':          ['Jan-Apr', 'Aug-Nov'],
}

const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#12121e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 14px', fontSize:12, color:'white' }}>
      <div style={{ fontWeight:700, marginBottom:2 }}>{payload[0].payload.name}</div>
      <div style={{ color:'#7088ff' }}>{formatINR(payload[0].value)} avg/year</div>
    </div>
  )
}

export default function InsightsPage() {
  const [role,     setRole]    = useState('ml-engineer')
  const [data,     setData]    = useState(null)
  const [allRoles, setAllRoles]= useState([])
  const [loading,  setLoading] = useState(true)

  useEffect(() => {
    api.get('/insights/roles').then(r => setAllRoles(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get('/insights/market?role=' + role)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [role])

  const barData = allRoles.map(r => ({
    name: r.title.replace('Machine Learning', 'ML').replace('Engineer', 'Eng.').replace('Scientist', 'Sci.'),
    avg:  ((SALARY_DATA[r.id]?.min || 0) + (SALARY_DATA[r.id]?.max || 0)) / 2,
    id:   r.id,
  }))

  const sal  = SALARY_DATA[role]
  const intl = INTERNSHIP_DATA[role]
  const exp  = EXPERIENCE_DATA[role]
  const seas = SEASON_DATA[role]

  return (
    <div style={{ padding:'36px 40px', maxWidth:1000, margin:'0 auto' }}>

      <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Syne, sans-serif',fontWeight:800,fontSize:26,color:'white',marginBottom:4}}>
          Market Insights
        </h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.38)'}}>
          Indian market — salary, internship stipends, hiring seasons
        </p>
      </motion.div>

      {/* Role tabs */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:28}}>
        {ROLES.map(r => (
          <button key={r.id} onClick={() => setRole(r.id)} style={{
            padding:'7px 14px',borderRadius:10,fontSize:12,fontWeight:500,cursor:'pointer',transition:'all 0.18s',
            background: role===r.id ? 'rgba(79,94,255,0.22)' : 'rgba(255,255,255,0.05)',
            border: '1px solid ' + (role===r.id ? 'rgba(79,94,255,0.5)' : 'rgba(255,255,255,0.09)'),
            color: role===r.id ? 'white' : 'rgba(255,255,255,0.48)',
          }}>{r.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',paddingTop:80}}>
          <div className="spinner" style={{width:36,height:36}} />
        </div>
      ) : data && (
        <>
          {/* KPI row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {[
              { label:'Min Salary / year',  value: sal ? formatINR(sal.min) : '—', icon:DollarSign, color:'#10b981' },
              { label:'Max Salary / year',  value: sal ? formatINR(sal.max) : '—', icon:DollarSign, color:'#4f5eff' },
              { label:'Demand Score',        value: data.demand_score + '/100',      icon:Activity,   color:'#f59e0b' },
              { label:'YoY Growth',          value: data.growth_rate,                icon:TrendingUp, color:'#8b5cf6' },
            ].map(({label,value,icon:Icon,color},i) => (
              <motion.div key={label} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                className="glass" style={{borderRadius:16,padding:20}}>
                <div style={{width:38,height:38,borderRadius:11,background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{fontFamily:'Syne, sans-serif',fontWeight:800,fontSize:20,color:'white'}}>{value}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.38)',marginTop:5}}>{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Internship + Experience */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:18}}>

            {/* Internship */}
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
              className="glass" style={{borderRadius:18,padding:22}}>
              <p style={{fontSize:13,fontWeight:600,color:'white',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <Briefcase size={14} color="#00e5ff" /> Internship Stipend (India)
              </p>
              <div style={{display:'flex',gap:20,marginBottom:16}}>
                <div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.38)',marginBottom:4}}>Minimum</div>
                  <div style={{fontFamily:'Syne, sans-serif',fontWeight:800,fontSize:24,color:'#00e5ff'}}>
                    {intl ? formatINR(intl.min) : '—'}
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>per month</div>
                </div>
                <div style={{width:1,background:'rgba(255,255,255,0.08)'}} />
                <div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.38)',marginBottom:4}}>Maximum</div>
                  <div style={{fontFamily:'Syne, sans-serif',fontWeight:800,fontSize:24,color:'#10b981'}}>
                    {intl ? formatINR(intl.max) : '—'}
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>per month</div>
                </div>
              </div>
              <div style={{padding:'10px 14px',borderRadius:10,background:'rgba(0,229,255,0.07)',border:'1px solid rgba(0,229,255,0.15)'}}>
                <p style={{fontSize:12,color:'#22d3ee'}}>
                  Duration: 3-6 months · Varies by company size
                </p>
              </div>
            </motion.div>

            {/* Experience salary */}
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.30}}
              className="glass" style={{borderRadius:18,padding:22}}>
              <p style={{fontSize:13,fontWeight:600,color:'white',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <DollarSign size={14} color="#10b981" /> Salary by Experience (INR/year)
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  {label:'🌱 Fresher (0-1 yr)',   value: exp?.fresher, color:'#10b981'},
                  {label:'💼 Mid Level (2-4 yrs)', value: exp?.mid,     color:'#4f5eff'},
                  {label:'🚀 Senior (5+ yrs)',     value: exp?.senior,  color:'#f59e0b'},
                ].map(({label,value,color}) => (
                  <div key={label} style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'10px 14px',borderRadius:10,
                    background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                  }}>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>{label}</span>
                    <span style={{fontFamily:'Syne, sans-serif',fontWeight:700,fontSize:13,color}}>
                      {value ? '\u20B9' + value + ' / yr' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Trending + Companies */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>

            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.33}}
              className="glass" style={{borderRadius:18,padding:22}}>
              <p style={{fontSize:13,fontWeight:600,color:'white',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <Zap size={14} color="#00e5ff" /> Trending Skills
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {data.trending_skills?.map((skill,i) => (
                  <div key={skill} style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:11,fontFamily:'JetBrains Mono, monospace',color:'rgba(255,255,255,0.22)',width:16,textAlign:'right'}}>{i+1}</span>
                    <div style={{flex:1,height:34,borderRadius:9,overflow:'hidden',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',position:'relative',display:'flex',alignItems:'center',paddingLeft:12}}>
                      <motion.div style={{position:'absolute',inset:0,background:'rgba(79,94,255,'+(0.18-i*0.025)+')'}}
                        initial={{width:0}} animate={{width:(100-i*12)+'%'}} transition={{duration:0.7,delay:0.3+i*0.08}} />
                      <span style={{position:'relative',fontSize:12,fontWeight:500,color:'white',zIndex:1}}>{skill}</span>
                    </div>
                    {i < 3 && <span style={{fontSize:10,padding:'2px 7px',borderRadius:6,background:'rgba(0,229,255,0.12)',color:'#22d3ee',flexShrink:0}}>Hot</span>}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.36}}
              className="glass" style={{borderRadius:18,padding:22}}>
              <p style={{fontSize:13,fontWeight:600,color:'white',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <Building2 size={14} color="#8b5cf6" /> Top Hiring Companies
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
                {data.top_companies?.map((c,i) => (
                  <div key={c} style={{display:'flex',alignItems:'center',gap:11,padding:'9px 12px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.065)'}}>
                    <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:'hsl('+(i*42+220)+',65%,55%)22',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne, sans-serif',fontWeight:700,fontSize:13,color:'hsl('+(i*42+220)+',65%,65%)'}}>
                      {c[0]}
                    </div>
                    <span style={{fontSize:13,color:'white'}}>{c}</span>
                  </div>
                ))}
              </div>
              <p style={{fontSize:12,fontWeight:600,color:'white',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                <Calendar size={13} color="#f59e0b" /> Best Hiring Season
              </p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {seas?.map(s => (
                  <span key={s} style={{fontSize:12,padding:'5px 12px',borderRadius:8,background:'rgba(245,158,11,0.12)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.25)'}}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Certifications */}
          {data.certifications?.length > 0 && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.38}}
              className="glass" style={{borderRadius:18,padding:22,marginBottom:18}}>
              <p style={{fontSize:13,fontWeight:600,color:'white',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <Award size={14} color="#f59e0b" /> Recommended Certifications
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {data.certifications.map(c => (
                  <span key={c} style={{fontSize:12,padding:'7px 14px',borderRadius:10,background:'rgba(245,158,11,0.1)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.22)'}}>
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Salary bar chart */}
          {barData.length > 0 && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.40}}
              className="glass" style={{borderRadius:18,padding:22}}>
              <p style={{fontSize:13,fontWeight:600,color:'white',marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
                <DollarSign size={14} color="#10b981" /> Salary Comparison — All Roles (INR avg/year)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{top:4,right:4,bottom:4,left:10}}>
                  <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.38)',fontSize:11,fontFamily:'DM Sans'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'rgba(255,255,255,0.28)',fontSize:11}} tickFormatter={v => formatINR(v)} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTip />} cursor={{fill:'rgba(255,255,255,0.04)'}} />
                  <Bar dataKey="avg" radius={[7,7,0,0]}>
                    {barData.map((entry,i) => (
                      <Cell key={i} fill={entry.id===role ? '#4f5eff' : 'rgba(79,94,255,0.28)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}