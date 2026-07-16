import { useState } from 'react'
import RadarView from './views/RadarView.jsx'
import AssistenteView from './views/AssistenteView.jsx'

// Casca do modulo "Licitacoes": alterna entre o Radar (busca de oportunidades)
// e o Assistente de Lances (copiloto de calculo de lance manual).
export default function App() {
  const [aba, setAba] = useState('radar') // 'radar' | 'assistente'

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav__marca">🏛️ NASC · Licitações</span>
        <div className="nav__abas">
          <button
            className={`nav__aba${aba === 'radar' ? ' nav__aba--ativa' : ''}`}
            onClick={() => setAba('radar')}
          >
            📡 Radar
          </button>
          <button
            className={`nav__aba${aba === 'assistente' ? ' nav__aba--ativa' : ''}`}
            onClick={() => setAba('assistente')}
          >
            🎯 Assistente de Lances
          </button>
        </div>
      </nav>

      {aba === 'radar' ? <RadarView /> : <AssistenteView />}
    </div>
  )
}
