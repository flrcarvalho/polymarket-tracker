# STATUS — Polymarket Dashboard

## Ultimo commit
`cd2ede3` — 2026-06-26

## O que foi feito (sessao 2026-06-26)
- Fix: paginacao do endpoint `/positions`.
  - Bug: dash mostrava 0 posicoes ativas.
  - Causa: a API `/positions` ordena resolvidas/redeemable primeiro. Com `limit=100`
    as 100 primeiras eram todas fechadas e as ativas ficavam na pagina 2 (offset 100+),
    que o codigo nunca buscava.
  - Correcao: loop de paginacao `offset=100,200...` ate esgotar, igual ja era feito
    com `/activity`. Aplicado em `index_proxy.html` e `server/public/index.html`.
  - Validado com a carteira `0x2b3c...9f22`: 107 posicoes no total, 6 ativas detectadas.

## Pendente
- Verificar visualmente no browser apos deploy: confirmar que as 6 ativas aparecem.

## Proximo passo
Rodar `node server/server.js`, sincronizar a carteira e checar:
1. Posicoes Ativas listam as 6 entradas (UFC, O/U 2.5 Rounds, Senegal, Belgium, Norway, New Zealand).
2. KPIs de ativas (count e valor) batem com os dados reais.
