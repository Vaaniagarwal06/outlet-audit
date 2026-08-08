import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import {
  AlertTriangle, ArrowLeft, ArrowRight, Camera, Check, ChevronRight, Clipboard,
  ClipboardCheck, Cloud, CloudOff, FileDown, Filter, Gauge, ListChecks, LoaderCircle,
  CalendarDays, ChartNoAxesCombined, Clock3, MapPin, Medal, Pencil, Plus, Trash2, X,
} from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAudits } from './AuditContext'
import { BRANDS, aggregateAudits, checkpoint, dateLabel, delayLabel, delayTone, failures, prettyStatus, scoreTone, summaryText } from './auditData'
import Leaderboard from "./pages/Leaderboard";
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Calendar from "./pages/Calendar";
import { MonthlyReport, WeeklyReport } from "./Operations";

const TONE_HEX = { green: '#16803c', amber: '#b96c00', red: '#ba2f2f' }

function AuditHeader() {
  const { cloudState } = useAudits()
  const connected = cloudState === 'connected'
  return <header className="topbar print-hidden">
    <Link className="brand-lockup" to="/" aria-label="Outlet Audit home"><span className="brand-mark"><ListChecks size={19} /></span><span>OUTLET <b>AUDIT</b></span></Link>
    <nav className="main-nav" aria-label="Primary navigation"><Link to="/"><ChartNoAxesCombined size={15} /> Dashboard</Link><Link to="/calendar"><CalendarDays size={15} /> Calendar</Link><Link to="/analytics/weekly"><Clock3 size={15} /> Reports</Link><Link to="/leaderboards"><Medal size={15} /> Rankings</Link></nav>
    <div className={`sync-state ${cloudState === 'checking' ? 'checking' : connected ? 'online' : 'offline'}`}>
      {cloudState === 'checking' ? <LoaderCircle size={15} className="spin" /> : connected ? <Cloud size={15} /> : <CloudOff size={15} />}
      <span>{cloudState === 'checking' ? 'Checking storage' : connected ? 'Cloud saved' : 'Saved on this device'}</span>
    </div>
  </header>
}

function Layout({ children }) {
  return (
    <div className="dashboard">

      <Sidebar />

      <main className="dashboard-content">

        <Header />

        <div className="page-shell">

          {children}

        </div>

      </main>

    </div>
  );
}

function ScoreBadge({ score, compact = false }) {
  return <span className={`score-badge ${scoreTone(score)} ${compact ? 'compact' : ''}`}>{score}%</span>
}

function EmptyState() {
  return <div className="empty-state"><span className="empty-icon"><ClipboardCheck size={30} /></span><h2>No audits yet</h2><p>Start an outlet audit to capture checks, evidence, and a report your operations team can act on.</p><Link to="/new" className="button primary"><Plus size={18} /> Start New Audit</Link></div>
}

function AuditList({ audits, compact = false }) {
  const { removeAudit } = useAudits()
  const deleteAudit = async (audit) => {
    if (window.confirm(`Delete the audit for ${audit.outletName}? This cannot be undone.`)) await removeAudit(audit.id)
  }
  if (!audits.length) return compact ? <div className="no-results">No audits match the selected filters.</div> : <EmptyState />
  return <div className="audit-list">
      {audits.map((audit) => <article className="audit-row" key={audit.id}>
        <Link to={`/audit/${audit.id}/summary`} className="audit-main"><span className="outlet-icon"><MapPin size={19} /></span><div className="audit-ident"><h3>{audit.outletName}</h3><p>{audit.brand} <span>·</span> {dateLabel(audit.dateTime)}</p></div><span className={`status-pill ${audit.status}`}>{prettyStatus(audit.status)}</span><ScoreBadge score={audit.overallScore} compact /><ChevronRight className="row-chevron" size={19} /></Link>
        <div className="audit-actions"><Link to={`/audit/${audit.id}`} title="Edit audit"><Pencil size={17} /></Link><button onClick={() => deleteAudit(audit)} title="Delete audit"><Trash2 size={17} /></button></div>
      </article>)}
  </div>
}

function Home() { return <Dashboard Layout={Layout} AuditList={AuditList} /> }

function NewAudit() {
  const navigate = useNavigate()
  const { beginAudit, lastAuditor } = useAudits()
  const [form, setForm] = useState({ outletName: '', brand: '', auditorName: lastAuditor })
  const submit = (event) => {
    event.preventDefault()
    const audit = beginAudit(form)
    navigate(`/audit/${audit.id}`)
  }
  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))
  return <Layout><section className="form-page"><Link className="back-link" to="/"><ArrowLeft size={17} /> Audit register</Link><div className="form-heading"><p className="eyebrow">NEW INSPECTION</p><h1>Start an outlet audit</h1><p>Set the context once. Your audit is saved as soon as it begins.</p></div><form className="audit-form" onSubmit={submit}>
    <label>Outlet name<input autoFocus required maxLength="120" value={form.outletName} onChange={update('outletName')} placeholder="e.g. Malda Food Court" /></label>
    <label>Brand<select required value={form.brand} onChange={update('brand')}><option value="" disabled>Select brand</option>{BRANDS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label>Auditor name<input required maxLength="120" value={form.auditorName} onChange={update('auditorName')} placeholder="Your full name" /></label>
    <button className="button primary form-submit" type="submit">Begin Audit <ArrowRight size={18} /></button>
  </form></section></Layout>
}

function NotFound() { return <Layout><div className="empty-state"><h2>Audit not found</h2><p>It may have been deleted or is not available on this device.</p><Link className="button primary" to="/">Back to audits</Link></div></Layout> }

function ProgressHeader({ audit, index, seen }) {
  const amount = ((index + 1) / 12) * 100
  return <><div className="audit-flow-top"><Link className="back-link" to={`/audit/${audit.id}/summary`}><ArrowLeft size={17} /> Exit audit</Link><div className="flow-count"><b>{index + 1}</b> of 12 <span>· {seen.length}/12 reviewed</span></div></div><div className="progress-rail"><span style={{ width: `${amount}%` }} /></div></>
}

function StatusPicker({ value, onChange }) {
  return <div className="status-picker" role="radiogroup" aria-label="Checkpoint status">
    {[['pass', 'Pass'], ['fail', 'Fail'], ['na', 'N/A']].map(([key, label]) => <button type="button" role="radio" aria-checked={value === key} key={key} className={value === key ? `selected ${key}` : ''} onClick={() => onChange(key)}>{key === 'pass' && <Check size={15} />}{key === 'fail' && <X size={15} />}{label}</button>)}
  </div>
}

async function compressPhoto(file) {
  const compressed = await imageCompression(file, { maxWidthOrHeight: 800, initialQuality: 0.7, fileType: 'image/jpeg', useWebWorker: true })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(compressed)
  })
}

function CheckpointCard({ item, parameterScore, onChange, onDelete, onPhoto, onPhotoDelete }) {
  const [renaming, setRenaming] = useState(false)
  const fileInput = useRef(null)
  const delayStatus = item.delayStatus || 'Not Completed'
  return <article className={`checkpoint ${item.status === 'fail' ? 'is-failed' : ''}`}>
    <div className="checkpoint-head"><div className="checkpoint-title">{renaming ? <input value={item.title} onChange={(event) => onChange({ title: event.target.value })} onBlur={() => setRenaming(false)} onKeyDown={(event) => event.key === 'Enter' && setRenaming(false)} autoFocus /> : <h3>{item.title}</h3>}<button type="button" className="icon-button subtle" title="Rename checkpoint" onClick={() => setRenaming(true)}><Pencil size={14} /></button></div><button type="button" className="icon-button danger subtle" title="Delete checkpoint" onClick={onDelete}><Trash2 size={16} /></button></div>
    <StatusPicker value={item.status} onChange={(status) => onChange({ status })} />
    <div className="timing-grid">

<label>
  <span>Deadline Time</span>
  <input
    type="time"
    value={item.deadlineTime || ""}
    onChange={(e) =>
      onChange({ deadlineTime: e.target.value })
    }
  />
</label>

<label>
  <span>Completion Time</span>
  <input
    type="time"
    value={item.completedTime || ""}
    onChange={(e) =>
      onChange({ completedTime: e.target.value })
    }
  />
</label>

<div className="delay-readout">
  <span>Auto Delay</span>

  <strong>{delayLabel(item.delayMinutes)}</strong>

  <b className={`delay-badge ${delayTone(delayStatus, item.delayMinutes)}`}>
    {delayStatus}
  </b>
</div>

</div>

  
    <label className="notes-field"><span>Notes</span><textarea value={item.notes} onChange={(event) => onChange({ notes: event.target.value })} placeholder="Add detail, corrective action, or context…" rows="2" /></label>
    <div className="evidence-row"><input ref={fileInput} className="visually-hidden" type="file" accept="image/*" capture="environment" multiple onChange={(event) => { onPhoto([...event.target.files]); event.target.value = '' }} /><button type="button" className="photo-button" onClick={() => fileInput.current?.click()}><Camera size={16} /> Add photo</button>{item.photos?.length > 0 && <div className="photo-strip">{item.photos.map((photo, index) => <span className="photo-thumb" key={`${photo.base64.slice(-18)}-${index}`}><img src={photo.base64} alt={`Evidence ${index + 1}`} /><button type="button" title="Remove photo" onClick={() => onPhotoDelete(index)}><X size={13} /></button></span>)}</div>}<span className="card-parameter-score">Parameter score <ScoreBadge score={parameterScore} compact /></span></div>
  </article>
}

function AuditFlow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { getAudit, updateAudit, visit, visited } = useAudits()

  const audit = getAudit(id)
  const index = Math.max(0, Math.min(11, Number(searchParams.get("step") || 0)))

  useEffect(() => {
    if (audit) visit(audit.id, index)
  }, [audit?.id, index, visit])

  if (!audit) return <NotFound />

  const parameter = audit.parameters[index]
  const seen = visited(audit)

  const patchItem = (checkpointId, patch) =>
    updateAudit(audit.id, current => ({
      ...current,
      parameters: current.parameters.map((param, paramIndex) =>
        paramIndex !== index
          ? param
          : {
              ...param,
              checkpoints: param.checkpoints.map(item =>
                item.id !== checkpointId
                  ? item
                  : { ...item, ...patch }
              )
            }
      )
    }))

  const remove = checkpointId =>
    updateAudit(audit.id, current => ({
      ...current,
      parameters: current.parameters.map((param, paramIndex) =>
        paramIndex !== index
          ? param
          : {
              ...param,
              checkpoints: param.checkpoints.filter(
                item => item.id !== checkpointId
              )
            }
      )
    }))

  const add = () =>
    updateAudit(audit.id, current => ({
      ...current,
      parameters: current.parameters.map((param, paramIndex) =>
        paramIndex !== index
          ? param
          : {
              ...param,
              checkpoints: [...param.checkpoints, checkpoint()]
            }
      )
    }))

  const upload = async (checkpointId, files) => {
    if (!files.length) return

    try {
      const photos = await Promise.all(files.map(compressPhoto))

      updateAudit(audit.id, current => ({
        ...current,
        parameters: current.parameters.map((param, paramIndex) =>
          paramIndex !== index
            ? param
            : {
                ...param,
                checkpoints: param.checkpoints.map(item =>
                  item.id !== checkpointId
                    ? item
                    : {
                        ...item,
                        photos: [
                          ...item.photos,
                          ...photos.map(base64 => ({ base64 }))
                        ]
                      }
                )
              }
        )
      }))
    } catch {
      window.alert("One or more photos could not be compressed.")
    }
  }

  const next = () =>
    index < 11
      ? setSearchParams({ step: String(index + 1) })
      : navigate(`/audit/${audit.id}/summary`)

  return (
    <Layout>
      <section className="flow-page">
        <ProgressHeader audit={audit} index={index} seen={seen} />

        <div className="parameter-title">
          <div>
            <p className="eyebrow">AUDIT PARAMETER</p>
            <h1>{parameter.name}</h1>
          </div>

          <div className="parameter-score">
            <span>Current score</span>
            <ScoreBadge score={parameter.score} />
          </div>
        </div>

        <div className="checkpoint-list">
          {parameter.checkpoints.map(item => (
            <CheckpointCard
              key={item.id}
              item={item}
              parameterScore={parameter.score}
              onChange={patch => patchItem(item.id, patch)}
              onDelete={() => remove(item.id)}
              onPhoto={files => upload(item.id, files)}
              onPhotoDelete={photoIndex =>
                patchItem(item.id, {
                  photos: item.photos.filter((_, i) => i !== photoIndex)
                })
              }
            />
          ))}
        </div>

        <button
          type="button"
          className="add-checkpoint"
          onClick={add}
        >
          <Plus size={17} /> Add checkpoint
        </button>

        <nav className="flow-nav print-hidden">
          <button
            className="button secondary"
            disabled={index === 0}
            onClick={() =>
              setSearchParams({ step: String(index - 1) })
            }
          >
            <ArrowLeft size={17} /> Back
          </button>

          <button className="button primary" onClick={next}>
            {index === 11 ? "Review summary" : "Next parameter"}
            <ArrowRight size={17} />
          </button>
        </nav>
      </section>
    </Layout>
  )
}

function CopyButton({ audit }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(summaryText(audit)); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { window.prompt('Copy the audit summary:', summaryText(audit)) }
  }
  return <button className="button secondary" onClick={copy}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Copied' : 'Copy Summary'}</button>
}

function Summary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAudit, updateAudit, removeAudit, visited } = useAudits()
  const audit = getAudit(id)
  if (!audit) return <NotFound />
  const seen = visited(audit)
  const missing = 12 - seen.length
  const redFlags = failures(audit)
  const auditMetrics = aggregateAudits([audit])
  const finish = () => {
    if (missing) { window.alert(`Review all ${missing} remaining parameter${missing === 1 ? '' : 's'} before completing the audit.`); navigate(`/audit/${audit.id}?step=${seen.length ? seen.findIndex((_, index) => !seen.includes(index)) : 0}`); return }
    updateAudit(audit.id, { ...audit, status: 'completed' })
  }
  const deleteAudit = async () => { if (window.confirm(`Delete the audit for ${audit.outletName}? This cannot be undone.`)) { await removeAudit(audit.id); navigate('/') } }
  const chartData = audit.parameters.map((parameter) => ({ name: parameter.name, score: parameter.score, tone: scoreTone(parameter.score) }))
  return <Layout><section className="summary-page print-report"><Link className="back-link print-hidden" to="/"><ArrowLeft size={17} /> Audit register</Link><div className="summary-intro"><div><p className="eyebrow">AUDIT REPORT</p><h1>{audit.outletName}</h1><p>{audit.brand} <span>·</span> {dateLabel(audit.dateTime)} <span>·</span> {audit.auditorName}</p></div><div className={`overall-score ${scoreTone(audit.overallScore)}`}><span>Overall score</span><strong>{audit.overallScore}<small>%</small></strong><b>{scoreTone(audit.overallScore) === 'green' ? 'On standard' : scoreTone(audit.overallScore) === 'amber' ? 'Needs attention' : 'Action required'}</b></div></div>
    <div className="report-actions print-hidden"><Link className="button secondary" to={`/audit/${audit.id}`}><Pencil size={17} /> Edit Audit</Link><button className="button secondary" onClick={() => window.print()}><FileDown size={17} /> Export PDF</button><CopyButton audit={audit} /><button className="button danger-button" onClick={deleteAudit}><Trash2 size={17} /> Delete</button>{audit.status === 'completed' ? <span className="completed-state"><Check size={17} /> Completed</span> : <button className="button primary" onClick={finish}><Check size={17} /> Complete audit</button>}</div>
    {audit.status !== 'completed' && <div className={`review-notice print-hidden ${missing ? 'warning' : 'ready'}`}>{missing ? <><AlertTriangle size={19} /><span><b>{missing} parameter{missing === 1 ? '' : 's'} not reviewed.</b> Audit completion is locked until every parameter has been visited.</span></> : <><Check size={19} /><span>All 12 parameters reviewed. This audit is ready to complete.</span></>}</div>}
    <section className="audit-metric-strip"><article><span>Average delay</span><strong>{delayLabel(auditMetrics.averageDelay)}</strong></article><article><span>Longest delay</span><strong>{delayLabel(auditMetrics.longestDelay)}</strong></article><article><span>Delayed tasks</span><strong>{auditMetrics.delayedTasks}</strong></article><article><span>On-time %</span><strong>{auditMetrics.onTimePercent}%</strong></article><article><span>Pass %</span><strong>{auditMetrics.passPercent}%</strong></article><article><span>Fail %</span><strong>{auditMetrics.failPercent}%</strong></article><article><span>N/A %</span><strong>{auditMetrics.naPercent}%</strong></article></section>
    <section className="score-section"><div className="section-head"><div><p className="eyebrow">SCORECARD</p><h2>Parameter scores</h2></div><Gauge size={23} /></div><div className="score-grid">{audit.parameters.map((parameter) => <article className="parameter-card" key={parameter.name}><div><h3>{parameter.name}</h3><p>{parameter.checkpoints.filter((item) => item.status === 'pass').length} pass · {parameter.checkpoints.filter((item) => item.status === 'fail').length} fail</p></div><ScoreBadge score={parameter.score} /></article>)}</div>
      <div className="chart-wrap print-hidden"><ResponsiveContainer width="100%" height={260}><BarChart data={chartData} margin={{ top: 6, right: 4, left: -28, bottom: 0 }}><XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fontSize: 11, fill: '#71808c' }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f0f3f1' }} formatter={(value) => `${value}%`} labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''} /><Bar
  dataKey="score"
  radius={[6, 6, 0, 0]}
  maxBarSize={34}
  minPointSize={8}
>{chartData.map((entry) => <Cell key={entry.name} fill="#14B8A6"/>)}</Bar></BarChart></ResponsiveContainer></div>
    </section>
    <section className="department-summary"><div className="section-head"><div><p className="eyebrow">DEPARTMENT SCORES</p><h2>Operational compliance</h2></div></div><div className="department-score-grid">{auditMetrics.departments.map((department) => <article key={department.name}><span>{department.name}</span><strong className={scoreTone(department.score)}>{department.score}%</strong><small>{department.failures} fail · {department.delays} delayed</small></article>)}</div></section>
    <section className="red-flags"><div className="section-head"><div><p className="eyebrow">EXCEPTIONS</p><h2>Red flags</h2></div><span className={`flag-count ${redFlags.length ? 'has-flags' : ''}`}>{redFlags.length} failed</span></div>{!redFlags.length ? <div className="all-clear"><Check size={21} /><span>No failed checkpoints recorded.</span></div> : <div className="flags-list">{redFlags.map((flag) => <article className="flag-card" key={flag.id}><div className="flag-marker"><AlertTriangle size={17} /></div><div><p>{flag.parameter}</p><h3>{flag.title}</h3><div className="timing-details"><span>Deadline <b>{flag.deadlineTime || '—'}</b></span><span>Completion <b>{flag.completedTime || '—'}</b></span><span>Delay <b className={delayTone(flag.delayStatus || 'Not Completed', flag.delayMinutes)}>{delayLabel(flag.delayMinutes)}</b></span></div>{flag.notes && <div className="flag-notes">{flag.notes}</div>}{flag.photos?.length > 0 && <div className="flag-photos">{flag.photos.map((photo, index) => <img key={`${flag.id}-${index}`} src={photo.base64} alt={`Evidence for ${flag.title}`} />)}</div>}</div></article>)}</div>}</section>
    <footer className="report-footer print-only">Generated by Outlet Audit · {new Date().toLocaleString('en-IN')}</footer>
  </section></Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/new" element={<NewAudit />} />

      <Route path="/audit/:id" element={<AuditFlow />} />
      <Route path="/audit/:id/summary" element={<Summary />} />
      
      <Route
  path="/calendar"
  element={<Calendar />}
 />
      
      <Route
  path="/analytics"
  element={<Analytics />}
/>

      <Route
        path="/analytics/weekly"
        element={<WeeklyReport Layout={Layout} />}
      />

      <Route
        path="/analytics/monthly"
        element={<MonthlyReport Layout={Layout} />}
      />

<Route
  path="/leaderboards"
  element={<Leaderboard />}
/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
