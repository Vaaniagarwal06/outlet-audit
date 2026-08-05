import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { createAudit, recalculate } from './auditData'

const AuditContext = createContext(null)
const AUDIT_STORAGE = 'outlet-audit.records.v1'
const PROGRESS_STORAGE = 'outlet-audit.progress.v1'
const AUDITOR_STORAGE = 'outlet-audit.last-auditor.v1'

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/', timeout: 4500 })

function newestFirst(audits) {
  return [...audits].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
}

export function AuditProvider({ children }) {
  const [audits, setAudits] = useState(() => newestFirst(load(AUDIT_STORAGE, [])))
  const [progress, setProgress] = useState(() => load(PROGRESS_STORAGE, {}))
  const [lastAuditor, setLastAuditor] = useState(() => localStorage.getItem(AUDITOR_STORAGE) || '')
  const [cloudState, setCloudState] = useState('checking')

  useEffect(() => save(AUDIT_STORAGE, audits), [audits])
  useEffect(() => save(PROGRESS_STORAGE, progress), [progress])

  useEffect(() => {
    let alive = true
    api.get('audits').then(({ data }) => {
      if (!alive) return
      setAudits((local) => {
        const all = new Map(local.map((record) => [record.id, record]))
        data.forEach((record) => all.set(record.id, record))
        return newestFirst([...all.values()].map(recalculate))
      })
      setCloudState('connected')
    }).catch(() => alive && setCloudState('local'))
    return () => { alive = false }
  }, [])

  const upsertLocal = useCallback((next) => {
    const normalised = recalculate(next)
    setAudits((current) => newestFirst([normalised, ...current.filter((audit) => audit.id !== normalised.id)]))
    return normalised
  }, [])

  const syncCreate = useCallback(async (audit) => {
    try { await api.post('audits', audit); setCloudState('connected') } catch { setCloudState('local') }
  }, [])
  const syncUpdate = useCallback(async (audit) => {
    try {
      await api.put(`audits/${audit.id}`, audit)
      setCloudState('connected')
    } catch (error) {
      if (error.response?.status === 404) {
        try { await api.post('audits', audit); setCloudState('connected'); return } catch { /* local copy remains safe */ }
      }
      setCloudState('local')
    }
  }, [])

  const beginAudit = useCallback((details) => {
    const audit = upsertLocal(createAudit(details))
    localStorage.setItem(AUDITOR_STORAGE, audit.auditorName)
    setLastAuditor(audit.auditorName)
    setProgress((current) => ({ ...current, [audit.id]: [] }))
    void syncCreate(audit)
    return audit
  }, [syncCreate, upsertLocal])

  const updateAudit = useCallback((id, updater) => {
    setAudits((current) => {
      const existing = current.find((audit) => audit.id === id)
      if (!existing) return current
      const updated = recalculate(typeof updater === 'function' ? updater(existing) : updater)
      void syncUpdate(updated)
      return newestFirst([updated, ...current.filter((audit) => audit.id !== id)])
    })
  }, [syncUpdate])

  const removeAudit = useCallback(async (id) => {
    setAudits((current) => current.filter((audit) => audit.id !== id))
    setProgress((current) => { const next = { ...current }; delete next[id]; return next })
    try { await api.delete(`audits/${id}`); setCloudState('connected') } catch { setCloudState('local') }
  }, [])

  const visit = useCallback((id, index) => setProgress((current) => {
    const seen = new Set(current[id] || [])
    seen.add(index)
    return { ...current, [id]: [...seen].sort((a, b) => a - b) }
  }), [])

  const value = useMemo(() => ({
    audits, lastAuditor, cloudState, beginAudit, updateAudit, removeAudit, visit,
    visited: (audit) => audit.status === 'completed' ? 12 : (progress[audit.id] || []),
    getAudit: (id) => audits.find((audit) => audit.id === id),
  }), [audits, beginAudit, cloudState, lastAuditor, progress, removeAudit, updateAudit, visit])

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

export const useAudits = () => {
  const context = useContext(AuditContext)
  if (!context) throw new Error('useAudits must be used within AuditProvider')
  return context
}
