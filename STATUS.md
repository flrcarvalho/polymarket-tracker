# STATUS — Polymarket Dashboard

## Ultimo commit
`58fa3b6` — 2026-06-16

## O que foi feito (sessao 2026-06-16)
- Coluna **ODD** adicionada na tabela de Posicoes Ativas do Dashboard.
- Grid quadriculado FDC aplicado (`body::before`, 44px, `--line-2`, opacity 0.55).
- Fix `splitMultiBuys`: posicoes single-buy ancuram `avgPrice` ao preco da atividade BUY.
- Fix `calcOdd` para posicoes ativas (hold to end):
  - `splitMultiBuys` recebe parametro `isClosed` (bool).
  - Ativas: `cashPnl` zerado (single-buy) ou `isWin = false` (multi-buy).
  - Resultado: ODD usa `1/avgPrice` fixo, nao oscila com o mercado.

## Pendente
- Verificar visualmente no browser apos deploy.
- Confirmar que ODD das ativas bate com o preco de entrada real.

## Proximo passo
Rodar `node server/server.js`, carregar dados reais e checar:
1. Grid aparece no fundo.
2. Coluna ODD nas Posicoes Ativas mostra valores fixos (nao mudam ao recarregar).
3. ODD de ativos coerente com o preco de compra na atividade.
