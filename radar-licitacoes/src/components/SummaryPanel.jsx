import { formatarValor } from '../utils.js'

// Painel de resumo das oportunidades encontradas.
export default function SummaryPanel({ registros, totalRegistros }) {
  const total = registros.length
  const valorSomado = registros.reduce(
    (acc, r) => acc + (Number(r.valorTotalEstimado) || 0),
    0,
  )
  const ufs = new Set(registros.map((r) => r.unidadeOrgao?.ufSigla).filter(Boolean))
  const encerrandoEm7 = registros.filter((r) => {
    const fim = new Date(r.dataEncerramentoProposta)
    if (Number.isNaN(fim.getTime())) return false
    const dias = (fim.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return dias >= 0 && dias <= 7
  }).length

  const cards = [
    { rotulo: 'Nesta página', valor: total },
    { rotulo: 'Total no país', valor: totalRegistros.toLocaleString('pt-BR') },
    { rotulo: 'UFs nesta página', valor: ufs.size },
    { rotulo: 'Encerrando em 7 dias', valor: encerrandoEm7, alerta: encerrandoEm7 > 0 },
    { rotulo: 'Valor estimado (página)', valor: formatarValor(valorSomado) },
  ]

  return (
    <section className="summary" aria-label="Resumo das oportunidades">
      {cards.map((c) => (
        <div key={c.rotulo} className={`summary-card${c.alerta ? ' summary-card--alert' : ''}`}>
          <span className="summary-card__valor">{c.valor}</span>
          <span className="summary-card__rotulo">{c.rotulo}</span>
        </div>
      ))}
    </section>
  )
}
