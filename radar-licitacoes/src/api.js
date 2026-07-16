// Cliente da API publica de consultas do PNCP (Portal Nacional de Contratacoes
// Publicas). Documentacao oficial:
//   https://pncp.gov.br/api/consulta/swagger-ui/index.html
//
// A API e publica e NAO exige autenticacao. Aqui consultamos apenas o endpoint
// de contratacoes com "periodo de recebimento de propostas em aberto", que e o
// que interessa a um fornecedor buscando oportunidades.
//
// Em desenvolvimento as chamadas passam pelo proxy do Vite (ver vite.config.js),
// por isso o caminho comeca com "/api/pncp".

const BASE = '/api/pncp/v1'

// Formata um objeto Date para o formato exigido pela API: AAAAMMDD.
export function toApiDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/**
 * Busca contratacoes com propostas em aberto.
 *
 * @param {Object} params
 * @param {number} params.codigoModalidadeContratacao - codigo da modalidade (obrigatorio)
 * @param {string} params.dataFinal - data final no formato AAAAMMDD (obrigatorio)
 * @param {string} [params.uf] - sigla da UF (opcional)
 * @param {number} [params.pagina=1]
 * @param {number} [params.tamanhoPagina=50] - minimo 10
 * @returns {Promise<{data: Array, totalRegistros: number, totalPaginas: number}>}
 */
export async function buscarContratacoes({
  codigoModalidadeContratacao,
  dataFinal,
  uf,
  pagina = 1,
  tamanhoPagina = 50,
}) {
  const qs = new URLSearchParams({
    codigoModalidadeContratacao: String(codigoModalidadeContratacao),
    dataFinal,
    pagina: String(pagina),
    tamanhoPagina: String(tamanhoPagina),
  })
  if (uf) qs.set('uf', uf)

  const resp = await fetch(`${BASE}/contratacoes/proposta?${qs.toString()}`, {
    headers: { Accept: 'application/json' },
  })

  if (!resp.ok) {
    let detalhe = ''
    try {
      const corpo = await resp.json()
      detalhe = corpo?.message ? ` — ${corpo.message}` : ''
    } catch {
      /* corpo nao-JSON: ignora */
    }
    throw new Error(`Falha na consulta ao PNCP (HTTP ${resp.status})${detalhe}`)
  }

  return resp.json()
}
