function AuditFlow() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { getAudit, updateAudit, visit, visited } = useAudits()
    const audit = getAudit(id)
    const index = Math.max(0, Math.min(11, Number(searchParams.get('step') || 0)))
    useEffect(() => { if (audit) visit(audit.id, index) }, [audit?.id, index, visit])
    if (!audit) return <NotFound />
    const parameter = audit.parameters[index]
    const seen = visited(audit)
    const patchItem = (checkpointId, patch) => updateAudit(audit.id, (current) => ({ ...current, parameters: current.parameters.map((param, paramIndex) => paramIndex !== index ? param : ({ ...param, checkpoints: param.checkpoints.map((item) => item.id !== checkpointId ? item : ({ ...item, ...patch })) })) }))
    const remove = (checkpointId) => updateAudit(audit.id, (current) => ({ ...current, parameters: current.parameters.map((param, paramIndex) => paramIndex !== index ? param : ({ ...param, checkpoints: param.checkpoints.filter((item) => item.id !== checkpointId) })) }))
    const add = () => updateAudit(audit.id, (current) => ({ ...current, parameters: current.parameters.map((param, paramIndex) => paramIndex !== index ? param : ({ ...param, checkpoints: [...param.checkpoints, checkpoint()] })) }))
    const upload = async (checkpointId, files) => {
      if (!files.length) return
      try {
        const photos = await Promise.all(files.map(compressPhoto))
        updateAudit(audit.id, (current) => ({ ...current, parameters: current.parameters.map((param, paramIndex) => paramIndex !== index ? param : ({ ...param, checkpoints: param.checkpoints.map((item) => item.id !== checkpointId ? item : ({ ...item, photos: [...item.photos, ...photos.map((base64) => ({ base64 }))] })) })) }))
      } catch { window.alert('One or more photos could not be compressed. Please try a smaller image.') }
    }
    const next = () => index < 11 ? setSearchParams({ step: String(index + 1) }) : navigate(`/audit/${audit.id}/summary`)
    return <DashboardLayout><section className="flow-page"><ProgressHeader audit={audit} index={index} seen={seen} /><div className="parameter-title"><div><p className="eyebrow">AUDIT PARAMETER</p><h1>{parameter.name}</h1></div><div className="parameter-score"><span>Current score</span><ScoreBadge score={parameter.score} /></div></div>
      <div className="checkpoint-list">{parameter.checkpoints.map((item) => <CheckpointCard key={item.id} item={item} parameterScore={parameter.score} onChange={(patch) => patchItem(item.id, patch)} onDelete={() => remove(item.id)} onPhoto={(files) => upload(item.id, files)} onPhotoDelete={(photoIndex) => patchItem(item.id, { photos: item.photos.filter((_, index) => index !== photoIndex) })} />)}</div>
      <button type="button" className="add-checkpoint" onClick={add}><Plus size={17} /> Add checkpoint</button>
      <nav className="flow-nav print-hidden"><button className="button secondary" disabled={index === 0} onClick={() => setSearchParams({ step: String(index - 1) })}><ArrowLeft size={17} /> Back</button><button className="button primary" onClick={next}>{index === 11 ? 'Review summary' : 'Next parameter'} <ArrowRight size={17} /></button></nav>
    </section></DasboardLayout>
  }