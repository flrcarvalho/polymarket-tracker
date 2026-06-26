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
- Auditoria completa do dashboard + estudo da API Polymarket (so analise, nada mais alterado).

## Pendente
- Verificar visualmente no browser apos deploy: confirmar que as 6 ativas aparecem.

## Proximo passo
Rodar `node server/server.js`, sincronizar a carteira e checar:
1. Posicoes Ativas listam as 6 entradas (UFC, O/U 2.5 Rounds, Senegal, Belgium, Norway, New Zealand).
2. KPIs de ativas (count e valor) batem com os dados reais.

---

# HANDOFF AUDITORIA — 2026-06-26 (retomar amanha)

API confirmada **ao vivo** contra `data-api.polymarket.com`, RPC Polygon e docs oficiais.
Carteira: `0x2b3cf54201a00def81ec5d840da7d58fc37e9f22`. Detalhes tambem na memoria do
projeto: `polymarket-auditoria-api.md` e `polymarket-auto-resgate.md`.

## Contexto confirmado
- **Auto-resgate (auto-claim) ligado.** Vitorias saem de `/positions` quase na hora e
  sao reconstruidas como **W** via activity (`reconciliarRedeems`). Perdas vem sempre
  `redeemable=true && currentValue=0` → classificam certo como encerradas/L.
- Snapshot: 107 posicoes (101 perdas + 6 ativas), 84 vitorias (fora de /positions),
  285 eventos de activity (200 BUY, 84 REDEEM, 1 SELL).
- **dev = prod**: `index_proxy.html` e `server/public/index.html` byte-identicos (SHA256). Sem drift.
- Tokens Polygon corretos: `pUSD 0xC011...` (colateral atual) e `USDC.e 0x2791...` (legado).
- `cashPnl` = mark-to-market (nao realizado); realizado seria `realizedPnl` (nao usado).

## Achados (severidade)

🔴 **#1 — "Encerrada" = `redeemable===true && currentValue<0.01`** (index ~linha 1029).
   Correto: `redeemable===true` e subdividir por `currentValue`. Vitoria resolvida nao-resgatada
   cairia em ATIVAS. Hoje NAO ocorre (auto-resgate). Latente/mitigado.

✅ **#3 — `/positions` limit=100 cortava ativas — JA CORRIGIDO** (paginacao, ver acima).

🟠 **#4 — Tetos fixos de paginacao**: /positions para em offset 1000 (~1100 pos),
   /activity em offset 2000 (~2500 eventos). API aceita `limit=1000`. Sem impacto hoje (285).
   Fix: `limit=1000` + paginar ate pagina vazia (sem teto fixo).

🟠 **#6 — SELL nao tratado** em `splitMultiBuys`/`reconciliarRedeems` (so BUY/REDEEM).
   1 caso na carteira → stake do split pode ficar superestimado.

🟠 **#7 — `marcarTodas()` (index ~1490)** usa `copied.has(p.conditionId)` em vez de
   `p._splitId||p.conditionId` → contador "copiadas" erra com splits.

🟡 **#8 — `sizeThreshold=.1`** traz dust; default da API (~1.0) filtra mais.

🟡 **#9 — Proxy `/api/anthropic/*`** (server.js 63-66 + headers 16,37-39): open proxy
   confirmado SEM uso (unica ref em `_archive/`). Seguro remover. Limpar tambem CLAUDE.md (15,45,115).

🟡 **#10 — XSS via innerHTML sem escape**:
   - Titulos de mercado crus em `<td>` (1169, 1202, 1240) → `<img onerror>` executa (risco baixo-medio).
   - Nomes de tipster crus (`buildTipsterOpts` 443; `renderTipsterList` 1856) → self-XSS.
   - TSV input (1363) escapa `"` → seguro.
   - Fix: helper `esc()` aplicado a `title` e `t`.

🟡 **#5 — Campos inexistentes lidos** (inofensivos hoje, salvos por fallback `||`):
   `pos.price`→`curPrice`; `pos.startDate`/`createdAt` nao existem em /positions;
   `activity.amount`→`usdcSize`; `activity.market`→`conditionId`. BUY/REDEEM detectam certo.

## Plano de correcao sugerido (ordem)
1. Rapidos e isolados: `marcarTodas` (#7), remover proxy Anthropic (#9) + limpar CLAUDE.md, decidir `sizeThreshold` (#8).
2. XSS: helper `esc()` (#10).
3. Precisa testar com dados reais: redefinir "encerrada" (#1) + tratar SELL (#6).
4. Robustez: elevar/remover tetos de paginacao (#4).

> Regra: uma etapa por vez (propor → confirmar → executar). Backup em `_backups/` antes de editar.
> Espelhar `index_proxy.html` → `server/public/index.html` (Railway serve so de public/).

## Decisoes pendentes (suas)
- `sizeThreshold`: manter `.1` (inclui dust) ou usar default?
- "Encerrada": adotar `redeemable===true` e sub-rotular ganho/perda?
- Remover de vez o proxy Anthropic + doc associada?
