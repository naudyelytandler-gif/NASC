// Motor de calculo do Assistente de Lances.
//
// TODAS as funcoes aqui sao PURAS (sem efeitos colaterais e sem I/O): isso
// garante recalculo instantaneo (muito abaixo de 200 ms) e facilita testes.
//
// IMPORTANTE: este modulo NAO se comunica com nenhum portal. Ele apenas calcula
// numeros a partir do que o operador informa na tela. O envio do lance no
// Compras.gov.br e sempre MANUAL, feito pelo operador.
//
// Modelo financeiro (por unidade), com premissas explicitas:
//   - custoUnitario, frete, despesas : valores em R$/unidade (compoem o custo direto)
//   - impostos, comissao             : percentuais aplicados sobre o PRECO DE VENDA
//   - margemMinima, lucroDesejado    : percentuais sobre o CUSTO DIRETO
//
// Para uma margem-alvo m (sobre o custo direto), o preco de venda P satisfaz:
//   P * (1 - impostos - comissao) - custoDireto = m * custoDireto
//   =>  P = custoDireto * (1 + m) / (1 - impostos - comissao)

// Converte entrada (string com virgula ou numero) para Number seguro.
export function num(v) {
  if (v == null) return 0
  const n = typeof v === 'string' ? Number(v.replace(/\./g, '').replace(',', '.')) : Number(v)
  return Number.isFinite(n) ? n : 0
}

// Percentual informado como numero (ex.: 12 -> 0.12).
export function pct(v) {
  return num(v) / 100
}

// Margem (fracao sobre o custo direto) ao vender por um preco P.
export function margemNoPreco(preco, custoDireto, fatorLiquido) {
  if (!(custoDireto > 0)) return null
  const receitaLiquida = preco * fatorLiquido
  return (receitaLiquida - custoDireto) / custoDireto
}

// Calcula os numeros financeiros a partir do cadastro do produto.
export function calcularFinancas(entrada) {
  const custoUnitario = num(entrada.custoUnitario)
  const frete = num(entrada.frete)
  const despesas = num(entrada.despesas)
  const impostos = pct(entrada.impostos)
  const comissao = pct(entrada.comissao)
  const margemMinima = pct(entrada.margemMinima)
  const lucroDesejado = pct(entrada.lucroDesejado)
  const quantidade = num(entrada.quantidade) || 1

  const custoDireto = custoUnitario + frete + despesas
  const fatorLiquido = 1 - impostos - comissao // parte do preco que sobra apos impostos+comissao

  const valido = custoDireto > 0 && fatorLiquido > 0

  const precoMinimo = valido ? (custoDireto * (1 + margemMinima)) / fatorLiquido : null
  const precoRecomendado = valido ? (custoDireto * (1 + lucroDesejado)) / fatorLiquido : null

  return {
    valido,
    custoDireto,
    custoTotal: custoDireto * quantidade,
    fatorLiquido,
    precoMinimo,
    precoRecomendado,
    margemPrevista:
      precoRecomendado != null ? margemNoPreco(precoRecomendado, custoDireto, fatorLiquido) : null,
  }
}

// Calcula o PROXIMO lance recomendado dado o melhor lance atual do concorrente.
// TRAVA PRINCIPAL: nunca retorna valor abaixo do preco minimo (clampa no piso).
export function calcularProximoLance({
  melhorLanceAtual,
  estrategia,
  decremento, // R$ (fixo/faixa) ou % (percentual)
  intervaloMinimo, // R$: menor reducao permitida pelo portal
  precoMinimo,
  custoDireto,
  fatorLiquido,
}) {
  const atual = num(melhorLanceAtual)
  const piso = precoMinimo == null ? null : num(precoMinimo)
  const interv = num(intervaloMinimo)

  if (!(atual > 0) || piso == null || !(piso > 0)) {
    return { status: 'incompleto' }
  }

  // Se nem no piso da para cobrir (piso >= lance atual), nao ha lance viavel.
  if (piso >= atual) {
    return {
      status: 'nao_cobrir',
      motivo: 'O preço mínimo é maior ou igual ao melhor lance atual — cobrir daria prejuízo.',
    }
  }

  // Proximo lance "bruto" conforme a estrategia.
  let bruto
  switch (estrategia) {
    case 'minimo': // cobrir pelo menor decremento permitido
      bruto = atual - (interv > 0 ? interv : 0.01)
      break
    case 'percentual':
      bruto = atual * (1 - pct(decremento))
      break
    case 'fixo':
    case 'faixa': // nesta versao, faixa/personalizada usam o decremento informado
    case 'personalizada':
    default:
      bruto = atual - num(decremento)
      break
  }

  // Respeita o intervalo minimo: precisa ficar ao menos `interv` abaixo do atual.
  if (interv > 0 && atual - bruto < interv) {
    bruto = atual - interv
  }

  // TRAVA FINANCEIRA: nunca abaixo do piso.
  let recomendado = bruto
  let noLimite = false
  if (recomendado < piso) {
    recomendado = piso
    noLimite = true
  }

  recomendado = Math.round(recomendado * 100) / 100 // centavos

  const margem = margemNoPreco(recomendado, custoDireto, fatorLiquido)
  const economia = atual - recomendado
  const percentualDesconto = atual > 0 ? economia / atual : 0

  return {
    status: 'ok',
    recomendado,
    noLimite, // true = recomendado foi travado no piso
    margem, // fracao sobre o custo direto
    economia, // R$ abaixo do concorrente
    percentualDesconto,
    piso,
  }
}

// Cor do indicador conforme a margem do lance recomendado.
// verde = excelente | amarelo = reduzida | vermelho = no limite | cinza = nao disputar
export function corIndicador({ status, margem, margemMinima, lucroDesejado, noLimite }) {
  if (status === 'nao_cobrir' || status !== 'ok' || margem == null) return 'cinza'
  const min = pct(margemMinima)
  const alvo = pct(lucroDesejado)
  if (noLimite || margem <= min + 1e-9) return 'vermelho'
  if (margem >= alvo) return 'verde'
  return 'amarelo'
}
