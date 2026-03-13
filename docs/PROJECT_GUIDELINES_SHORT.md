# Diretrizes Rápidas do Projeto — Jogo da Memória

> Versão enxuta para reduzir consumo de contexto no chat.
> Documento completo: [`docs/PROJECT_GUIDELINES.md`](./PROJECT_GUIDELINES.md).

## 1. Escopo
- SPA de jogo da memória (sem roteamento).
- Stack principal: React 19 + TypeScript 5 + Vite 8 + SASS Modules.
- Estado central do jogo em `src/hooks/useMemoryGame.ts` com `useReducer`.

## 2. Arquitetura mínima
- Entrada: `src/main.tsx`, `src/App.tsx`, `src/pages/MemoryGamePage.tsx`.
- Domínio: `src/hooks/useMemoryGame.ts`, `src/services/gameConfig.ts`, `src/services/memoryDeck.ts`, `src/services/scoring.ts`, `src/services/dicebear.ts`.
- UI do jogo: `src/components/memory-game/*`.
- Estilos globais: `src/styles/global.scss` (evitar novas regras em `src/index.css`).
- Testes: unitários em `src/services/*.test.ts`, integração em `src/App.test.tsx`, E2E em `tests/e2e/*.spec.ts`.

## 3. Fluxo do jogo
- Fases: `setup -> playing -> won|lost`.
- Actions: `SET_DIFFICULTY`, `SET_THEME`, `START_GAME`, `CARD_CLICK`, `HIDE_MISMATCH`, `TICK`, `BACK_TO_SETUP`.
- Regras: mismatch volta em 500 ms; timer zerado leva para `lost`.

## 4. Regras de implementação
- TypeScript com `strict: true`.
- Proibido `any` (usar `unknown` + narrowing quando necessário).
- Apenas componentes funcionais.
- Lógica de negócio fora do JSX (hooks/services).
- Efeitos com cleanup quando aplicável.
- Não usar `dangerouslySetInnerHTML` sem sanitização explícita.

## 5. Estilo e acessibilidade
- Reutilizar tokens/variáveis/mixins em `src/styles/_tokens.scss`, `_variables.scss`, `_mixins.scss`.
- CSS Modules com classes em camelCase.
- Evitar aninhamento profundo no SASS.
- Garantir semântica HTML, foco visível e navegação por teclado.

## 6. Qualidade mínima obrigatória
- `npm run lint`
- `npm run build`
- `npm run test:coverage` com cobertura global >= 70%
- Testes por risco:
  - baixo: unitário ou componente
  - medio: unitário + integração
  - alto: unitário + integração + E2E

## 7. Segurança (baseline)
- Nunca expor segredos no front-end.
- Não logar dados sensíveis.
- Sanitizar dados externos antes de renderizar.
- Revisar dependências regularmente.
- Acionar revisão de segurança se houver auth, API externa, upload, storage ou logs externos.

## 8. Commits
- Conventional Commits em pt-BR.
- Formato: `<tipo>(escopo opcional): <resumo em pt-BR no imperativo>`.
- Tipos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`, `revert`.

## 9. Definition of Done
- Plano técnico definido antes da implementação.
- Tipagem forte sem `any` indevido.
- Lint, build e testes/cobertura aprovados.
- Acessibilidade mínima verificada.
- Revisão de segurança quando houver gatilho.
- Handoff com objetivo, escopo alterado, riscos e validação.

## 10. Quando consultar o guia completo
- Mudanças de arquitetura, runbook, testes, segurança ou convenções.
- Dúvidas sobre mapa de arquivos detalhado e critérios completos de pronto.
