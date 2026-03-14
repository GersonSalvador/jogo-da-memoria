# Jogo da Memória

SPA de jogo da memória desenvolvida com React, TypeScript, Vite e SASS Modules. O projeto oferece partidas com múltiplos níveis de dificuldade, cronômetro, sistema de pontuação, ranking persistido no navegador e personalização visual do tabuleiro.

## Visão geral

O fluxo do jogo é dividido em três momentos:

- configuração da partida
- jogo em andamento
- resultado de vitória ou derrota

Antes de iniciar, o jogador escolhe a dificuldade. Durante a partida, o cronômetro corre em tempo real, erros contam como penalidade e a pontuação é atualizada conforme os pares corretos são encontrados. Ao vencer, é possível salvar o resultado no ranking local.

## Funcionalidades

- quatro dificuldades com tabuleiros e tempos diferentes: Fácil, Médio, Difícil e Extremo
- cronômetro regressivo com derrota automática quando o tempo chega a zero
- cálculo de pontuação baseado em pares encontrados, tempo restante e penalidade por erro
- ranking local com top 10 geral e top 10 por dificuldade
- persistência em localStorage do ranking, último nome usado, tema visual e padrão do verso das cartas
- seleção de tema visual da interface: Claro, Escuro, Sepia e Oceano
- seleção do padrão do verso das cartas: Clássico, Listras diagonais, Pontos, Ondas suaves e Grade geométrica
- cartas geradas com avatares via DiceBear no tema bottts
- efeitos sonoros de jogo integrados com Freesound (início, flip, erro, acerto, vitória, derrota, countdown e clique)
- foco em acessibilidade com navegação por teclado, semântica e estados visuais claros
- cobertura por testes unitários, integração e E2E

## Regras do jogo

- o jogo começa na tela de configuração
- ao iniciar uma partida, o baralho é embaralhado conforme a dificuldade selecionada
- o jogador pode revelar até duas cartas por vez
- quando duas cartas não combinam, elas são ocultadas novamente após 500 ms
- quando todas as duplas são encontradas, a partida termina com vitória
- quando o tempo acaba, a partida termina com derrota

### Dificuldades

| Dificuldade | Grade | Total de cartas | Tempo |
| --- | --- | --- | --- |
| Fácil | 4 x 4 | 16 | 120 s |
| Médio | 6 x 6 | 36 | 270 s |
| Difícil | 8 x 6 | 48 | 360 s |
| Extremo | 10 x 6 | 60 | 450 s |

### Fórmula de pontuação

```text
pontuação = (pares_encontrados × 100) + (tempo_restante × 10) - (erros × 15)
```

## Stack técnica

- React 19
- TypeScript 5
- Vite 8
- SASS Modules
- ESLint 9
- Vitest + Testing Library
- Playwright
- Docker + Nginx

## Estrutura principal

```text
src/
  components/memory-game/   Componentes visuais do jogo
  hooks/                    Estado do jogo, ranking e tema visual
  pages/                    Composição da tela principal
  services/                 Regras de negócio, pontuação e geração do baralho
  styles/                   Tokens, variáveis e estilos globais
  types/                    Tipos compartilhados
tests/e2e/                  Testes end-to-end
docs/                       Diretrizes e documentação de engenharia
```

## Requisitos

- Node.js 20.19 ou superior
- npm 10 ou superior

## Como rodar localmente

```bash
npm ci
npm run dev
```

Aplicação disponível em:

```text
http://localhost:5173
```

## Configuração de áudio (Freesound)

Para resolver os previews pela API oficial do Freesound, defina a variável de ambiente abaixo:

```bash
VITE_FREESOUND_API_TOKEN=seu_token_do_freesound
```

Sem token, a aplicação usa fallback direto para previews CDN dos mesmos sons.

Para produção, prefira um proxy/backend para não expor token no bundle do front-end.

## Como rodar com Docker

Ambiente de desenvolvimento:

```bash
docker compose up --build
```

Aplicação disponível em:

```text
http://localhost:5173
```

Build de produção com Nginx:

```bash
docker build -t jogo-da-memoria .
docker run --rm -p 8080:80 jogo-da-memoria
```

Aplicação disponível em:

```text
http://localhost:8080
```

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com Vite |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Publica localmente o build gerado |
| `npm run lint` | Executa o lint do projeto |
| `npm run lint:fix` | Corrige problemas autoajustáveis de lint |
| `npm run test` | Executa os testes unitários e de integração |
| `npm run test:watch` | Executa os testes em modo observação |
| `npm run test:coverage` | Gera cobertura de testes |
| `npm run test:e2e` | Executa os testes end-to-end com Playwright |

## Persistência local

Os seguintes dados são persistidos no navegador:

- ranking geral e por dificuldade
- último nome informado ao salvar pontuação
- tema visual selecionado
- padrão do verso das cartas

## Qualidade e validação

Os checks mínimos previstos para o projeto são:

```bash
npm run lint
npm run build
npm run test:coverage
npm run test:e2e
```

Observações do ambiente atual:

- Vite 8 exige Node.js 20.19 ou superior
- em ambientes com permissões incorretas no diretório dist, o build pode exigir ajuste de ownership antes da execução

## Testes implementados

- testes unitários para configuração do jogo, baralho, pontuação e ranking
- teste de integração da aplicação principal
- testes E2E cobrindo início de partida, configuração do jogador e derrota por tempo esgotado

## Próximos pontos naturais de evolução

- adicionar placar remoto opcional
- incluir animações e efeitos sonoros configuráveis
- ampliar métricas de desempenho por partida
