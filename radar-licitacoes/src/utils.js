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

// Host (dominio) do link do sistema de origem da contratacao, em minusculas.
export function hostDoItem(item) {
  const link = item?.linkSistemaOrigem
  if (!link) return null
  try {
    return new URL(link).host.toLowerCase()
  } catch {
    return null
  }
}

// Identifica se a contratacao tem origem no Compras.gov.br (plataforma federal,
// operada pelo SERPRO). Match preciso pelos dominios do Compras.gov.br —
// cuidado para NAO confundir com portais estaduais que contem "compras" no nome
// (ex.: compras.rs.gov.br, compras.mg.gov.br).
export function ehComprasGov(item) {
  const host = hostDoItem(item)
  if (!host) return false
  return (
    host === 'cnetmobile.estaleiro.serpro.gov.br' || // Compras.gov.br atual (Comprasnet-web)
    host === 'compras.gov.br' ||
    host === 'www.compras.gov.br' ||
    host.endsWith('.compras.gov.br') || // subdominios federais (ex.: catalogo.compras.gov.br)
    host.endsWith('comprasnet.gov.br') // Comprasnet legado
  )
}
