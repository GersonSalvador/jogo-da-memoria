# Orquestrador de Agentes

Este arquivo define como os agentes colaboram neste projeto.

## Leitura obrigatória antes de qualquer tarefa

> **Todo agente deve ler [`docs/PROJECT_GUIDELINES_SHORT.md`](docs/PROJECT_GUIDELINES_SHORT.md) antes de iniciar qualquer tarefa.**  
> O documento completo [`docs/PROJECT_GUIDELINES.md`](docs/PROJECT_GUIDELINES.md) deve ser consultado quando a tarefa exigir detalhes de arquitetura, runbook, testes, segurança, critérios de pronto ou convenções específicas.

## Agentes disponíveis
- Arquiteto: [agents/arquiteto.md](agents/arquiteto.md)
- Front-end (React + TypeScript + SASS): [agents/frontend-react-ts-sass.md](agents/frontend-react-ts-sass.md)
- Testes: [agents/testes.md](agents/testes.md)
- Segurança: [agents/seguranca.md](agents/seguranca.md)
- Boas práticas React + TypeScript: [guides/react-typescript-best-practices.md](guides/react-typescript-best-practices.md)

## Regra principal
Toda tarefa começa no **Agente Arquiteto**. Nenhuma implementação deve iniciar sem plano.

## Fluxo padrão (obrigatório)
1. Receber a tarefa e clarificar objetivo.
2. Arquiteto cria o plano com etapas, riscos, critérios de aceite e validação.
3. Arquiteto decide quais especialistas devem atuar.
4. Especialistas executam suas partes respeitando este contrato.
5. Arquiteto consolida resultado final, validações e pendências.

## Critérios de acionamento por agente
- Acionar Front-end quando houver React, TypeScript, UI, estado, hooks, estilos ou SASS.
- Acionar Testes quando houver lógica crítica, regressão possível, fluxo de negócio ou necessidade de cobertura.
- Acionar Segurança quando houver autenticação, autorização, dados sensíveis, APIs externas, upload, logs, secrets ou risco de ataque.

## Protocolo de handoff entre agentes
Cada agente deve devolver:
1. Objetivo executado.
2. Escopo alterado (arquivos e impacto).
3. Riscos/resíduos identificados.
4. Evidência de validação (testes, build, checklist).
5. Próxima ação recomendada para o fluxo.

## Definição de pronto por tarefa
- Plano criado e seguido.
- Código implementado com tipagem e legibilidade.
- Testes adequados ao risco (ou justificativa explícita da ausência).
- Revisão de segurança aplicada em cenários sensíveis.
- Arquivos de [`docs/`](docs/) atualizados se a tarefa alterou arquitetura, padrões, runbook, testes ou segurança.
- Resultado final consolidado pelo Arquiteto.
- **Commits escritos em português do Brasil** (pt-BR) seguindo Conventional Commits — ver [`docs/PROJECT_GUIDELINES.md#10-convenções-de-commit`](docs/PROJECT_GUIDELINES.md#10-convenções-de-commit).

## Regras de decisão
- Em conflito entre velocidade e segurança, priorizar segurança.
- Em conflito entre opinião e critério objetivo, priorizar critérios de aceite.
- Em ambiguidade de escopo, escolher a opção mais simples que atenda ao requisito.

## Escalonamento
Se um agente identificar bloqueio, deve registrar:
- bloqueio objetivo;
- impacto no plano;
- alternativa viável;
- decisão necessária para destravar.
