# Polymarket — Contexto do Projeto

Dashboard de mercados de predição da Polymarket para FDC Capital.
Exibe mercados ativos, posições on-chain (Polygon), probabilidades e análise via Claude AI.
Suporta dois modos: direto (CORS via Cloudflare Worker) e proxy local (Node/Express).

Design system no CLAUDE.md da pasta-mãe `FDC Capital/`.

---

## Arquivos principais

```
index.html              → frontend direto (usa Cloudflare Worker como proxy CORS)
index_proxy.html        → frontend via proxy local (aponta para server/ em localhost)
server/
  server.js             → proxy Express: roteia /api/poly/* /api/bcb/* /api/anthropic/* /api/polygon
  package.json          → única dependência: express ^4.18.2
  public/
    index.html          → HTML servido pelo Express em produção (Railway)
```

---

## Modos de uso

| Modo | Arquivo | Quando usar |
|------|---------|-------------|
| Direto | `index.html` | Desenvolvimento local ou deploy estático; usa Cloudflare Worker para CORS |
| Proxy local | `index_proxy.html` | Quando o Worker não está disponível; requer `node server.js` em `server/` |
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

- Assets em `brand/` (logos SVG, favicons PNG, `site.webmanifest`).
- Paleta nova: `--bg #0A0D12`, `--blue #2E8BFF`, `--green #2BC07E`, `--red #E5524B`.
- **Cyan, purple e teal removidos** — não reintroduzir.
- Nav active usa `var(--blue)` (azul = sinal), não verde.

---

## Regras específicas

- NÃO alterar a lógica de proxy sem testar CORS em produção.
- `server/node_modules/` não é versionado — rodar `npm install` em `server/` após clonar.
- Para deploy no Railway, apontar root para `server/` e usar `npm start`.
- O proxy repassa os headers `x-api-key`, `anthropic-version` e `anthropic-beta` para a Anthropic API.
- CORS está aberto (`*`) — não expor chaves de API no frontend em produção.
