# STATUS — Polymarket Dashboard

## Ultimo commit
`5867513` — 2026-06-16

## O que foi feito nesta sessao
- Coluna **ODD** adicionada na tabela de Posicoes Ativas do Dashboard (estava ausente).
- Grid quadriculado FDC aplicado (`body::before`, 44px, `--line-2`, opacity 0.55), igual ao Betting Dashboard.
- Fix em `splitMultiBuys`: posicoes de compra unica agora ancuram `avgPrice` ao preco real da atividade BUY, evitando que o calculo de ODD use o preco de mercado atual como fallback.

## Pendente
- Verificar visualmente o grid e a coluna ODD no browser apos push/deploy.
- Avaliar se o calculo de ODD para posicoes ativas (sem atividade disponivel) esta correto em producao.

## Proximo passo
Rodar o servidor local (`node server/server.js`), abrir o dashboard e confirmar:
1. Grid aparece no fundo.
2. Coluna ODD visivel na tabela de Posicoes Ativas.
3. Valores de ODD das ativas batem com os precos de compra esperados.
