# Instruções para geração de mensagem de commit

Gere mensagens de commit seguindo estas regras.

## Formato obrigatório
- Use o padrão **Conventional Commits**.
- Estrutura: `<tipo>(escopo opcional): <resumo>`
- Tipos permitidos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`, `revert`.

## Regras do resumo (linha de título)
- Escreva em português (pt-BR).
- Use verbo no imperativo (ex.: "adiciona", "corrige", "remove", "refatora").
- Seja específico e curto (máximo ~72 caracteres).
- Não termine com ponto final.
- Evite termos vagos como "ajustes" ou "mudanças" sem contexto.

## Corpo da mensagem (quando necessário)
- Adicione corpo apenas se houver contexto importante.
- Explique **o que** mudou e **por que** mudou.
- Use bullets curtos, quando útil.
- Não inclua detalhes irrelevantes de implementação.

## Quebras de mudança (breaking changes)
- Quando houver quebra de compatibilidade, inclua:
  - `!` no tipo (ex.: `feat!:`), ou
  - seção `BREAKING CHANGE:` no corpo.
- Descreva claramente o impacto e a migração necessária.

## Coautoria e metadados
- Não invente coautores, tickets ou links.
- Só inclua referência de issue (ex.: `#123`) se ela estiver evidente nas alterações.

## Qualidade
- A mensagem deve refletir o diff real.
- Não mencione arquivos ou mudanças que não foram alterados.
- Evite emojis.

## Exemplos válidos
- `feat(game): adiciona lógica de embaralhamento das cartas`
- `fix(ui): corrige alinhamento do contador no mobile`
- `refactor(state): simplifica atualização de pontuação`
- `test(memory): adiciona testes para validação de pares`
- `docs(readme): documenta como executar o projeto`
