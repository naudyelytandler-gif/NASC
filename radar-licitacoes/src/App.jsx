import { useState, useMemo } from 'react'
import { MODALIDADES, UFS } from './constants.js'
import { buscarContratacoes, toApiDate } from './api.js'
import SummaryPanel from './components/SummaryPanel.jsx'
import ResultCard from './components/ResultCard.jsx'

// Data padrao para "propostas ate": hoje + 30 dias.
function dataPadrao() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10) // formato do <input type="date">: AAAA-MM-DD
}

const TAMANHO_PAGINA = 50

export default function App() {
  // Filtros enviados a API.
  const [modalidade, setModalidade] = useState(6) // Pregao Eletronico
  const [uf, setUf] = useState('')
  const [ate, setAte] = useState(dataPadrao())
  // Filtro por palavra-chave (aplicado no cliente sobre o objeto da compra).
  const [termo, setTermo] = useState('')

  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState(null) // { data, totalRegistros, totalPaginas }
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  async function consultar(paginaAlvo = 1) {
    setCarregando(true)
    setErro(null)
    try {
      const dataFinal = toApiDate(new Date(`${ate}T00:00:00`))
      const r = await buscarContratacoes({
        codigoModalidadeContratacao: modalidade,
        dataFinal,
        uf: uf || undefined,
        pagina: paginaAlvo,
        tamanhoPagina: TAMANHO_PAGINA,
      })
      setResultado(r)
      setPagina(paginaAlvo)
    } catch (e) {
      setErro(e.message || 'Erro desconhecido ao consultar o PNCP.')
      setResultado(null)
    } finally {
      setCarregando(false)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    consultar(1)
  }

  // Filtro por palavra-chave aplicado sobre os registros da pagina atual.
  const registrosFiltrados = useMemo(() => {
    const lista = resultado?.data ?? []
    const t = termo.trim().toLowerCase()
    if (!t) return lista
    return lista.filter((r) => (r.objetoCompra || '').toLowerCase().includes(t))
  }, [resultado, termo])

  const totalPaginas = resultado?.totalPaginas ?? 0

  return (
    <div className="app">
      <header className="topo">
        <h1>📡 Radar de Licitações</h1>
        <p className="topo__sub">
          Oportunidades com propostas em aberto — dados públicos oficiais do{' '}
          <a href="https://pncp.gov.br" target="_blank" rel="noreferrer noopener">PNCP</a>.
        </p>
      </header>

      <form className="filtros" onSubmit={onSubmit}>
        <label>
          Modalidade
          <select value={modalidade} onChange={(e) => setModalidade(Number(e.target.value))}>
            {MODALIDADES.map((m) => (
              <option key={m.codigo} value={m.codigo}>{m.nome}</option>
            ))}
          </select>
        </label>

        <label>
          UF
          <select value={uf} onChange={(e) => setUf(e.target.value)}>
            <option value="">Todas</option>
            {UFS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>

        <label>
          Propostas até
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </label>

        <label className="filtros__termo">
          Palavra-chave
          <input
            type="search"
            placeholder="ex.: informática, merenda, veículo…"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
        </label>

        <button type="submit" className="btn" disabled={carregando}>
          {carregando ? 'Buscando…' : 'Buscar oportunidades'}
        </button>
      </form>

      {erro && <div className="erro" role="alert">⚠️ {erro}</div>}

      {resultado && !erro && (
        <>
          <SummaryPanel registros={registrosFiltrados} totalRegistros={resultado.totalRegistros} />

          {termo.trim() && (
            <p className="aviso-filtro">
              Filtrando por “{termo.trim()}” nesta página: {registrosFiltrados.length} de{' '}
              {resultado.data.length} resultados.
            </p>
          )}

          <div className="lista">
            {registrosFiltrados.map((item) => (
              <ResultCard key={item.numeroControlePNCP} item={item} />
            ))}
            {registrosFiltrados.length === 0 && (
              <p className="vazio">Nenhuma oportunidade nesta página com esses critérios.</p>
            )}
          </div>

          {totalPaginas > 1 && (
            <nav className="paginacao">
              <button className="btn btn--ghost" disabled={pagina <= 1 || carregando} onClick={() => consultar(pagina - 1)}>
                ← Anterior
              </button>
              <span>Página {pagina} de {totalPaginas}</span>
              <button className="btn btn--ghost" disabled={pagina >= totalPaginas || carregando} onClick={() => consultar(pagina + 1)}>
                Próxima →
              </button>
            </nav>
          )}
        </>
      )}

      {!resultado && !erro && !carregando && (
        <div className="intro">
          <p>Escolha os filtros e clique em <strong>Buscar oportunidades</strong> para varrer os pregões abertos.</p>
        </div>
      )}

      <footer className="rodape">
        Fonte: API pública de consultas do PNCP · Este app apenas <strong>consulta</strong> dados
        abertos oficiais.
      </footer>
    </div>
  )
}
