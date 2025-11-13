import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Home, User, Users, Calendar, Search, LogIn, BarChart2, Bell } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [me, setMe] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setMe)
      .catch(() => setMe(null))
  }, [token])

  const login = async (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const r = await fetch(`${API_BASE}/auth/login`, { method: 'POST', body: form })
    if (!r.ok) throw new Error('Login failed')
    const data = await r.json()
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  const register = async (name, email, password, role) => {
    const r = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role }) })
    if (!r.ok) throw new Error('Register failed')
    const data = await r.json()
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setMe(null)
  }

  return { token, me, login, register, logout }
}

function Layout({ children }) {
  const { token, me, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">SX</span>
            <span>Sportex</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 ml-6 text-slate-600">
            <Link to="/athletes" className="hover:text-slate-900 flex items-center gap-1"><User size={18}/>Athletes</Link>
            <Link to="/teams" className="hover:text-slate-900 flex items-center gap-1"><Users size={18}/>Teams</Link>
            <Link to="/events" className="hover:text-slate-900 flex items-center gap-1"><Calendar size={18}/>Events</Link>
            <Link to="/dashboard" className="hover:text-slate-900 flex items-center gap-1"><BarChart2 size={18}/>Dashboard</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {me ? (
              <>
                <Link to="/notifications" className="p-2 rounded hover:bg-slate-100"><Bell size={18}/></Link>
                <span className="text-sm text-slate-700 hidden sm:block">{me.name} • {me.role}</span>
                <button onClick={logout} className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm">Logout</button>
              </>
            ) : (
              <Link to="/auth" className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm flex items-center gap-1"><LogIn size={18}/> Sign in</Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="py-10 text-center text-slate-500">© {new Date().getFullYear()} Sportex. Show your game. Get discovered.</footer>
    </div>
  )
}

function Landing() {
  const navigate = useNavigate()
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Show your game. Get discovered.</h1>
        <p className="mt-4 text-slate-600">Profiles for athletes, simple team management for coaches, and clean event tools for organizers.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={()=>navigate('/auth')} className="px-5 py-3 rounded bg-orange-500 text-white font-semibold">Create profile</button>
          <button onClick={()=>navigate('/events')} className="px-5 py-3 rounded border border-slate-300">Browse events</button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-6 text-white">
        <h3 className="font-semibold">Fast stats</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <StatCard k="Athletes" v="100+"/>
          <StatCard k="Teams" v="10+"/>
          <StatCard k="Events" v="5"/>
        </div>
      </div>
    </div>
  )
}

function StatCard({k, v}){
  return (
    <div className="bg-white/10 rounded p-4">
      <div className="text-sm text-white/80">{k}</div>
      <div className="text-2xl font-bold">{v}</div>
    </div>
  )
}

function AuthPage(){
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('athlete')
  const [error, setError] = useState('')
  const onSubmit = async (e)=>{
    e.preventDefault()
    try{
      if(mode==='login') await login(email, password)
      else await register(name, email, password, role)
      window.location.href='/'
    }catch(err){ setError(err.message) }
  }
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">{mode==='login'?'Sign in':'Create account'}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        {mode==='register' && (
          <input className="w-full border p-2 rounded" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
        )}
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {mode==='register' && (
          <select className="w-full border p-2 rounded" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="athlete">Athlete</option>
            <option value="coach">Coach/Manager</option>
            <option value="organizer">Organizer</option>
          </select>
        )}
        <button className="w-full bg-slate-900 text-white rounded py-2">{mode==='login'?'Sign in':'Create account'}</button>
        <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')} className="w-full text-slate-600 text-sm">{mode==='login'?"Need an account? Register":"Have an account? Sign in"}</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
      <div className="mt-4 text-sm text-slate-500">Social login coming soon.</div>
    </div>
  )
}

function AthletesList(){
  const [q, setQ] = useState({ sport:'', position:'', location:'', statKey:'', statVal:'' })
  const [data, setData] = useState({ results:[], total:0 })
  const search = async()=>{
    const params = new URLSearchParams()
    if(q.sport) params.set('sport', q.sport)
    if(q.position) params.set('position', q.position)
    if(q.location) params.set('location', q.location)
    if(q.statKey && q.statVal) { params.set('min_stat_key', q.statKey); params.set('min_stat_value', q.statVal) }
    const r = await fetch(`${API_BASE}/athletes?${params.toString()}`)
    const d = await r.json(); setData(d)
  }
  useEffect(()=>{ search() },[])
  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-2 mb-4">
        <input className="border p-2 rounded" placeholder="Sport" value={q.sport} onChange={e=>setQ({...q, sport:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Position" value={q.position} onChange={e=>setQ({...q, position:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Location" value={q.location} onChange={e=>setQ({...q, location:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Min stat key (e.g., ppg)" value={q.statKey} onChange={e=>setQ({...q, statKey:e.target.value})}/>
        <input className="border p-2 rounded w-24" placeholder="Value" value={q.statVal} onChange={e=>setQ({...q, statVal:e.target.value})}/>
        <button onClick={search} className="px-4 py-2 bg-orange-500 text-white rounded">Search</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.results.map((a,i)=> (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200"/>
              <div>
                <div className="font-semibold">{a.position || 'Athlete'}</div>
                <div className="text-sm text-slate-600">{a.sport}</div>
              </div>
            </div>
            {a.stats && <div className="mt-3 text-sm text-slate-700">PPG: {a.stats.ppg ?? '-'} • APG: {a.stats.apg ?? '-'}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function EventsPage(){
  const [data, setData] = useState({ results:[] })
  useEffect(()=>{ fetch(`${API_BASE}/events`).then(r=>r.json()).then(setData) },[])
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data.results.map((e,i)=> (
        <div key={i} className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-slate-500">{e.sport}</div>
          <div className="text-xl font-bold">{e.title}</div>
          <div className="text-sm text-slate-600">{new Date(e.starts_at).toLocaleString()} • {e.location}</div>
          <Link to={`/event/${e.id || e._id}`} className="mt-3 inline-block text-orange-600">View</Link>
        </div>
      ))}
    </div>
  )
}

function EventDetail({eventId}){
  const { token } = useAuth()
  const [evt, setEvt] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(()=>{ fetch(`${API_BASE}/events/${eventId}`).then(r=>r.json()).then(setEvt) },[eventId])
  const register = async()=>{
    const r = await fetch(`${API_BASE}/events/${eventId}/register`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
    const d = await r.json(); setMsg(d.status?`Registered: ${d.status}`:'Registered')
  }
  if(!evt) return null
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="text-sm text-slate-500">{evt.sport}</div>
      <div className="text-2xl font-bold">{evt.title}</div>
      <div className="text-sm text-slate-600 mb-4">{new Date(evt.starts_at).toLocaleString()} • {evt.location}</div>
      <p className="text-slate-700 mb-4">{evt.description}</p>
      <button onClick={register} className="px-4 py-2 bg-slate-900 text-white rounded">Register</button>
      {msg && <div className="mt-3 text-green-600">{msg}</div>}
    </div>
  )
}

function Dashboard(){
  const { token } = useAuth()
  const [data, setData] = useState(null)
  useEffect(()=>{ if(token){ fetch(`${API_BASE}/dashboard/coach`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(setData) } },[token])
  if(!token) return <div className="text-slate-600">Sign in to view your dashboard.</div>
  if(!data) return null
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow p-4"><h3 className="font-bold mb-2">Teams</h3>{data.teams.map((t,i)=>(<div key={i} className="text-sm">{t.name}</div>))}</div>
      <div className="bg-white rounded-xl shadow p-4"><h3 className="font-bold mb-2">Events</h3>{data.events.map((e,i)=>(<div key={i} className="text-sm">{e.title}</div>))}</div>
      <div className="bg-white rounded-xl shadow p-4"><h3 className="font-bold mb-2">Registrations</h3>{data.registrations.map((r,i)=>(<div key={i} className="text-sm">{r.event_id} • {r.user_id}</div>))}</div>
    </div>
  )
}

function Notifications(){
  const { token } = useAuth()
  const [data, setData] = useState({ results:[] })
  useEffect(()=>{ if(token){ fetch(`${API_BASE}/notifications`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(setData) } },[token])
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-bold">Notifications</h3>
      <div className="mt-3 space-y-2">
        {data.results.map((n,i)=>(<div key={i} className="text-sm">{n.title} – {n.body}</div>))}
      </div>
    </div>
  )
}

function Router(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/auth" element={<AuthPage/>} />
          <Route path="/athletes" element={<AthletesList/>} />
          <Route path="/events" element={<EventsPage/>} />
          <Route path="/event/:id" element={<EventRoute/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/notifications" element={<Notifications/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

function EventRoute(){
  const [id, setId] = useState(window.location.pathname.split('/').pop())
  return <EventDetail eventId={id} />
}

export default Router
