# Radar de Licitações

Busca oportunidades de licitação (pregões e outras modalidades) com **propostas
em aberto**, a partir dos **dados abertos oficiais** do
[PNCP – Portal Nacional de Contratações Públicas](https://pncp.gov.br).

Feito para o **fornecedor** encontrar e acompanhar oportunidades — o app apenas
**consulta** dados públicos. Ele **não** interage com salas de disputa nem
automatiza lances.

## Recursos

- 🔎 Busca por modalidade, UF e prazo de propostas
- 🔤 Filtro por palavra-chave (sobre o objeto da compra)
- 📊 Painel de resumo (total, UFs, prazos próximos, valor estimado)
- ⏰ Destaque para oportunidades encerrando em breve
- ↗ Link direto para o sistema de origem de cada licitação
- 📄 Paginação sobre o resultado oficial

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
