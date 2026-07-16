// Formatadores de exibicao.

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatarValor(valor) {
  if (valor == null || Number.isNaN(Number(valor))) return '—'
  return BRL.format(Number(valor))
}

// Recebe uma data ISO ("2026-08-16T07:30:00") e devolve "16/08/2026 07:30".
export function formatarDataHora(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const data = d.toLocaleDateString('pt-BR')
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${data} ${hora}`
}

// Dias corridos entre agora e a data de encerramento. Negativo = ja encerrado.
export function diasRestantes(iso) {
  if (!iso) return null
  const fim = new Date(iso)
  if (Number.isNaN(fim.getTime())) return null
  const ms = fim.getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}
