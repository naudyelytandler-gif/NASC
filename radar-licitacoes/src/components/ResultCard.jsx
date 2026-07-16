import { formatarValor, formatarDataHora, diasRestantes } from '../utils.js'

// Cartao de uma oportunidade (uma contratacao do PNCP).
export default function ResultCard({ item }) {
  const dias = diasRestantes(item.dataEncerramentoProposta)
  const urgente = dias != null && dias >= 0 && dias <= 3

  return (
    <article className="card">
      <header className="card__head">
        <span className="card__modalidade">{item.modalidadeNome}</span>
        {dias != null && (
          <span className={`card__prazo${urgente ? ' card__prazo--urgente' : ''}`}>
            {dias < 0 ? 'Encerrado' : dias === 0 ? 'Encerra hoje' : `${dias} dia(s)`}
          </span>
        )}
      </header>

      <p className="card__objeto">{item.objetoCompra}</p>

      <dl className="card__meta">
        <div>
          <dt>Órgão</dt>
          <dd>{item.orgaoEntidade?.razaoSocial || '—'}</dd>
        </div>
        <div>
          <dt>Local</dt>
          <dd>
            {item.unidadeOrgao?.municipioNome
              ? `${item.unidadeOrgao.municipioNome}/${item.unidadeOrgao.ufSigla}`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Valor estimado</dt>
          <dd>{formatarValor(item.valorTotalEstimado)}</dd>
        </div>
        <div>
          <dt>Encerra propostas</dt>
          <dd>{formatarDataHora(item.dataEncerramentoProposta)}</dd>
        </div>
      </dl>

      <footer className="card__foot">
        <span className="card__id">{item.numeroControlePNCP}</span>
        {item.linkSistemaOrigem && (
          <a
            className="card__link"
            href={item.linkSistemaOrigem}
            target="_blank"
            rel="noreferrer noopener"
          >
            Abrir no sistema de origem ↗
          </a>
        )}
      </footer>
    </article>
  )
}
