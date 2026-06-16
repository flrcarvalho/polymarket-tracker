# Polymarket — Contexto do Projeto

Dashboard de mercados de predição da Polymarket para FDC Capital.
Exibe mercados ativos, posições on-chain (Polygon), probabilidades.

Design system no CLAUDE.md da pasta-mãe `FDC Capital/`.

---

## Arquivos principais

```
index_proxy.html        → frontend via proxy local (arquivo principal de desenvolvimento)
server/
  server.js             → proxy Express: roteia /api/poly/* /api/bcb/* /api/anthropic/* /api/polygon
  package.json          → única dependência: express ^4.18.2
  public/
    index.html          → HTML servido pelo Express em produção (Railway) — cópia de index_proxy.html
brand/                  → logos SVG, favicons, polymarket-icon.png, tokens.css
_archive/               → backups não versionados (.gitignore com *)
  index_direct_cors.html                   → index.html aposentado (versão Cloudflare Worker CORS)
  index_proxy_com_extrator.html            → backup antes da remoção do Extrator de Bets
  index_proxy_2026-06-07_pre-chart-fix.html → estado pós-topbar + split ativas, antes de corrigir cores dos gráficos
```

> `index.html` (versão direta com Cloudflare Worker) foi **aposentado** em 2026-06-07 — API não funciona no BR. Removido do git, arquivado em `_archive/`.

---

## Modos de uso

| Modo | Arquivo | Quando usar |
|------|---------|-------------|
| Proxy local | `index_proxy.html` | Desenvolvimento local; requer `node server.js` em `server/` |
| Produção | `server/public/index.html` | Railway deploy — Express serve o HTML e faz proxy das APIs |

---

## Endpoints do proxy (`server/server.js`)

| Rota | Destino | Finalidade |
|------|---------|-----------|
| `/api/poly/*` | `https://polymarket-proxy.flrcarvalho.workers.dev/` | Polymarket API via Cloudflare Worker |
| `/api/bcb/*` | `https://olinda.bcb.gov.br/` | BCB Olinda (cotação BRL/USD) |
| `/api/anthropic/*` | `https://api.anthropic.com/` | Anthropic API (Claude AI) |
| `/api/polygon` | Polygon RPC (fallback list) | Posições on-chain ERC-1155 |

**Cloudflare Worker URL:** `https://polymarket-proxy.flrcarvalho.workers.dev/`

**Polygon RPC fallback (ordem):**
1. `https://polygon-bor-rpc.publicnode.com`
2. `https://polygon.llamarpc.com`
3. `https://rpc.ankr.com/polygon`

---

## Stack

- **Frontend:** HTML + CSS + Vanilla JS · Fontes: Manrope + JetBrains Mono (Google Fonts)
- **Backend/Proxy:** Node.js + Express (somente `express` como dependência)
- **Deploy:** Railway apontando para `server/` (`npm start` → `node server.js`)
- **Porta padrão:** `process.env.PORT || 3000`

---

## Design / Marca

- **Token system:** `brand/tokens.css` é a fonte de verdade (copiado de `FDC Capital - Branding/pack/tokens/tokens.css`).
- **Dois destinos de brand/**: ao atualizar assets, copiar para `brand/` E `server/public/brand/`. Railway só serve de `server/public/`.
- Assets em `brand/`: logos SVG, favicons PNG/SVG, `site.webmanifest`, `tokens.css`, `polymarket-icon.png`.
- Paleta: tokens.css define `--bg`, `--surface`, `--ink`, `--pos`, `--neg`, `--accent`, `--warn` etc.
- O tracker usa nomes de alias (`--bg2`, `--text`, `--green`, `--red`, `--blue`, `--amber`) mapeados via bridge no `<style>` inline.
- **Logos**: `fdc-logo-vertical-dark.svg` (sidebar dark) / `fdc-logo-vertical-light.svg` (sidebar light), com classe `.logo-dark`/`.logo-light` e CSS de troca automática.
- **Ícone Polymarket**: `brand/polymarket-icon.png` (14×14px) no nav-group do sidebar.
- **Cyan, purple, teal e emerald removidos** — paleta: só Electric Blue, Platinum, pos/neg/warn.

---

## Arquitetura de UI relevante

### Topbar (redesign 2026-06-07)
- **Esquerda:** `#topbarTitle` (nome da página, 15px/700/ink) + `#topbarSub` (subtítulo JetBrains Mono, visível só no Dashboard)
- **Direita:** `#dash-cotacao` (cotação BRL/USD) + `.cur-btns` (USD/BRL) + `.status-pill` + `.theme-toggle` — tudo agrupado com gap 6px
- `showPage()` limpa `topbarSub` ao sair do Dashboard
- O `.page-header` do Dashboard foi **removido** — KPIs começam direto após o topbar

### Grid de fundo (2026-06-16)
- `body::before` com `linear-gradient(--line-2)`, `background-size: 44px 44px`, `opacity: .55`
- `.app` tem `position: relative; z-index: 1` para ficar acima do grid

### Split de posições ativas (2026-06-07)
- `splitMultiBuys(pos, activity)` agora chamada para `dadosAtivos` E `dadosFechados`
- Para ativos: `currentValue` distribuído proporcionalmente ao stake de cada compra
- `renderAtivasTable` exibe badge X/Y idêntico ao das encerradas e coluna **Odd**
- Cada split de ativa tem `_splitId` único → tipster dropdown independente
- Posições de compra única: `avgPrice` é ancurado ao `price` da atividade BUY (fix 2026-06-16)

### Paleta de gráficos (corrigida 2026-06-07)
- Barras diárias: `rgba(43,192,126,.65)` (pos) / `rgba(229,82,75,.65)` (neg) = `#2BC07E` / `#E5524B` com 65% opacidade
- Calendário heatmap: mesma base com intensidade variável (`0.2` a `0.95` via `dayBg()`)
- Linha acumulada: `#2BC07E` · Donut: `['#2BC07E','#2E8BFF','#E0A21A','#7FB2FF','#E5524B','#AEB7C2']`

---

## Regras específicas

- NÃO alterar a lógica de proxy sem testar CORS em produção.
- `server/node_modules/` não é versionado — rodar `npm install` em `server/` após clonar.
- Para deploy no Railway, **root directory DEVE ser `server/`** — sem isso o Railpack não detecta o Node app.
- ⚠️ **ARMADILHA RAILWAY**: se não houver `index.html` na raiz do repo, o Railpack perde a auto-detecção de estático e falha. Sempre garantir que Railway → Settings → Source → Root Directory = `server/`.
- Ao sincronizar `index_proxy.html` → `server/public/index.html`, basta copiar: ambos usam os mesmos paths relativos `/api/*`.
- O proxy repassa os headers `x-api-key`, `anthropic-version` e `anthropic-beta` para a Anthropic API.
- CORS está aberto (`*`) — não expor chaves de API no frontend em produção.
