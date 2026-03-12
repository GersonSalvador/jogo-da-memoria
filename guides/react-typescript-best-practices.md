# Regras de Melhores Práticas (TypeScript + React)

## 1) Tipagem e contratos
- Tipar `props`, `state`, contexto, hooks e respostas de API.
- Evitar `any`; usar `unknown` com validação quando necessário.
- Modelar domínio com tipos claros (ex.: `type`/`interface` por caso de uso).
- Centralizar tipos compartilhados em módulos de domínio.

## 2) Organização de código
- Separar responsabilidades:
  - UI em componentes;
  - lógica em hooks/serviços;
  - acesso a dados em camada própria.
- Manter componentes pequenos e focados.
- Preferir composição de componentes em vez de herança.

## 3) Estado e efeitos
- Manter estado mínimo e derivar o restante.
- Evitar duplicação de estado.
- Em `useEffect`, declarar dependências corretamente e limpar efeitos.
- Controlar chamadas assíncronas para evitar race conditions.

## 4) Performance
- Otimizar apenas após evidência (profiling/medição).
- Usar memoização (`useMemo`, `useCallback`, `memo`) com critério.
- Evitar renders desnecessários por props instáveis.
- Aplicar code splitting e lazy loading em rotas/páginas pesadas.

## 5) Estilo com SASS
- Preferir CSS Modules com SASS para escopo local.
- Usar variáveis, mixins e tokens de design.
- Evitar seletores profundos e regras globais excessivas.
- Manter nomenclatura consistente e previsível.

## 6) Acessibilidade
- Usar elementos semânticos (`button`, `nav`, `main`, `label`).
- Garantir foco visível e navegação por teclado.
- Fornecer `aria-*` somente quando a semântica nativa não cobrir.
- Validar contraste e mensagens de erro compreensíveis.

## 7) Tratamento de erros
- Tratar estados de loading, vazio e erro.
- Normalizar erros de API para mensagens consistentes.
- Não vazar detalhes internos em mensagens para usuário final.

## 8) Testes
- Unitário para lógica pura.
- Componente para comportamento visual e interação.
- Integração para fluxo entre módulos.
- E2E para jornadas críticas.

## 8.1) Regras de tomada de decisão para testes
- Avaliar cada mudança por **Impacto**, **Probabilidade de falha** e **Criticidade de negócio** (escala 1-3).
- Calcular prioridade: `Impacto + Probabilidade + Criticidade`.
- Aplicar cobertura mínima por prioridade:
  - 3 a 4: teste unitário ou de componente.
  - 5 a 6: unitário + componente/integrado.
  - 7 a 9: unitário + integração + E2E (se fluxo crítico).
- Sempre incluir casos de erro e borda quando houver transformação de dados, regras de permissão ou fluxo assíncrono.
- Em bug corrigido, criar teste de regressão obrigatório no menor nível que detecte a falha.

## 8.2) Tecnologias recomendadas por tipo de teste
- **Runner padrão**: `Vitest`.
- **Cobertura**: `@vitest/coverage-v8`.
- **Teste de componente/integrado (React)**: `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`.
- **Mock de API/rede**: `MSW (Mock Service Worker)`.
- **E2E**: `Playwright` (padrão principal).
- **Snapshot visual (quando necessário)**: preferir Playwright screenshot assertions em cenários estáveis.

## 8.3) Política de uso de tecnologias
- Evitar combinar múltiplos runners no mesmo projeto sem justificativa técnica.
- Priorizar `MSW` em vez de mocks manuais espalhados.
- E2E deve cobrir apenas jornadas críticas; não duplicar toda cobertura de integração.
- Falha intermitente (`flaky`) bloqueia promoção de pipeline até estabilização.

## 9) Segurança
- Nunca armazenar segredos no front-end.
- Sanitizar dados renderizados dinamicamente.
- Revisar dependências e corrigir vulnerabilidades conhecidas.
- Evitar logs com dados sensíveis.

## 10) Qualidade e manutenção
- Habilitar TypeScript estrito (`strict: true`) quando possível.
- Adotar ESLint + Prettier.
- Revisão de código com foco em legibilidade e riscos.
- Documentar decisões relevantes (trade-offs e restrições).
