import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuditProvider } from './AuditContext'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuditProvider><App /></AuditProvider>
    </BrowserRouter>
  </StrictMode>,
)
