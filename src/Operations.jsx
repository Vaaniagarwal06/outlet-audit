import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, CalendarDays, CheckCircle2, ChevronLeft,
  ChevronRight, ClipboardList, Clock3, Cloud, CloudOff, Download, FileBarChart, Gauge,
  LayoutDashboard, ListChecks, LoaderCircle, MapPin, Medal, Menu, Plus, Settings, ShieldAlert,
  TrendingDown, TrendingUp, Trophy, Users,
} from 'lucide-react'
import './dashboard/dashboard.css'
import { useAudits } from './AuditContext'
import {
  BRANDS, DEPARTMENTS, aggregateAudits, auditDateKey, dateLabel, dayLabel, delayLabel,
  filterAudits, leaderboardFor, monthInputValue, parseWeekInput, rangeForMonth,
  rangeLabel, scoreTone, startOfWeek, endOfWeek, weekInputValue,
} from './auditData'

const COLOURS = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444', slate: '#738187', lime: '#1e6f5c', primary: '#1e6f5c' }
const PIE_COLOURS = ['#16803c', '#ba2f2f', '#b96c00', '#829093']
const EMPTY_FILTERS = { outlet: '', brand: '', department: '', state: '', start: '', end: '' }

const IconMetric = ({ label, value, detail, tone = '' }) => <article className={`metric-card ${tone}`}><p>{label}</p><strong>{value}</strong>{detail && <span>{detail}</span>}</article>

function PrintButton() { return <button className="button secondary print-hidden" onClick={() => window.print()}><Download size={16} /> Export PDF</button> }

function ReportFilters({ audits, filters, setFilters, allowDates = true }) {
  const outlets = [...new Set(audits.map((audit) => audit.outletName))].sort()
  const update = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }))
  return <section className="report-filter-panel print-hidden" aria-label="Report filters">
    <label><span>Outlet</span><select value={filters.outlet} onChange={update('outlet')}><option value="">All outlets</option>{outlets.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label><span>Brand</span><select value={filters.brand} onChange={update('brand')}><option value="">All brands</option>{BRANDS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label><span>Department</span><select value={filters.department} onChange={update('department')}><option value="">All departments</option>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label><span>Task state</span><select value={filters.state} onChange={update('state')}><option value="">All task states</option><option value="pass">Pass</option><option value="fail">Fail</option><option value="delayed">Delayed</option><option value="completed">Completed audits</option></select></label>
    {allowDates && <><label><span>From</span><input type="date" value={filters.start} onChange={update('start')} /></label><label><span>To</span><input type="date" value={filters.end} onChange={update('end')} /></label></>}
  </section>
}

function MetricGrid({ metrics, compact = false }) { return <div className={`metric-grid ${compact ? 'compact-metrics' : ''}`}>{metrics.map((metric) => <IconMetric key={metric.label} {...metric} />)}</div> }

function EmptyReport({ title = 'No audit data in this period' }) { return <div className="analytics-empty"><Clock3 size={22} /><span>{title}</span></div> }

function ChartBox({ title, children, wide = false }) { return <section className={`analytics-chart ${wide ? 'wide' : ''}`}><h3>{title}</h3>{children}</section> }

function TooltipValue({ suffix = '' }) { return <Tooltip formatter={(value) => `${value}${suffix}`} cursor={{ fill: '#f1f4f1' }} /> }

function LeaderboardTable({ rows, type = 'Daily' }) {
  if (!rows.length) return <EmptyReport title={`No ${type.toLowerCase()} outlet ranking yet`} />
  return <div className="leaderboard-table"><div className="leaderboard-header"><span>Rank</span><span>Outlet</span><span>Score</span><span>Avg. delay</span><span>{type === 'Daily' ? 'Audits' : 'Movement'}</span></div>{rows.map((item) => <div className={`leader-row ${item.rank === 1 ? 'leader' : ''}`} key={item.outlet}><span className="rank">{item.rank === 1 ? <Trophy size={16} /> : item.rank}</span><span className="leader-outlet">{item.outlet}{item.rank === 1 && <em>Leading outlet</em>}</span><span className={`mini-score ${scoreTone(item.score)}`}>{item.score}%</span><span>{delayLabel(item.averageDelay)}</span><span className={`rank-change ${item.rankChange == null ? 'new' : item.rankChange > 0 ? 'up' : item.rankChange < 0 ? 'down' : ''}`}>{type === 'Daily' ? item.audits : item.rankChange == null ? 'New' : item.rankChange > 0 ? <><TrendingUp size={14} /> +{item.rankChange}</> : item.rankChange < 0 ? <><TrendingDown size={14} /> {item.rankChange}</> : '—'}</span></div>)}</div>
}

function DepartmentScores({ departments }) { return <div className="department-score-grid">{departments.map((department) => <article key={department.name}><span>{department.name}</span><strong className={scoreTone(department.score)}>{department.score}%</strong><small>{department.failures} fail · {department.delays} delayed</small></article>)}</div> }

function Heatmap({ audits }) {
  const outlets = [...new Set(audits.map((audit) => audit.outletName))].slice(0, 6)
  if (!outlets.length) return <EmptyReport title="Heatmap appears once audits are available" />
  return <div className="heatmap"><div className="heatmap-row heatmap-head"><span>Outlet</span>{DEPARTMENTS.map((department) => <span key={department}>{department.slice(0, 4)}</span>)}</div>{outlets.map((outlet) => {
    const report = aggregateAudits(audits.filter((audit) => audit.outletName === outlet))
    return <div className="heatmap-row" key={outlet}><span>{outlet}</span>{report.departments.map((department) => <span className={`heat-cell ${scoreTone(department.score)}`} key={department.name} title={`${outlet}: ${department.name} ${department.score}%`}>{department.score || '—'}</span>)}</div>
  })}</div>
}

function greetingFor(date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function DashboardSidebar({ collapsed, onToggle, cloudState, mobileOpen, onMobileClose }) {
  const connected = cloudState === 'connected'
  const nav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/new', label: 'New Audit', icon: Plus },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/analytics', label: 'Analytics', icon: FileBarChart },
    { to: '/leaderboards', label: 'Rankings', icon: Medal },
    { to: '/settings', label: 'Settings', icon: Settings, disabled: true },
  ]
  return <>
    <button type="button" className="dash-sidebar-backdrop" aria-label="Close navigation" onClick={onMobileClose} />
    <aside className="dash-sidebar" aria-label="Operations navigation">
    <div className="dash-sidebar-brand">

<div className="brand-logo">
  <ListChecks size={24} />
</div>

<div className="brand-details">
  <small>Operations Command Centre</small>
  <h2>OUTLET AUDIT</h2>
</div>

</div>
      <nav className="dash-nav">
        {nav.map(({ to, label, icon: Icon, end, disabled }) => disabled
          ? <span key={to} className="dash-nav-link" aria-disabled="true" title="Settings coming soon"><Icon size={18} /><span className="dash-nav-label">{label}</span></span>
          : <NavLink key={to} to={to} end={end} className={({ isActive }) => `dash-nav-link${isActive ? ' is-active' : ''}`} onClick={onMobileClose}><Icon size={18} /><span className="dash-nav-label">{label}</span></NavLink>)}
      </nav>
      <div className="dash-sidebar-foot">
        <div className={`dash-cloud ${cloudState === 'checking' ? 'checking' : connected ? 'online' : 'offline'}`}>
          <span className="dash-cloud-dot" />
          <span className="dash-nav-label">{cloudState === 'checking' ? 'Checking storage…' : connected ? 'Cloud Connected' : 'Saved on device'}</span>
          {cloudState === 'checking' && <LoaderCircle size={14} className="spin" />}
          {!connected && cloudState !== 'checking' && <CloudOff size={14} />}
          {connected && <Cloud size={14} />}
        </div>
        <button type="button" className="dash-sidebar-toggle print-hidden" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <span className="dash-nav-label">{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>
    </aside>
  </>
}

function KpiCard({ icon: Icon, label, value, subtitle, trend, trendLabel, tone = '' }) {
  return <article className="dash-card dash-kpi">
    <div className="dash-kpi-top">
      <span className={`dash-kpi-icon ${tone}`}><Icon size={20} /></span>
      {trendLabel && <span className={`dash-trend ${trend}`}>{trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}{trendLabel}</span>}
    </div>
    <strong className="dash-kpi-value">{value}</strong>
    <p className="dash-kpi-label">{label}</p>
    {subtitle && <p className="dash-kpi-sub">{subtitle}</p>}
  </article>
}

function LiveAlerts({ audits, overall, daily, openCount }) {
  const alerts = useMemo(() => {
    const items = []
    if (overall.failedTasks) items.push({ tone: 'danger', icon: ShieldAlert, title: `${overall.failedTasks} critical failure${overall.failedTasks === 1 ? '' : 's'}`, detail: 'Across selected audits' })
    if (overall.delayedTasks) items.push({ tone: 'warning', icon: Clock3, title: `${overall.delayedTasks} delayed task${overall.delayedTasks === 1 ? '' : 's'}`, detail: `Average delay ${delayLabel(overall.averageDelay)}` })
    if (openCount) items.push({ tone: 'info', icon: ClipboardList, title: `${openCount} open audit${openCount === 1 ? '' : 's'}`, detail: 'Awaiting completion' })
    if (daily.failedTasks) items.push({ tone: 'danger', icon: AlertTriangle, title: `${daily.failedTasks} failure${daily.failedTasks === 1 ? '' : 's'} today`, detail: `${daily.totalAudits} audit${daily.totalAudits === 1 ? '' : 's'} recorded today` })
    overall.failures.slice(0, 3).forEach((item) => items.push({ tone: 'warning', icon: AlertTriangle, title: item.name, detail: `${item.count} occurrence${item.count === 1 ? '' : 's'}` }))
    audits.filter((audit) => audit.status === 'in_progress').slice(0, 2).forEach((audit) => items.push({ tone: 'info', icon: MapPin, title: audit.outletName, detail: `${audit.brand} · In progress` }))
    return items.slice(0, 8)
  }, [audits, daily.failedTasks, daily.totalAudits, openCount, overall])
  return <section className="dash-card dash-alerts">
    <div className="dash-card-head"><div><h3>Live Alerts</h3><p>Real-time operational exceptions</p></div></div>
    {alerts.length ? <div className="dash-alerts-list">{alerts.map((alert, index) => <div className="dash-alert-item" key={`${alert.title}-${index}`}><span className={`dash-alert-icon ${alert.tone}`}><alert.icon size={16} /></span><div><b>{alert.title}</b><small>{alert.detail}</small></div></div>)}</div>
      : <div className="dash-alerts-empty"><CheckCircle2 size={28} /><span>All systems nominal — no active alerts.</span></div>}
  </section>
}

export function Dashboard({ AuditList }) {
  const { audits, cloudState } = useAudits()

  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const today = new Date()

  const overall = aggregateAudits(filterAudits(audits, filters))

  const todayAudits = filterAudits(audits, {
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate())
  })

  const daily = aggregateAudits(todayAudits)

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-box">
            <ListChecks size={24} />
          </div>

          <div>
            <small>Operations</small>
            <h2>Outlet Audit</h2>
          </div>
        </div>

        <nav>

          <NavLink to="/">
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/new">
            <Plus size={18} />
            New Audit
          </NavLink>

          <NavLink to="/calendar">
            <CalendarDays size={18} />
            Calendar
          </NavLink>

          <NavLink to="/analytics/weekly">
            <BarChart3 size={18} />
            Reports
          </NavLink>

          <NavLink to="/leaderboards">
            <Medal size={18} />
            Rankings
          </NavLink>

        </nav>

      </aside>

      <main className="content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              OPERATIONS COMMAND CENTRE
            </p>

            <h1>
              Good {greetingFor(today)}
            </h1>

            <span>
              Monitor all outlet activity in one place.
            </span>

          </div>

          <Link
            to="/new"
            className="new-audit-btn"
          >
            <Plus size={18} />
            Start Audit
          </Link>

        </header>

        <ReportFilters
          audits={audits}
          filters={filters}
          setFilters={setFilters}
        />

        <section className="kpi-grid">

          <KpiCard
            icon={Gauge}
            label="Today's Score"
            value={`${daily.averageScore || 0}%`}
            subtitle={`${daily.totalAudits} audits`}
          />

          <KpiCard
            icon={ClipboardList}
            label="Open Audits"
            value={
              audits.filter(
                a => a.status === "in_progress"
              ).length
            }
            subtitle="Currently active"
          />

          <KpiCard
            icon={ShieldAlert}
            label="Critical Issues"
            value={overall.failedTasks}
            subtitle="Need attention"
          />

          <KpiCard
            icon={CheckCircle2}
            label="Completion"
            value={`${overall.completionPercent}%`}
            subtitle="Overall"
          />

        </section>

        <section className="dashboard-placeholder">

          <h2>
            Performance Trend
          </h2>

          <p>
            We'll add the live charts in the next step.
          </p>

        </section>

      </main>

    </div>
  )
}

export function CalendarPage({ Layout }) {
  const { audits } = useAudits(); const [month, setMonth] = useState(() => new Date()); const [selected, setSelected] = useState(null)
  const first = new Date(month.getFullYear(), month.getMonth(), 1); const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); const leading = (first.getDay() + 6) % 7
  const eventsFor = (day) => audits.filter((audit) => auditDateKey(audit.dateTime) === new Date(month.getFullYear(), month.getMonth(), day).toLocaleDateString('en-CA'))
  const selectedAudits = selected ? eventsFor(selected) : []
  const changeMonth = (amount) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  return <Layout><section className="analytics-page"><div className="page-title-row"><div><p className="eyebrow">AUDIT SCHEDULE</p><h1>Calendar</h1><p>Every audit appears on the date it was created.</p></div><PrintButton /></div><div className="calendar-controls print-hidden"><button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Previous month"><ArrowLeft size={18} /></button><h2>{month.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</h2><button className="icon-button" onClick={() => changeMonth(1)} aria-label="Next month"><ArrowRight size={18} /></button></div><div className="calendar-grid"><div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days">{Array.from({ length: leading }).map((_, index) => <div key={`empty-${index}`} className="calendar-day empty" />)}{Array.from({ length: days }, (_, index) => { const day = index + 1; const records = eventsFor(day); return <button key={day} className={`calendar-day ${selected === day ? 'selected' : ''}`} onClick={() => setSelected(day)}><b>{day}</b>{records.slice(0, 2).map((audit) => <span key={audit.id} className={`calendar-event ${scoreTone(audit.overallScore)}`}>{audit.outletName} <em>{audit.overallScore}%</em></span>)}{records.length > 2 && <small>+{records.length - 2} more</small>}</button> })}</div></div>{selected && <section className="calendar-detail"><div className="section-head"><div><p className="eyebrow">{new Date(month.getFullYear(), month.getMonth(), selected).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p><h2>{selectedAudits.length} audit{selectedAudits.length === 1 ? '' : 's'}</h2></div><button className="icon-button print-hidden" onClick={() => setSelected(null)} aria-label="Close selected date">×</button></div>{selectedAudits.length ? <div className="calendar-audit-list">{selectedAudits.map((audit) => <Link to={`/audit/${audit.id}/summary`} key={audit.id}><span className={`calendar-dot ${scoreTone(audit.overallScore)}`} /><div><b>{audit.outletName}</b><small>{audit.brand} · {audit.status === 'completed' ? 'Completed' : 'In progress'}</small></div><strong>{audit.overallScore}%</strong></Link>)}</div> : <EmptyReport title="No audits on this date" />}</section>}</section></Layout>
}

function ReportHeader({ eyebrow, title, description, right }) { return <div className="page-title-row"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><div className="page-actions">{right}<PrintButton /></div></div> }

function FailuresTable({ rows, title }) { return <section className="analytics-table"><h3>{title}</h3>{rows.length ? <ol>{rows.slice(0, 10).map((item) => <li key={item.name}><span>{item.name}</span><b>{item.count}</b></li>)}</ol> : <EmptyReport title="No matching tasks" />}</section> }

function weeklyDelayTrend(records) { const grouped = new Map(); records.rows.forEach((row) => { if (!row.completedTime) return; const key = auditDateKey(row.auditDate); const values = grouped.get(key) || []; values.push(row.delayMinutes || 0); grouped.set(key, values) }); return [...grouped].map(([date, values]) => ({ date, delay: Math.round(values.reduce((sum, item) => sum + item, 0) / values.length) })).sort((a, b) => a.date.localeCompare(b.date)) }

export function WeeklyReport({ Layout }) {
  const { audits } = useAudits(); const [week, setWeek] = useState(() => weekInputValue()); const [filters, setFilters] = useState(EMPTY_FILTERS)
  const weekStart = parseWeekInput(week); const weekEnd = endOfWeek(weekStart); const selected = filterAudits(audits, { ...filters, start: weekStart, end: weekEnd }); const report = aggregateAudits(selected)
  const previousStart = new Date(weekStart); previousStart.setDate(previousStart.getDate() - 7); const previousEnd = endOfWeek(previousStart); const previous = filterAudits(audits, { ...filters, start: previousStart, end: previousEnd })
  const delayTrend = weeklyDelayTrend(report)
  return (
    <Layout>
      <section className="analytics-page">
  
        <ReportHeader
          eyebrow="GOLPO FOOD COURT"
          title="Operations Intelligence"
          description={rangeLabel(weekStart, weekEnd)}
          right={
            <label className="period-input print-hidden">
              <span>Week</span>
              <input
                type="week"
                value={week}
                onChange={(event) => setWeek(event.target.value)}
              />
            </label>
          }
        />

<div className="analytics-tabs">

  <button>Daily</button>

  <button className="active">Weekly</button>

  <button>Monthly</button>

  <button>Custom Range</button>

</div>

<ReportFilters
  audits={audits}
  filters={filters}
  setFilters={setFilters}
/>
    <MetricGrid metrics={[{ label: 'Total Audits', value: report.totalAudits }, { label: 'Average Score', value: `${report.averageScore}%` }, { label: 'Average Delay', value: delayLabel(report.averageDelay) }, { label: 'Delayed Tasks', value: report.delayedTasks, tone: report.delayedTasks ? 'warning' : '' }, { label: 'Failed Tasks', value: report.failedTasks, tone: report.failedTasks ? 'critical' : '' }, { label: 'Pass %', value: `${report.passPercent}%` }, { label: 'Most Failed Department', value: report.mostFailedDepartment, detail: `Best outlet: ${report.bestOutlet}` }, { label: 'Worst Outlet', value: report.worstOutlet, detail: `${report.completionPercent}% task completion` }]} />
    {!report.totalAudits ? <EmptyReport /> : <><section className="section-head"><div><p className="eyebrow">DEPARTMENT PERFORMANCE</p><h2>Operating departments</h2></div></section><DepartmentScores departments={report.departments} /><section className="analytics-grid"><ChartBox title="Average outlet scores" wide><ResponsiveContainer width="100%" height={250}><BarChart data={report.outlets}><XAxis dataKey="outlet" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} /><TooltipValue suffix="%" /><Bar dataKey="score" radius={[4, 4, 0, 0]}>{report.outlets.map((item) => <Cell key={item.outlet} fill={COLOURS[scoreTone(item.score)]} />)}</Bar></BarChart></ResponsiveContainer></ChartBox><ChartBox title="Department scores"><ResponsiveContainer width="100%" height={250}><BarChart data={report.departments} layout="vertical"><XAxis type="number" domain={[0, 100]} /><YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11 }} /><TooltipValue suffix="%" /><Bar dataKey="score" fill={COLOURS.lime} /></BarChart></ResponsiveContainer></ChartBox><ChartBox title="Delay trend">{delayTrend.length ? <ResponsiveContainer width="100%" height={250}><LineChart data={delayTrend}><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><TooltipValue suffix=" min" /><Line type="monotone" dataKey="delay" stroke={COLOURS.amber} strokeWidth={3} /></LineChart></ResponsiveContainer> : <EmptyReport title="Add task times to see delay trend" />}</ChartBox><FailuresTable title="Most failed checkpoints" rows={report.failures} /></section><section className="section-head"><div><p className="eyebrow">WEEKLY RANKING</p><h2>Outlet leaderboard</h2></div></section><LeaderboardTable rows={leaderboardFor(selected, previous)} type="Weekly" /></>}</section></Layout>)
}

export function MonthlyReport({ Layout }) {
  const { audits } = useAudits(); const [month, setMonth] = useState(() => monthInputValue()); const [filters, setFilters] = useState(EMPTY_FILTERS)
  const range = rangeForMonth(month); const selected = filterAudits(audits, { ...filters, start: range.start, end: range.end }); const report = aggregateAudits(selected)
  const previousRange = rangeForMonth(monthInputValue(new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1))); const previous = aggregateAudits(filterAudits(audits, { ...filters, start: previousRange.start, end: previousRange.end }))
  const comparison = report.averageScore - previous.averageScore
  const stacked = [{ name: 'Selected month', Pass: report.statusBreakdown[0].value, Fail: report.statusBreakdown[1].value, Delayed: report.statusBreakdown[2].value, 'N/A': report.statusBreakdown[3].value }]
  return <Layout><section className="analytics-page"><ReportHeader eyebrow="OPERATIONS REPORT" title="Monthly analytics" description={range.start.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} right={<label className="period-input print-hidden"><span>Month</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>} /><ReportFilters audits={audits} filters={filters} setFilters={setFilters} />
    <MetricGrid metrics={[{ label: 'Total Audits', value: report.totalAudits }, { label: 'Average Score', value: `${report.averageScore}%`, detail: `${comparison >= 0 ? '+' : ''}${comparison}% vs previous month`, tone: comparison < 0 ? 'critical' : '' }, { label: 'Average Delay', value: delayLabel(report.averageDelay) }, { label: 'Completion %', value: `${report.completionPercent}%` }, { label: 'Total Delayed', value: report.delayedTasks, tone: report.delayedTasks ? 'warning' : '' }, { label: 'Total Failed', value: report.failedTasks, tone: report.failedTasks ? 'critical' : '' }]} />
    {!report.totalAudits ? <EmptyReport /> : <><section className="analytics-grid"><ChartBox title="Score comparison" wide><ResponsiveContainer width="100%" height={250}><LineChart data={[{ label: 'Previous', score: previous.averageScore }, { label: 'Selected', score: report.averageScore }]}><XAxis dataKey="label" /><YAxis domain={[0, 100]} /><TooltipValue suffix="%" /><Line type="monotone" dataKey="score" stroke={COLOURS.lime} strokeWidth={3} /></LineChart></ResponsiveContainer></ChartBox><ChartBox title="Department ranking"><ResponsiveContainer width="100%" height={250}><BarChart data={[...report.departments].sort((a, b) => b.score - a.score)}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} /><TooltipValue suffix="%" /><Bar dataKey="score" fill={COLOURS.lime} /></BarChart></ResponsiveContainer></ChartBox><ChartBox title="Task distribution"><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={report.statusBreakdown} dataKey="value" nameKey="name" outerRadius={78}>{report.statusBreakdown.map((item, index) => <Cell key={item.name} fill={PIE_COLOURS[index]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartBox><ChartBox title="Pass · Fail · Delayed"><ResponsiveContainer width="100%" height={250}><BarChart data={stacked}><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Legend /><Bar dataKey="Pass" stackId="tasks" fill={COLOURS.green} /><Bar dataKey="Fail" stackId="tasks" fill={COLOURS.red} /><Bar dataKey="Delayed" stackId="tasks" fill={COLOURS.amber} /><Bar dataKey="N/A" stackId="tasks" fill={COLOURS.slate} /></BarChart></ResponsiveContainer></ChartBox><FailuresTable title="Top 10 failures" rows={report.failures} /><FailuresTable title="Top delayed tasks" rows={report.delayedTasksByName} /></section><section className="section-head"><div><p className="eyebrow">OUTLET RANKING</p><h2>Monthly leaders</h2></div></section><LeaderboardTable rows={leaderboardFor(selected, filterAudits(audits, { ...filters, start: previousRange.start, end: previousRange.end }))} type="Monthly" /></>}</section></Layout>
}

export function Leaderboards({ Layout }) {
  const { audits } = useAudits(); const [mode, setMode] = useState('daily'); const [week, setWeek] = useState(() => weekInputValue()); const [month, setMonth] = useState(() => monthInputValue()); const [filters, setFilters] = useState(EMPTY_FILTERS)
  const now = new Date(); let range; let previousRange; let label
  if (mode === 'daily') { range = { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) }; previousRange = { start: new Date(range.start.getTime() - 86400000), end: new Date(range.end.getTime() - 86400000) }; label = dayLabel(now) }
  if (mode === 'weekly') { const start = parseWeekInput(week); range = { start, end: endOfWeek(start) }; const prev = new Date(start); prev.setDate(prev.getDate() - 7); previousRange = { start: prev, end: endOfWeek(prev) }; label = rangeLabel(range.start, range.end) }
  if (mode === 'monthly') { range = rangeForMonth(month); previousRange = rangeForMonth(monthInputValue(new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1))); label = range.start.toLocaleString('en-IN', { month: 'long', year: 'numeric' }) }
  const selected = filterAudits(audits, { ...filters, start: range.start, end: range.end }); const previous = filterAudits(audits, { ...filters, start: previousRange.start, end: previousRange.end })
  return <Layout><section className="analytics-page"><ReportHeader eyebrow="OUTLET PERFORMANCE" title="Leaderboards" description={`Ranked by average score, then lowest average delay · ${label}`} right={<div className="period-inputs print-hidden"><label><span>Period</span><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>{mode === 'weekly' && <label><span>Week</span><input type="week" value={week} onChange={(event) => setWeek(event.target.value)} /></label>}{mode === 'monthly' && <label><span>Month</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>}</div>} /><ReportFilters audits={audits} filters={filters} setFilters={setFilters} /><LeaderboardTable rows={leaderboardFor(selected, previous)} type={mode === 'daily' ? 'Daily' : mode === 'weekly' ? 'Weekly' : 'Monthly'} /></section></Layout>
}
