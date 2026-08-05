export const BRANDS = [
  'Desi Kadai', "Anna's Kitchen", 'Little China', 'Bake & Shake', 'Bruway', 'Golpo Food Court',
]

export const DEPARTMENTS = ['Kitchen', 'Housekeeping', 'Store', 'Cashier', 'Security', 'Admin']
export const PARAMETER_DEPARTMENTS = {
  'Food Quality': 'Kitchen',
  'Kitchen Hygiene': 'Kitchen',
  'Customer Experience': 'Store',
  'Staff Performance & Grooming': 'Store',
  'Maintenance & Equipment': 'Admin',
  'Cleanliness Front of House': 'Housekeeping',
  'Cleanliness Back of House': 'Housekeeping',
  'Opening Readiness': 'Cashier',
  'Closing Compliance': 'Security',
  'Service Standards': 'Store',
  'Safety & Storage': 'Security',
  'Overall Execution': 'Admin',
}

export const AUDIT_TEMPLATES = [
  ['Food Quality', ['Food served hot', 'Taste consistent', 'Presentation acceptable', 'Fresh ingredients', 'Expiry checked']],
  ['Kitchen Hygiene', ['Handwash station stocked', 'Chopping boards colour coded', 'Fridge temperatures logged', 'No cross contamination', 'Floor drains clean']],
  ['Customer Experience', ['Greeting within 30 seconds', 'Tables clean', 'Music appropriate', 'Complaint handling', 'Queue managed']],
  ['Staff Performance & Grooming', ['Uniform clean', 'Hair restraints', 'Name badges', 'Hand hygiene', 'Professional behaviour']],
  ['Maintenance & Equipment', ['Equipment operational', 'Lighting working', 'No leaks', 'AC functioning', 'Fire extinguisher accessible']],
  ['Cleanliness Front of House', ['Floor clean', 'Tables sanitised', 'Bins emptied', 'Windows clean', 'Menu boards clean']],
  ['Cleanliness Back of House', ['Kitchen floor clean', 'Waste segregation', 'Storage organised', 'Grease traps clean', 'Drainage clear']],
  ['Opening Readiness', ['POS operational', 'Prep complete', 'Cash float ready', 'Cleaning completed', 'Music on']],
  ['Closing Compliance', ['Deep cleaning', 'Stock counted', 'Waste disposed', 'Equipment switched off', 'Doors locked']],
  ['Service Standards', ['Order accuracy', 'Food timing', 'Customer interaction', 'Upselling', 'Bill accuracy']],
  ['Safety & Storage', ['FIFO followed', 'Chemical storage', 'Gas leak check', 'Temperature logs', 'Emergency exits clear']],
  ['Overall Execution', ['Manager presence', 'Staff coordination', 'Brand standards', 'Shift communication', 'Overall readiness']],
]

export const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
export const parameterDepartment = (name) => PARAMETER_DEPARTMENTS[name] || 'Admin'

export function calculateDelay(checkpointValue) {
  const deadlineTime = checkpointValue.deadlineTime || ''
  const completedTime = checkpointValue.completedTime || ''
  if (!deadlineTime) return { deadlineTime, completedTime, delayMinutes: null, delayStatus: null }
  if (!completedTime) return { deadlineTime, completedTime, delayMinutes: null, delayStatus: 'Not Completed' }
  const [deadlineHour, deadlineMinute] = deadlineTime.split(':').map(Number)
  const [completedHour, completedMinute] = completedTime.split(':').map(Number)
  if ([deadlineHour, deadlineMinute, completedHour, completedMinute].some(Number.isNaN)) return { deadlineTime, completedTime, delayMinutes: null, delayStatus: null }
  const difference = ((completedHour * 60) + completedMinute) - ((deadlineHour * 60) + deadlineMinute)
  return difference <= 0
    ? { deadlineTime, completedTime, delayMinutes: 0, delayStatus: 'On Time' }
    : { deadlineTime, completedTime, delayMinutes: difference, delayStatus: 'Delayed' }
}

export const checkpoint = (title = 'New checkpoint') => ({
  id: makeId(),

  title,

  status: 'unanswered',

  notes: '',

  photos: [],

  deadlineTime: '',

  completedTime: '',

  delayMinutes: null,

  delayStatus: null,

  severity: 'Low',

  assignedTo: '',

  completedBy: '',

  verifiedBy: '',

  evidenceRequired: false,
})

export function parameterScore(parameter) {
  const passed = parameter.checkpoints.filter((item) => item.status === 'pass').length
  const failed = parameter.checkpoints.filter((item) => item.status === 'fail').length
  return passed + failed ? Math.round((passed / (passed + failed)) * 100) : 0
}

export function recalculate(audit) {
  const parameters = audit.parameters.map((parameter) => ({
    ...parameter,
    checkpoints: parameter.checkpoints.map((item) => ({ ...item, ...calculateDelay(item) })),
    score: parameterScore(parameter),
  }))
  const overallScore = parameters.length
    ? Math.round(parameters.reduce((sum, parameter) => sum + parameter.score, 0) / parameters.length)
    : 0
  return { ...audit, parameters, overallScore }
}

export function createAudit({ outletName, brand, auditorName }) {
  return recalculate({
    id: makeId(), outletName: outletName.trim(), brand, auditorName: auditorName.trim(),
    dateTime: new Date().toISOString(), status: 'in_progress', overallScore: 0,
    parameters: AUDIT_TEMPLATES.map(([name, titles]) => ({
      name, score: 0, checkpoints: titles.map((title) => checkpoint(title)),
    })),
  })
}

export const scoreTone = (score) => score >= 85 ? 'green' : score >= 70 ? 'amber' : 'red'
export const prettyStatus = (status) => status === 'completed' ? 'Completed' : 'In progress'
export const dateLabel = (date) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
export const auditDateKey = (date) => new Date(date).toLocaleDateString('en-CA')
export const dayLabel = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(date))
export const delayTone = (status, minutes) => {
  if (status === 'On Time') return 'green'
  if (status === 'Delayed') return (minutes || 0) >= 15 ? 'red' : 'amber'
  return 'grey'
}
export const delayLabel = (minutes) => minutes == null ? '—' : minutes === 0 ? 'On time' : `${minutes} min`

export function failures(audit) {
  return audit.parameters.flatMap((parameter) => parameter.checkpoints
    .filter((item) => item.status === 'fail')
    .map((item) => ({ parameter: parameter.name, department: parameterDepartment(parameter.name), ...item })))
}

export function summaryText(audit) {
  const analytics = aggregateAudits([audit])
  const rows = [
    `Outlet: ${audit.outletName}`, `Date: ${dateLabel(audit.dateTime)}`, `Brand: ${audit.brand}`,
    `Auditor: ${audit.auditorName}`, `Overall Score: ${audit.overallScore}%`,
    `Average Delay: ${delayLabel(analytics.averageDelay)}`, '', 'Department Scores:',
  ]
  analytics.departments.forEach((item) => rows.push(`${item.name}: ${item.score}%`))
  rows.push('', 'Failures:')
  const failed = failures(audit)
  if (!failed.length) rows.push('None')
  failed.forEach((item) => rows.push(`${item.parameter} — ${item.title}${item.notes ? ` (${item.notes})` : ''}${item.delayStatus ? ` · ${item.delayStatus} ${delayLabel(item.delayMinutes)}` : ''}`))
  return rows.join('\n')
}

export function checkpointRows(audits) {
  return audits.flatMap((audit) => audit.parameters.flatMap((parameter) => parameter.checkpoints.map((checkpointValue) => {
    const timing = calculateDelay(checkpointValue)
    return {
      ...checkpointValue, ...timing, auditId: audit.id, auditDate: audit.dateTime, outletName: audit.outletName,
      brand: audit.brand, auditStatus: audit.status, parameter: parameter.name, department: parameterDepartment(parameter.name),
    }
  })))
}

export function dateAtStart(value) { const date = new Date(value); date.setHours(0, 0, 0, 0); return date }
export function dateAtEnd(value) { const date = new Date(value); date.setHours(23, 59, 59, 999); return date }
export function startOfWeek(value) { const date = dateAtStart(value); const diff = (date.getDay() + 6) % 7; date.setDate(date.getDate() - diff); return date }
export function endOfWeek(value) { const date = startOfWeek(value); date.setDate(date.getDate() + 6); return dateAtEnd(date) }
export function weekInputValue(value = new Date()) { const weekStart = startOfWeek(value); const firstThursday = new Date(weekStart.getFullYear(), 0, 4); const week = Math.ceil((((weekStart - startOfWeek(firstThursday)) / 86400000) + 1) / 7); return `${weekStart.getFullYear()}-W${String(week).padStart(2, '0')}` }
export function parseWeekInput(value) { const [yearPart, weekPart] = value.split('-W'); const jan4 = new Date(Number(yearPart), 0, 4); const firstMonday = startOfWeek(jan4); const result = new Date(firstMonday); result.setDate(firstMonday.getDate() + ((Number(weekPart) - 1) * 7)); return result }
export function monthInputValue(value = new Date()) { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` }
export function rangeForMonth(value) { const [year, month] = value.split('-').map(Number); return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0, 23, 59, 59, 999) } }
export const rangeLabel = (start, end) => `${dayLabel(start)} – ${dayLabel(end)}`

export function filterAudits(audits, filters = {}) {
  const start = filters.start ? dateAtStart(filters.start) : null
  const end = filters.end ? dateAtEnd(filters.end) : null
  return audits.filter((audit) => {
    const auditDate = new Date(audit.dateTime)
    const rows = checkpointRows([audit])
    if (start && auditDate < start) return false
    if (end && auditDate > end) return false
    if (filters.outlet && audit.outletName !== filters.outlet) return false
    if (filters.brand && audit.brand !== filters.brand) return false
    if (filters.department && !rows.some((row) => row.department === filters.department)) return false
    if (filters.state === 'completed' && audit.status !== 'completed') return false
    if (filters.state === 'pass' && !rows.some((row) => row.status === 'pass')) return false
    if (filters.state === 'fail' && !rows.some((row) => row.status === 'fail')) return false
    if (filters.state === 'delayed' && !rows.some((row) => row.delayStatus === 'Delayed')) return false
    return true
  })
}

const percent = (numerator, denominator) => denominator ? Math.round((numerator / denominator) * 100) : 0
const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0

export function aggregateAudits(audits) {
  const rows = checkpointRows(audits)
  const answered = rows.filter((row) => ['pass', 'fail', 'na'].includes(row.status))
  const scheduled = rows.filter((row) => row.deadlineTime)
  const completedOnSchedule = scheduled.filter((row) => row.completedTime)
  const delayed = rows.filter((row) => row.delayStatus === 'Delayed')
  const onTime = rows.filter((row) => row.delayStatus === 'On Time')
  const failed = rows.filter((row) => row.status === 'fail')
  const passed = rows.filter((row) => row.status === 'pass')
  const notApplicable = rows.filter((row) => row.status === 'na')
  const departmentMetrics = DEPARTMENTS.map((name) => {
    const items = rows.filter((row) => row.department === name)
    const active = items.filter((item) => item.status === 'pass' || item.status === 'fail')
    return { name, score: percent(active.filter((item) => item.status === 'pass').length, active.length), failures: items.filter((item) => item.status === 'fail').length, delays: items.filter((item) => item.delayStatus === 'Delayed').length, total: items.length }
  })
  const outletMap = new Map()
  audits.forEach((audit) => {
    const current = outletMap.get(audit.outletName) || { name: audit.outletName, audits: [], rows: [] }
    current.audits.push(audit); current.rows.push(...checkpointRows([audit])); outletMap.set(audit.outletName, current)
  })
  const outlets = [...outletMap.values()].map((outlet) => {
    const scheduleRows = outlet.rows.filter((row) => row.deadlineTime && row.completedTime)
    return { outlet: outlet.name, score: average(outlet.audits.map((audit) => audit.overallScore)), averageDelay: average(scheduleRows.map((row) => row.delayMinutes || 0)), audits: outlet.audits.length, completed: outlet.audits.filter((audit) => audit.status === 'completed').length }
  }).sort((a, b) => b.score - a.score || a.averageDelay - b.averageDelay || a.outlet.localeCompare(b.outlet))
  const groupCounts = (items, label) => [...items.reduce((map, item) => { const key = item[label]; map.set(key, (map.get(key) || 0) + 1); return map }, new Map())].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const scoreTrend = [...audits.reduce((map, audit) => { const key = auditDateKey(audit.dateTime); const values = map.get(key) || []; values.push(audit.overallScore); map.set(key, values); return map }, new Map())].map(([date, values]) => ({ date, score: average(values) })).sort((a, b) => a.date.localeCompare(b.date))
  return {
    audits, rows, answered, totalAudits: audits.length, averageScore: average(audits.map((audit) => audit.overallScore)),
    averageDelay: average(completedOnSchedule.map((row) => row.delayMinutes || 0)), longestDelay: Math.max(0, ...delayed.map((row) => row.delayMinutes || 0)), delayedTasks: delayed.length,
    failedTasks: failed.length, onTimePercent: percent(onTime.length, completedOnSchedule.length), passPercent: percent(passed.length, answered.length), failPercent: percent(failed.length, answered.length), naPercent: percent(notApplicable.length, answered.length), completionPercent: percent(completedOnSchedule.length, scheduled.length),
    departments: departmentMetrics, mostFailedDepartment: [...departmentMetrics].sort((a, b) => b.failures - a.failures || a.name.localeCompare(b.name))[0]?.name || '—', bestOutlet: outlets[0]?.outlet || '—', worstOutlet: outlets.length ? outlets[outlets.length - 1].outlet : '—', outlets,
    scoreTrend, failures: groupCounts(failed, 'title'), delayedTasksByName: groupCounts(delayed, 'title'), statusBreakdown: [{ name: 'Pass', value: passed.length }, { name: 'Fail', value: failed.length }, { name: 'Delayed', value: delayed.length }, { name: 'N/A', value: notApplicable.length }],
  }
}

export function leaderboardFor(currentAudits, previousAudits = []) {
  const current = aggregateAudits(currentAudits).outlets
  const previous = aggregateAudits(previousAudits).outlets
  const previousRanks = new Map(previous.map((item, index) => [item.outlet, index + 1]))
  return current.map((item, index) => ({ ...item, rank: index + 1, rankChange: previousRanks.has(item.outlet) ? previousRanks.get(item.outlet) - (index + 1) : null }))
}
