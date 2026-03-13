# Diretrizes do Projeto — Jogo da Memória

> **Versão curta para uso no chat**: [`docs/PROJECT_GUIDELINES_SHORT.md`](./PROJECT_GUIDELINES_SHORT.md).
> Use este documento completo quando a tarefa exigir detalhes.

> **Leitura obrigatória antes de qualquer tarefa.** Este documento elimina a necessidade de leitura completa do repositório a cada prompt. Ele concentra arquitetura, padrões, comandos e critérios de qualidade que os agentes devem conhecer.

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Arquitetura e mapa de arquivos](#2-arquitetura-e-mapa-de-arquivos)
3. [Fluxo de estado do jogo](#3-fluxo-de-estado-do-jogo)
4. [Stack e dependências](#4-stack-e-dependências)
5. [Runbook operacional](#5-runbook-operacional)
6. [Convenções de código](#6-convenções-de-código)
7. [Sistema de estilos](#7-sistema-de-estilos)
8. [Estratégia de testes](#8-estratégia-de-testes)
9. [Segurança](#9-segurança)
10. [Convenções de commit](#10-convenções-de-commit)
11. [Convenções de nomenclatura e organização](#11-convenções-de-nomenclatura-e-organização)
12. [Critérios de pronto (Definition of Done)](#12-critérios-de-pronto-definition-of-done)
13. [Riscos e lacunas conhecidas](#13-riscos-e-lacunas-conhecidas)
14. [Referências rápidas](#14-referências-rápidas)

---

## 1. Visão geral

**Produto**: SPA de jogo da memória com avatares gerados via DiceBear.  
**Público**: uso local/educacional, sem autenticação nem dados sensíveis de usuário.  
**Stack**: React 19 + TypeScript 5 + Vite 8 + SASS Modules + Vitest + Playwright.  
**Deploy**: Nginx estático via Docker multi-stage.

O projeto **não possui roteamento** (SPA de página única). O estado global do jogo é totalmente controlado pelo hook central [`src/hooks/useMemoryGame.ts`](../src/hooks/useMemoryGame.ts) via `useReducer`.

---

## 2. Arquitetura e mapa de arquivos

### Ponto de entrada

| Arquivo | Papel |
|---|---|
| [`src/main.tsx`](../src/main.tsx) | Bootstrap do React (ReactDOM.createRoot) |
| [`src/App.tsx`](../src/App.tsx) | Montagem da página e estilos globais |
| [`src/pages/MemoryGamePage.tsx`](../src/pages/MemoryGamePage.tsx) | Única página; orquestra os componentes usando o hook |

### Domínio / lógica de negócio

| Arquivo | Responsabilidade |
|---|---|
| [`src/hooks/useMemoryGame.ts`](../src/hooks/useMemoryGame.ts) | Hook principal — `useReducer` com todas as fases do jogo, timer e score ao vivo |
| [`src/services/gameConfig.ts`](../src/services/gameConfig.ts) | Definição de dificuldades (`facil`, `medio`, `dificil`), temas e limites de tempo |
| [`src/services/memoryDeck.ts`](../src/services/memoryDeck.ts) | Criação e embaralhamento do baralho de cartas |
| [`src/services/scoring.ts`](../src/services/scoring.ts) | Cálculo de pontuação (pares, tempo restante, erros) |
| [`src/services/dicebear.ts`](../src/services/dicebear.ts) | Geração de SVG de avatares via `@dicebear/core` |

### UI — Componentes por feature

| Arquivo | Responsabilidade |
|---|---|
| [`src/components/memory-game/GameSetup.tsx`](../src/components/memory-game/GameSetup.tsx) | Formulário de seleção de dificuldade e tema |
| [`src/components/memory-game/GameStatus.tsx`](../src/components/memory-game/GameStatus.tsx) | Exibe timer, erros e score durante a partida |
| [`src/components/memory-game/GameBoard.tsx`](../src/components/memory-game/GameBoard.tsx) | Grid de cartas organizado em linhas (via `boardRows`) |
| [`src/components/memory-game/MemoryCard.tsx`](../src/components/memory-game/MemoryCard.tsx) | Carta individual com estados: virada, matched, em resolução |
| [`src/components/memory-game/GameResult.tsx`](../src/components/memory-game/GameResult.tsx) | Tela de resultado (`won` / `lost`) com pontuação final |

### Sistema de estilos

| Arquivo | Papel |
|---|---|
| [`src/styles/_tokens.scss`](../src/styles/_tokens.scss) | Design tokens (cores, espaçamentos, etc.) |
| [`src/styles/_variables.scss`](../src/styles/_variables.scss) | Variáveis SASS derivadas dos tokens |
| [`src/styles/_mixins.scss`](../src/styles/_mixins.scss) | Mixins reutilizáveis |
| [`src/styles/global.scss`](../src/styles/global.scss) | Reset e estilos globais base |
| [`src/index.css`](../src/index.css) | CSS global mínimo (evitar adicionar regras aqui; preferir global.scss) |
| `*.module.scss` por componente | Estilos encapsulados por feature |

### Testes

| Arquivo / Diretório | Tipo |
|---|---|
| [`src/services/gameConfig.test.ts`](../src/services/gameConfig.test.ts) | Unitário — config |
| [`src/services/memoryDeck.test.ts`](../src/services/memoryDeck.test.ts) | Unitário — baralho |
| [`src/services/scoring.test.ts`](../src/services/scoring.test.ts) | Unitário — pontuação |
| [`src/App.test.tsx`](../src/App.test.tsx) | Integração de UI |
| [`tests/e2e/smoke.spec.ts`](../tests/e2e/smoke.spec.ts) | E2E — smoke (página carrega) |
| [`tests/e2e/memory-game.spec.ts`](../tests/e2e/memory-game.spec.ts) | E2E — jornada completa do jogo |
| [`src/test/setup.ts`](../src/test/setup.ts) | Setup global Vitest (jest-dom) |

### Infra / build

| Arquivo | Papel |
|---|---|
| [`vite.config.ts`](../vite.config.ts) | Vite + Vitest; cobertura mínima 70% |
| [`playwright.config.ts`](../playwright.config.ts) | Config do Playwright (E2E) |
| [`eslint.config.js`](../eslint.config.js) | Lint (no-explicit-any, prettier, react-hooks, jsx-a11y) |
| [`tsconfig.json`](../tsconfig.json) + [`tsconfig.app.json`](../tsconfig.app.json) + [`tsconfig.node.json`](../tsconfig.node.json) | TypeScript project references |
| [`Dockerfile`](../Dockerfile) | Multi-stage: dev → build → prod (Nginx) |
| [`docker-compose.yml`](../docker-compose.yml) | Orquestração local containerizada |
| [`nginx.conf`](../nginx.conf) | SPA fallback (`try_files`) e cache de assets |

---

## 3. Fluxo de estado do jogo

O jogo possui quatro **fases** (`GamePhase`) controladas pelo reducer em `useMemoryGame.ts`:

```
setup ──► playing ──► won
                 └──► lost
won   ──► setup (via BACK_TO_SETUP)
lost  ──► setup (via BACK_TO_SETUP)
```

### Actions do reducer

| Action | Gatilho |
|---|---|
| `SET_DIFFICULTY` | Usuário seleciona dificuldade (apenas em `setup`) |
| `SET_THEME` | Usuário seleciona tema de avatares (apenas em `setup`) |
| `START_GAME` | Click em "Jogar"; cria baralho e inicia timer |
| `CARD_CLICK` | Click em carta; resolve par ou erro |
| `HIDE_MISMATCH` | Timeout de 500 ms após erro; vira cartas de volta |
| `TICK` | Intervalo de 1 s; decrementa timer; passa para `lost` se chegar a 0 |
| `BACK_TO_SETUP` | Usuário clica em "Jogar novamente"; retorna à fase `setup` |

### Estado relevante no hook

```typescript
difficulty: DifficultyKey       // 'facil' | 'medio' | 'dificil'
theme: ThemeKey                 // 'avataaars' | 'bottts' | 'pixel-art'
phase: GamePhase                // 'setup' | 'playing' | 'won' | 'lost'
cards: MemoryCard[]             // baralho embaralhado
flippedCardIds: string[]        // IDs das cartas viradas (máx. 2)
errors: number                  // pares errados
matchedPairs: number            // pares acertados
remainingSeconds: number        // temporizador
score: number                   // pontuação ao vivo
isResolving: boolean            // true enquanto aguarda HIDE_MISMATCH
boardRows: MemoryCard[][]       // grade calculada (√totalCards por linha)
```

---

## 4. Stack e dependências

### Runtime
- **React 19** — componentes funcionais + hooks; sem Context API (estado local via `useReducer`)
- **@dicebear/core + avataaars + bottts + pixel-art** — geração de avatares SVG no cliente

### Build
- **Vite 8** com `@vitejs/plugin-react` (Babel + HMR)
- **TypeScript 5.9** — `strict: true` em `tsconfig.app.json`
- **SASS** (Dart Sass 1.98) — via Vite; módulos `.module.scss`

### Qualidade
- **ESLint 9** — flat config; `no-explicit-any`, `react-hooks`, `jsx-a11y`, `prettier`
- **Prettier 3** — formatação automática integrada ao ESLint

### Testes
- **Vitest 4** — runner unitário e de componente
- **@vitest/coverage-v8** — cobertura; mínimo 70%
- **@testing-library/react + user-event + jest-dom** — testes de componente/integração
- **MSW 2** — mock de rede (instalado, mas sem uso fixado; use para APIs externas futuramente)
- **Playwright 1.58** — E2E

---

## 5. Runbook operacional

### Desenvolvimento local (sem Docker)
```bash
npm install
npm run dev           # http://localhost:5173
```

### Build de produção
```bash
npm run build         # tsc -b && vite build → dist/
npm run preview       # serve a pasta dist/
```

### Lint e formatação
```bash
npm run lint          # verifica
npm run lint:fix      # corrige automaticamente
```

### Testes
```bash
npm run test              # unitários + componente (run único)
npm run test:watch        # watch mode
npm run test:coverage     # gera relatório de cobertura (min. 70%)
npm run test:e2e          # Playwright E2E (requer servidor rodando ou auto-start do config)
```

### Docker
```bash
docker compose up -d       # sobe app em modo produção
docker compose down        # derruba containers
docker compose build       # força rebuild da imagem
```

> **Atenção**: o `Dockerfile` usa multi-stage. Stage `dev` para desenvolvimento, stage `build` compila o SPA e stage final serve via Nginx. Não expor a imagem de `build` diretamente.

---

## 6. Convenções de código

> Referência completa: [`guides/react-typescript-best-practices.md`](../guides/react-typescript-best-practices.md)

### TypeScript
- `strict: true` obrigatório; nunca desativar flags de strictness.
- Proibido `any`; usar `unknown` com narrowing quando necessário.
- Tipar props, retorno de hooks, payloads de actions do reducer e dados de serviços.
- Centralizar tipos de domínio em módulo próprio (ex.: `src/types/`).
- Preferir `type` para unions/intersections e `interface` para objetos extensíveis.
- Usar `import type` para importações puramente tipadas.

### React
- **Somente componentes funcionais**; sem componentes de classe.
- Lógica de negócio fora do JSX: extrair para hooks e serviços.
- Memoização (`useMemo`, `useCallback`, `memo`) somente com evidência de problema de performance.
- Nunca duplicar estado; derivar valores do estado existente.
- Declarar dependências de `useEffect` corretamente; limpar efeitos (timer, intervalo, listener).
- Nunca usar `dangerouslySetInnerHTML` sem sanitização explícita.

### Acessibilidade
- Elementos semânticos: `<button>`, `<main>`, `<label>`, `<nav>`.
- `aria-*` somente quando a semântica nativa não cobrir o caso.
- Foco visível e navegação por teclado em todos os elementos interativos.
- Contraste de cores aprovado (WCAG AA mínimo).

---

## 7. Sistema de estilos

- **Regra de precedência**: `global.scss` define reset global; `*.module.scss` define estilos de componente. Evitar adicionar regras em `src/index.css` (arquivo legado do template Vite; preferir `global.scss` para novas regras globais).
- Sempre usar variáveis e tokens de `_tokens.scss` e `_variables.scss` para cores, espaçamentos e breakpoints.
- Mixins de responsividade e utilitários em `_mixins.scss`.
- Seletores de módulo em camelCase (ex.: `.gameBoard`, `.cardFront`).
- Evitar aninhamento profundo de seletores (máx. 3 níveis).
- Não usar seletores globais dentro de módulos (`:global()` apenas em casos excepcionais documentados).

---

## 8. Estratégia de testes

> Referência completa: [`agents/testes.md`](../agents/testes.md)

### Cobertura obrigatória (70% mínimo global, definido em `vite.config.ts`)

| Tipo | Quando aplicar | Localização |
|---|---|---|
| Unitário | Lógica pura, serviços, funções utilitárias | `src/services/*.test.ts` |
| Componente / Integração | Comportamento de UI, interações, estado via hook | `src/App.test.tsx` e novos `*.test.tsx` |
| E2E | Jornadas críticas (setup → jogar → resultado) | `tests/e2e/*.spec.ts` |

### Matriz de prioridade por risco (obrigatório ao testar novas funcionalidades)

| Nota | Critério | Cobertura mínima |
|---|---|---|
| 3–4 | Impacto + Probabilidade + Criticidade baixos | Unitário ou componente |
| 5–6 | Médio | Unitário + componente/integração |
| 7–9 | Alto | Unitário + integração + E2E |

### Observações críticas

- O teste E2E em [`tests/e2e/memory-game.spec.ts`](../tests/e2e/memory-game.spec.ts) aguarda até 121 s pelo fim da partida — produz pipeline lenta e é frágil (flaky). Priorizar refatoração para usar tempo acelerado ou mock de timer antes de escalar cobertura E2E.
- `MSW` está instalado mas sem uso estabelecido. Usar para mock de chamadas DiceBear em testes de componente que dependam de geração de avatar.
- Testes devem seguir padrão **Arrange-Act-Assert**, ser determinísticos e independentes de ordem de execução.
- Bug corrigido → teste de regressão obrigatório no menor nível eficaz.

---

## 9. Segurança

> Referência completa: [`agents/seguranca.md`](../agents/seguranca.md)

**Contexto atual**: SPA sem autenticação, sem dados pessoais sensíveis, sem backend próprio. Risco baixo no estado atual.

### Regras permanentes

- Nunca armazenar segredos (tokens, chaves de API) no código front-end.
- Não registrar dados pessoais em `console.log` ou serviços de log.
- Sanitizar qualquer dado externo antes de renderizar dinamicamente.
- Manter dependências atualizadas (`npm audit` em cada ciclo de release).
- Não usar `dangerouslySetInnerHTML` (DiceBear retorna SVG — injetar via `innerHTML` exige sanitização com DOMPurify ou equivalente).

### Gatilhos que obrigam acionamento do Agente de Segurança

- Adição de qualquer autenticação/autorização.
- Integração com APIs externas (além de DiceBear, que é apenas client-side).
- Upload de arquivos.
- Armazenamento de dados no `localStorage` / `sessionStorage`.
- Logs enviados a serviços externos.

---

## 10. Convenções de commit

> **OBRIGATÓRIO**: todos os commits deste projeto devem ser escritos em **português do Brasil (pt-BR)**, sem exceção.

O projeto adota **Conventional Commits**. Referência canônica de instruções de geração automática: [`.github/copilot-commit-message-instructions.md`](../.github/copilot-commit-message-instructions.md).

### Formato

```
<tipo>(escopo opcional): <resumo em pt-BR, imperativo>
```

### Tipos permitidos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `perf` | Melhoria de performance |
| `test` | Adição ou correção de testes |
| `docs` | Documentação |
| `build` | Mudanças em build, empacotamento, dependências |
| `ci` | Pipelines e automações |
| `chore` | Tarefas de manutenção sem impacto no produto |
| `style` | Formatação, espaçamento (sem mudança de lógica) |
| `revert` | Reversão de commit anterior |

### Regras do resumo

- **Sempre em português do Brasil** — verbo no imperativo (ex.: `adiciona`, `corrige`, `remove`, `refatora`).
- Máximo ~72 caracteres.
- Sem ponto final.
- Específico (evitar "ajustes", "correções diversas").

### Exemplos válidos

```
feat(game): adiciona modo de dificuldade extrema
fix(ui): corrige alinhamento do timer no mobile
refactor(hook): simplifica lógica de resolução de pares
test(scoring): adiciona testes para pontuação com tempo zerado
docs(guidelines): atualiza mapa de arquivos do projeto
```

### Breaking changes

```
feat!(auth): altera contrato da API de configuração do jogo

BREAKING CHANGE: o campo 'time' foi renomeado para 'timeLimitSeconds'
```

---

## 11. Convenções de nomenclatura e organização

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes React | PascalCase | `GameBoard.tsx` |
| Hooks | camelCase com prefixo `use` | `useMemoryGame.ts` |
| Serviços e utilitários | camelCase | `memoryDeck.ts`, `scoring.ts` |
| Tipos e interfaces | PascalCase | `MemoryCard`, `GamePhase` |
| Arquivos de estilo | PascalCase + `.module.scss` | `GameBoard.module.scss` |
| Classes SASS (CSS Modules) | camelCase | `.gameBoard`, `.cardFront` |
| Tokens/variáveis SASS | kebab-case com prefixo contextual | `$color-primary`, `$spacing-md` |
| Testes (unitário/componente) | mesmo nome do arquivo testado + `.test.*` | `scoring.test.ts` |
| Testes E2E | nome do fluxo + `.spec.ts` | `memory-game.spec.ts` |

### Estrutura de pastas (regra de crescimento)

- Novos componentes de UI relacionados ao jogo: `src/components/memory-game/`.
- Novos componentes genéricos/reutilizáveis: `src/components/common/` (criar se necessário).
- Novos hooks: `src/hooks/`.
- Novos serviços de domínio: `src/services/`.
- Novos tipos compartilhados: `src/types/`.
- Novas páginas (se houver roteamento no futuro): `src/pages/`.
- Testes E2E de novos fluxos: `tests/e2e/`.

---

## 12. Critérios de pronto (Definition of Done)

Uma tarefa só está concluída quando **todos** os itens abaixo forem atendidos:

- [ ] Plano técnico criado pelo Agente Arquiteto antes da implementação.
- [ ] Código implementado com tipagem forte (sem `any` não justificado).
- [ ] Lint passa sem erros (`npm run lint`).
- [ ] Build passa sem erros (`npm run build`).
- [ ] Cobertura de testes mantida ≥ 70% (`npm run test:coverage`).
- [ ] Testes adequados ao risco implementados (ou ausência justificada no handoff).
- [ ] Acessibilidade mínima verificada (semântica HTML + foco + aria quando necessário).
- [ ] Revisão de segurança aplicada se gatilho foi acionado.
- [ ] Commits escritos em português do Brasil seguindo Conventional Commits.
- [ ] Handoff devolvido ao Arquiteto com: objetivo executado, escopo alterado, riscos e validação.

---

## 13. Riscos e lacunas conhecidas

| Risco / Lacuna | Severidade | Recomendação |
|---|---|---|
| `README.md` é o template do Vite (não documenta o produto) | Média | Reescrever com descrição, setup e contribuição |
| E2E com `timeout` de 121 s — pipeline lenta e flaky | Média | Adicionar mock de timer ou usar `page.clock` do Playwright |
| `MSW` instalado sem padrão definido de uso | Baixa | Documentar e usar em testes de componente que dependam de DiceBear |
| Dupla fonte de CSS global (`index.css` + `global.scss`) sem precedência explícita | Baixa | Migrar regras de `index.css` para `global.scss` e tornar `index.css` apenas um `@import` |
| Hook `useMemoryGame` sem teste direto (testado indiretamente via `App.test.tsx`) | Média | Adicionar teste dedicado do reducer para regressão em mudanças de estado |
| Sem CI/CD pipeline configurada (`.github/workflows/` ausente) | Média | Criar workflow de lint + test + build em PRs |

---

## 14. Referências rápidas

| Documento | Propósito |
|---|---|
| [`AGENTS.md`](../AGENTS.md) | Contrato de orquestração de agentes |
| [`agents/arquiteto.md`](../agents/arquiteto.md) | Papel e regras do Agente Arquiteto |
| [`agents/frontend-react-ts-sass.md`](../agents/frontend-react-ts-sass.md) | Papel e regras do Agente Front-end |
| [`agents/testes.md`](../agents/testes.md) | Papel e regras do Agente de Testes |
| [`agents/seguranca.md`](../agents/seguranca.md) | Papel e regras do Agente de Segurança |
| [`guides/react-typescript-best-practices.md`](../guides/react-typescript-best-practices.md) | Boas práticas técnicas detalhadas |
| [`.github/copilot-commit-message-instructions.md`](../.github/copilot-commit-message-instructions.md) | Instruções canônicas de commit para o Copilot |
