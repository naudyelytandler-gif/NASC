import { useMemo, useState } from 'react'
import { formatarValor } from '../utils.js'
import {
  calcularFinancas,
  calcularProximoLance,
  corIndicador,
  num,
} from '../assistente/calc.js'

// Formata numero para copiar/exibir no padrao brasileiro: 99,00
function brl(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pctTxt(fracao) {
  if (fracao == null || !Number.isFinite(Number(fracao))) return '—'
  return `${(Number(fracao) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

const ROTULO_COR = {
  verde: 'Excelente margem',
  amarelo: 'Margem reduzida',
  vermelho: 'No limite do mínimo',
  cinza: 'Não disputar',
}

// Tela do Assistente de Lances.
//
// Este assistente NAO se conecta ao portal e NAO envia lances. O operador
// informa o melhor lance atual (que le na tela do Compras.gov.br) e o app apenas
// calcula e exibe o proximo lance recomendado, respeitando o preco minimo. O
// envio continua sendo manual, feito pelo operador no portal.
export default function AssistenteView() {
  // 1) Selecao da licitacao (preenchimento livre pelo operador).
  const [pregao, setPregao] = useState({
    numero: '',
    orgao: '',
    objeto: '',
    item: '',
    quantidade: '1',
    valorEstimado: '',
  })

  // 2) Cadastro financeiro.
  const [fin, setFin] = useState({
    custoUnitario: '',
    frete: '',
    impostos: '',
    despesas: '',
    comissao: '',
    margemMinima: '',
    lucroDesejado: '',
  })

  // 3) Estrategia.
  const [estr, setEstr] = useState({
    estrategia: 'fixo',
    decremento: '',
    intervaloMinimo: '',
    maxLances: '',
  })

  // 4) Disputa em tempo real: melhor lance atual, informado pelo operador.
  const [melhorLance, setMelhorLance] = useState('')

  const [historico, setHistorico] = useState([])
  const [copiado, setCopiado] = useState(false)

  // ---- Calculos (memorizados; recalculo instantaneo) ----
  const financas = useMemo(
    () => calcularFinancas({ ...fin, quantidade: pregao.quantidade }),
    [fin, pregao.quantidade],
  )

  const proximo = useMemo(
    () =>
      calcularProximoLance({
        melhorLanceAtual: melhorLance,
        estrategia: estr.estrategia,
        decremento: estr.decremento,
        intervaloMinimo: estr.intervaloMinimo,
        precoMinimo: financas.precoMinimo,
        custoDireto: financas.custoDireto,
        fatorLiquido: financas.fatorLiquido,
      }),
    [melhorLance, estr, financas],
  )

  const cor = corIndicador({
    status: proximo.status,
    margem: proximo.margem,
    margemMinima: fin.margemMinima,
    lucroDesejado: fin.lucroDesejado,
    noLimite: proximo.noLimite,
  })

  const quantidade = num(pregao.quantidade) || 1
  const lucroUnit =
    proximo.status === 'ok' ? proximo.recomendado * financas.fatorLiquido - financas.custoDireto : null
  const lucroTotal = lucroUnit != null ? lucroUnit * quantidade : null

  const podeRecomendar = proximo.status === 'ok'

  async function copiarValor() {
    if (!podeRecomendar) return
    try {
      await navigator.clipboard.writeText(brl(proximo.recomendado))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      setCopiado(false)
    }
  }

  function registrar(obs = '') {
    if (!podeRecomendar) return
    const agora = new Date()
    setHistorico((h) => [
      {
        hora: agora.toLocaleTimeString('pt-BR'),
        melhorLance: num(melhorLance),
        recomendado: proximo.recomendado,
        precoMinimo: financas.precoMinimo,
        margem: proximo.margem,
        obs,
      },
      ...h,
    ])
  }

  const maxLancesNum = num(estr.maxLances)
  const excedeuLances = maxLancesNum > 0 && historico.length >= maxLancesNum

  return (
    <section>
      <header className="topo">
        <h1>🎯 Assistente de Lances</h1>
        <p className="topo__sub">
          Calcula o próximo lance e trava no seu preço mínimo. <strong>Você</strong> envia no portal.
        </p>
      </header>

      <div className="aviso-limite" role="note">
        🔒 Este assistente <strong>não se conecta ao Compras.gov.br</strong> nem envia lances. Você
        informa o melhor lance atual (lendo a tela do portal) e envia o lance manualmente. É um
        copiloto de decisão — quem aperta “enviar” é você.
      </div>

      {/* ===== Configuracao ===== */}
      <div className="config-grid">
        {/* Financeiro */}
        <fieldset className="bloco">
          <legend>💰 Cadastro financeiro</legend>
          <div className="campos">
            <Campo rotulo="Custo unitário (R$)" v={fin.custoUnitario} set={(x) => setFin({ ...fin, custoUnitario: x })} />
            <Campo rotulo="Frete (R$/un.)" v={fin.frete} set={(x) => setFin({ ...fin, frete: x })} />
            <Campo rotulo="Despesas oper. (R$/un.)" v={fin.despesas} set={(x) => setFin({ ...fin, despesas: x })} />
            <Campo rotulo="Impostos (% do preço)" v={fin.impostos} set={(x) => setFin({ ...fin, impostos: x })} />
            <Campo rotulo="Comissão (% do preço)" v={fin.comissao} set={(x) => setFin({ ...fin, comissao: x })} />
            <Campo rotulo="Margem mínima (% custo)" v={fin.margemMinima} set={(x) => setFin({ ...fin, margemMinima: x })} />
            <Campo rotulo="Lucro desejado (% custo)" v={fin.lucroDesejado} set={(x) => setFin({ ...fin, lucroDesejado: x })} />
            <Campo rotulo="Quantidade" v={pregao.quantidade} set={(x) => setPregao({ ...pregao, quantidade: x })} />
          </div>
          <div className="calc-resumo">
            <span>Custo direto: <strong>{formatarValor(financas.custoDireto)}</strong>/un.</span>
            <span className="calc-resumo__piso">
              Preço mínimo: <strong>{financas.precoMinimo != null ? formatarValor(financas.precoMinimo) : '—'}</strong>
            </span>
            <span>Preço recomendado: <strong>{financas.precoRecomendado != null ? formatarValor(financas.precoRecomendado) : '—'}</strong></span>
            {!financas.valido && (
              <span className="calc-resumo__erro">Preencha os custos (e impostos+comissão &lt; 100%).</span>
            )}
          </div>
        </fieldset>

        {/* Estrategia */}
        <fieldset className="bloco">
          <legend>♟️ Estratégia</legend>
          <div className="campos">
            <label className="campo">
              Estratégia
              <select value={estr.estrategia} onChange={(e) => setEstr({ ...estr, estrategia: e.target.value })}>
                <option value="minimo">Cobrir pelo mínimo permitido</option>
                <option value="fixo">Decremento fixo (R$)</option>
                <option value="percentual">Decremento percentual (%)</option>
                <option value="faixa">Decremento por faixa</option>
                <option value="personalizada">Personalizada</option>
              </select>
            </label>
            <Campo
              rotulo={estr.estrategia === 'percentual' ? 'Decremento (%)' : 'Decremento (R$)'}
              v={estr.decremento}
              set={(x) => setEstr({ ...estr, decremento: x })}
            />
            <Campo rotulo="Intervalo mínimo (R$)" v={estr.intervaloMinimo} set={(x) => setEstr({ ...estr, intervaloMinimo: x })} />
            <Campo rotulo="Máx. de lances" v={estr.maxLances} set={(x) => setEstr({ ...estr, maxLances: x })} />
          </div>
          <p className="dica">
            “Cobrir pelo mínimo” usa o intervalo mínimo do portal como decremento.
          </p>
        </fieldset>
      </div>

      {/* ===== Arena ao vivo ===== */}
      <div className="arena">
        {/* Esquerda: info do pregao */}
        <aside className="arena__lado">
          <h3>Pregão</h3>
          <Campo rotulo="Número" v={pregao.numero} set={(x) => setPregao({ ...pregao, numero: x })} texto />
          <Campo rotulo="Órgão" v={pregao.orgao} set={(x) => setPregao({ ...pregao, orgao: x })} texto />
          <Campo rotulo="Item / lote" v={pregao.item} set={(x) => setPregao({ ...pregao, item: x })} texto />
          <Campo rotulo="Objeto" v={pregao.objeto} set={(x) => setPregao({ ...pregao, objeto: x })} texto />
          <Campo rotulo="Valor estimado (R$)" v={pregao.valorEstimado} set={(x) => setPregao({ ...pregao, valorEstimado: x })} />
        </aside>

        {/* Centro: disputa + recomendacao */}
        <div className="arena__centro">
          <h3>Disputa</h3>
          <label className="campo campo--destaque">
            Melhor lance atual (você informa)
            <input
              inputMode="decimal"
              placeholder="ex.: 100,00"
              value={melhorLance}
              onChange={(e) => setMelhorLance(e.target.value)}
            />
          </label>

          <div className={`recomendacao recomendacao--${cor}`}>
            {proximo.status === 'ok' && (
              <>
                <span className="recomendacao__rotulo">
                  PRÓXIMO LANCE {proximo.noLimite && '(no piso)'}
                </span>
                <span className="recomendacao__valor">R$ {brl(proximo.recomendado)}</span>
                <span className="recomendacao__tag">{ROTULO_COR[cor]}</span>
                <div className="recomendacao__acoes">
                  <button className="btn" onClick={copiarValor}>
                    {copiado ? '✓ Copiado!' : 'Copiar valor'}
                  </button>
                  <button className="btn btn--ghost" onClick={() => registrar()}>
                    Registrar recomendação
                  </button>
                </div>
              </>
            )}

            {proximo.status === 'nao_cobrir' && (
              <div className="nao-cobrir">
                <span className="nao-cobrir__titulo">⚠ NÃO COBRIR</span>
                <span>Preço mínimo atingido.</span>
                <span>Não existe lance economicamente viável.</span>
                <small>{proximo.motivo}</small>
              </div>
            )}

            {proximo.status === 'incompleto' && (
              <p className="recomendacao__vazio">
                Preencha o custo/margem e informe o melhor lance atual para ver a recomendação.
              </p>
            )}
          </div>

          {excedeuLances && (
            <div className="alerta">⚠️ Você atingiu o máximo de {maxLancesNum} lances planejados.</div>
          )}
        </div>

        {/* Direita: resumo financeiro do lance recomendado */}
        <aside className="arena__lado">
          <h3>Resumo financeiro</h3>
          <Linha rotulo="Preço mínimo" valor={financas.precoMinimo != null ? formatarValor(financas.precoMinimo) : '—'} destaque />
          {proximo.status === 'ok' ? (
            <>
              <Linha rotulo="Lance recomendado" valor={`R$ ${brl(proximo.recomendado)}`} />
              <Linha rotulo="Economia vs. concorrente" valor={formatarValor(proximo.economia)} />
              <Linha rotulo="Desconto" valor={pctTxt(proximo.percentualDesconto)} />
              <Linha rotulo="Margem no lance" valor={pctTxt(proximo.margem)} />
              <Linha rotulo="Lucro estimado (un.)" valor={lucroUnit != null ? formatarValor(lucroUnit) : '—'} />
              <Linha rotulo="Lucro estimado (total)" valor={lucroTotal != null ? formatarValor(lucroTotal) : '—'} />
            </>
          ) : (
            <p className="dica">Informe os dados para ver o resumo do lance.</p>
          )}
        </aside>
      </div>

      {/* ===== Dashboard ===== */}
      <div className="summary" aria-label="Indicadores">
        <Indicador rotulo="Margem no lance" valor={proximo.status === 'ok' ? pctTxt(proximo.margem) : '—'} cor={cor} />
        <Indicador rotulo="Economia" valor={proximo.status === 'ok' ? formatarValor(proximo.economia) : '—'} />
        <Indicador rotulo="Lucro estimado (total)" valor={lucroTotal != null ? formatarValor(lucroTotal) : '—'} />
        <Indicador rotulo="Recomendações registradas" valor={historico.length} />
      </div>

      {/* ===== Historico ===== */}
      <h3 className="hist-titulo">🧾 Histórico de recomendações</h3>
      {historico.length === 0 ? (
        <p className="dica">Nenhuma recomendação registrada ainda.</p>
      ) : (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Melhor lance</th>
                <th>Recomendado</th>
                <th>Preço mín.</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h, i) => (
                <tr key={i}>
                  <td>{h.hora}</td>
                  <td>{formatarValor(h.melhorLance)}</td>
                  <td>{formatarValor(h.recomendado)}</td>
                  <td>{h.precoMinimo != null ? formatarValor(h.precoMinimo) : '—'}</td>
                  <td>{pctTxt(h.margem)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ---- Componentes auxiliares ----

function Campo({ rotulo, v, set, texto = false }) {
  return (
    <label className="campo">
      {rotulo}
      <input
        type={texto ? 'text' : 'text'}
        inputMode={texto ? 'text' : 'decimal'}
        value={v}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  )
}

function Linha({ rotulo, valor, destaque = false }) {
  return (
    <div className={`linha${destaque ? ' linha--destaque' : ''}`}>
      <span className="linha__rotulo">{rotulo}</span>
      <span className="linha__valor">{valor}</span>
    </div>
  )
}

function Indicador({ rotulo, valor, cor }) {
  return (
    <div className={`summary-card${cor ? ` ind--${cor}` : ''}`}>
      <span className="summary-card__valor">{valor}</span>
      <span className="summary-card__rotulo">{rotulo}</span>
    </div>
  )
}
