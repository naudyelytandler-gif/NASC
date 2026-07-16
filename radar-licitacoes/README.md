# Licitações — Radar + Assistente de Lances

Módulo web para o **fornecedor** de licitações públicas. Tem duas telas:

1. **📡 Radar de Licitações** — busca oportunidades com **propostas em aberto**
   a partir dos **dados abertos oficiais** do
   [PNCP – Portal Nacional de Contratações Públicas](https://pncp.gov.br).
2. **🎯 Assistente de Lances** — copiloto que calcula o próximo lance ideal e
   **trava no seu preço mínimo**, para você decidir mais rápido.

## Escopo e limites (importante)

Este app **apenas consulta dados abertos** e **calcula números localmente**. Ele
**não** se conecta às salas de disputa, **não** captura tráfego de nenhuma
plataforma e **não** envia lances. No Assistente, quem informa o lance atual e
quem envia o lance no Compras.gov.br é sempre **o operador** — o app é um apoio à
decisão, não um robô de envio automático.

## Recursos

**Radar**
- 🔎 Busca por modalidade, UF e prazo de propostas
- 🔤 Filtro por palavra-chave (sobre o objeto da compra)
- 🏷️ Filtro por sistema de origem (padrão: somente Compras.gov.br)
- 📊 Painel de resumo (total, UFs, prazos próximos, valor estimado)
- ⏰ Destaque para oportunidades encerrando em breve
- ↗ Link direto para o sistema de origem de cada licitação
- 📄 Paginação sobre o resultado oficial

**Assistente de Lances**
- 💰 Cadastro financeiro → calcula custo, **preço mínimo** e preço recomendado
- ♟️ Estratégias: cobrir pelo mínimo, decremento fixo/percentual/por faixa
- ⚡ Recálculo instantâneo do próximo lance ao informar o melhor lance atual
- 🔒 **Trava financeira**: nunca recomenda abaixo do preço mínimo (“NÃO COBRIR”)
- 🚦 Indicadores de margem (verde/amarelo/vermelho/cinza)
- 📋 Botão para copiar o valor recomendado (o envio no portal é **manual**)
- 🧾 Histórico e auditoria das recomendações
- 📊 Dashboard de margem, economia e lucro estimado

## Tecnologia

- **React 18** + **Vite**
- Fonte de dados: API pública de consultas do PNCP (`/v1/contratacoes/proposta`),
  sem autenticação.
- Em desenvolvimento, um **proxy do Vite** encaminha as chamadas para o PNCP
  (evita CORS). Em produção, use um backend próprio (ex.: Edge Function do
  Supabase) com o mesmo papel.

## Como rodar

```bash
cd radar-licitacoes
npm install
npm run dev
```

Abra o endereço mostrado no terminal (por padrão, http://localhost:5173).

## Próximos passos (evolução)

- Salvar oportunidades favoritas (Supabase).
- Alertas de prazo.
- Busca de itens dentro de cada contratação.

## Fonte de dados

API de Consultas do PNCP — documentação:
<https://pncp.gov.br/api/consulta/swagger-ui/index.html>
