# TODO - Remover notificação da tela inicial e mover para o registro

## Tarefas
- [x] Analisar arquivos relevantes (`index.tsx`, `registro.tsx`, `alerts-context.tsx`, `detector-card.tsx`)
- [x] Editar `index.tsx`: remover card de alerta e card "fim da captura"; manter piscar de fundo (vermelho 10s fumaça / azul 2s presença)
- [x] Editar `registro.tsx`: adicionar card de notificação de alerta ativo no topo, mantendo o histórico
- [x] Verificar compilação/TypeScript

## Dependentes
- Nenhum (edição somente nos dois arquivos)

## Follow-up
- Testar a navegação e os efeitos de piscar nas duas telas


## Redesign SchoolSafe

**Estado atual:** A correção do fundo da Home está em andamento na branch isolada `fix/home-background-scroll`, criada a partir da `main` sem alterar a `main`.
**Próximo passo:** Testar a rolagem no preview web do PR #6 para confirmar visualmente que nenhuma área branca fica exposta.

### Checklist por fase
- [~] **Fase 0 — Auditoria:** lidos `AGENTS.md`, `CLAUDE.md`, configuração, histórico recente e componentes centrais em 2026-10-10. O clone local e o `npx tsc --noEmit` ainda não foram executados: o ambiente não conseguiu resolver `github.com`; verificar novamente quando houver execução local disponível.
- [~] **Fase 1 — Fundação visual:** tema, presets, Glass e fundo ambiente existem; falta alinhar todos os detalhes de animação/acessibilidade e validar em dispositivo.
- [~] **Fase 2 — Header:** identidade, escudo, rótulo e saída existem; indicador ONLINE ainda não respira e a animação do header precisa ser validada.
- [~] **Fase 3 — Áreas e sensores:** `AreaId`, áreas, semente de demonstração, `areaId`, `registerSensor` e `unregisterSensor` existem. Durações de 10 s/2 s, histórico e haptics permanecem no contexto original.
- [~] **Fase 4 — Mapa:** corrigido o import ausente de `Ionicons` em 2026-10-10 (commit `ebb7a37a30f5c6d7cd308d34308b7759070322e9`); ainda falta corrigir a centragem dos grupos e acessibilidade. O projeto não possui `react-native-svg` declarado, então o mapa atual usa Views nativas para evitar nova dependência.
- [~] **Fase 5 — Central e monitoramento:** removida a seção “Sistemas de detecção” abaixo do mapa; card principal de status ampliado para altura mínima de 264 px e conteúdo distribuído em 2026-10-10 (commits `7264f117e19fae4cfd044fad058c05117696fd12`, `6aec3fbd5c1d6de3d17f4f30d706d2eba4f00111`, `c1ec735cb7604532830b5d845d7defac8a06604f`). Ainda faltam os demais refinamentos da central e validação visual.
- [~] **Fase 6 — Detalhes, dock, telas e registro:** painel do sensor agora respeita a altura útil, reduz a miniatura e permite rolagem dos detalhes mantendo o botão de ação acessível; concluído em 2026-10-10 (commits `6aa5892991f70c1438c16ab0e43e823e9ac80a0b`, `07b0d93517054895ce40dd304e1b3225992f902d`). Dock, rotas, histórico e ações foram preservados; ainda faltam os demais refinamentos e teste real.
- [~] **Fase 7 — Login e autenticação:** login escuro e os dois admins com sal/hash já existem; melhorar estados de foco/teclado e confirmar fluxo sem mudar a validade da sessão de 24 h.

### Decisões tomadas
- Regra vigente desde 2026-10-12: nunca alterar `main` diretamente; criar uma nova branch para cada tipo de alteração e abrir PR para revisão.
- Não instalar novas dependências neste ciclo sem necessidade demonstrada; manter o mapa nativo para não alterar o lockfile.
- Não alterar regras de negócio: timers de fumaça (10 s) e movimento (2 s), histórico, sessão de 24 h, haptics ou rotas existentes.
- Nenhuma foto de área será adicionada; `AREA_PHOTOS` permanece opcional/vazio até o solicitante fornecer imagens.

### Pendências do solicitante
- Fornecer fotografias reais para `assets/areas/` se desejar usá-las nos cards grandes e nas telas de sensores.
- Testar o app em um dispositivo/emulador iOS ou Android após o build local.

### Bloqueios e problemas
- A cópia local do repositório não pôde ser clonada neste ambiente por falha de resolução DNS de `github.com`; portanto, não foi possível executar `git status` local nem `npx tsc --noEmit`.
- A cópia remota atual corrige o import de `Ionicons`; ainda não foi possível executar TypeScript para confirmar o build.
- `components/schoolsafe/school-map.tsx` mantém a faixa de sensores não cadastrados dentro do card do mapa, e grupos com mais de um sensor não ficam centralizados corretamente.
- O indicador animado deslizante do dock e a revisão visual em aparelhos reais ainda não foram confirmados.


### Acesso de teste (2026-10-10)
- [x] Gerar duas credenciais fortes para testar o login e salvar apenas salt/hash em `constants/admins.ts` — concluído em 2026-10-10; commit `10d927350f1c8f331108089a00ad834daf8e11c0`.
- [x] Registrar o hash do commit e entregar os dados de acesso nesta conversa — concluído em 2026-10-10; commit das credenciais `10d927350f1c8f331108089a00ad834daf8e11c0`.


### Ajustes solicitados — Home e painel de detalhes (2026-10-10)
- [x] Remover da Home a seção “Sistemas de detecção” que aparece abaixo do mapa — 2026-10-10, commit `7264f117e19fae4cfd044fad058c05117696fd12`.
- [x] Aumentar a altura e reorganizar o card principal de status para melhorar a leitura — 2026-10-10, commits `6aec3fbd5c1d6de3d17f4f30d706d2eba4f00111` e `c1ec735cb7604532830b5d845d7defac8a06604f`.
- [x] Corrigir o painel expandido do sensor para caber na altura útil da tela, com conteúdo rolável em dispositivos menores — 2026-10-10, commits `6aa5892991f70c1438c16ab0e43e823e9ac80a0b` e `07b0d93517054895ce40dd304e1b3225992f902d`.
- Restrições: manter somente a branch `main`; não alterar negócio, duração dos timers, histórico, sessão, haptics ou rotas.


### Fix TypeScript — `Typography` em sensor-screen.tsx (2026-10-10)
- [x] Verificar tipografia e garantir estilos sem referências não declaradas a `Typography` em `components/schoolsafe/sensor-screen.tsx`; manter título em peso 700 e alerta em peso médio 500 — 2026-10-10, commit `d3cda63f19ed8663f45ddaec1915d0a9d09aa908`.
- [x] Validar TypeScript e Expo lint pelo GitHub Actions na `main` — aprovados no run [38065632387](https://github.com/User82bit/my-app-clone/actions/runs/38065632387), commit validado `82a0f9d8637d0de609a5f7e747f8b37e8e09d070`.


### Correção isolada — erros TypeScript após merge (2026-10-10)
- [x] Importar `Typography` em `sensor-screen.tsx` a partir de `constants/theme.ts`, onde é exportado e cuja família Inter já é carregada no layout raiz — 2026-10-10, commit `f35fdd75e2f4ea3585d57586e2aeb20a566e9889`.
- [x] Remover estilos duplicados em `index.tsx` e `monitor-card.tsx` que impediam o `tsc`; preservar a remoção do resumo “Sistemas de detecção” — 2026-10-10, commit `f35fdd75e2f4ea3585d57586e2aeb20a566e9889`.
- Verificação inicial: workflow `Validate SchoolSafe redesign` no commit `2255400a4e31552924faff1041e5a313d7774d68` reportou oito erros (dois em `sensor-screen.tsx`, dois em `index.tsx`, quatro em `monitor-card.tsx`).
- [x] Conferir TypeScript/Expo lint para o código corrigido (commit `f35fdd75e2f4ea3585d57586e2aeb20a566e9889`), validado pelo run [38065632387](https://github.com/User82bit/my-app-clone/actions/runs/38065632387) no commit seguinte `82a0f9d8637d0de609a5f7e747f8b37e8e09d070`.


### CI após remoção da branch de trabalho (2026-10-10)
- [x] Ajustar `.github/workflows/schoolsafe-validation.yml` para executar no push em `main` — concluído em 2026-10-10; commit `82a0f9d8637d0de609a5f7e747f8b37e8e09d070`.
- [x] Confirmar que `npx tsc --noEmit` e `npx expo lint` passaram na `main` — run [38065632387](https://github.com/User82bit/my-app-clone/actions/runs/38065632387), commit validado `82a0f9d8637d0de609a5f7e747f8b37e8e09d070`, em 2026-10-10.


### Correção isolada — fundo branco na rolagem da Home (2026-10-10)
- [x] Criar `app/+html.tsx` (Expo Router web) com fundo `#1f1f1f`, `ScrollViewStyleReset` e altura mínima de `html`, `body` e `#root` — 2026-10-10, commit `fc7d3fd04cabf8dbf19b87cb4c5b7196f97d501e`.
- [x] Definir o fundo base do app como `#1f1f1f` sem cobrir o fundo ambiente; manter a tela transparente para preservar os brilhos — 2026-10-10, commit `fc7d3fd04cabf8dbf19b87cb4c5b7196f97d501e`.
- [x] Ajustar o workflow para validar branches `fix/**`, `feat/**` e PRs para `main`, sem fazer push de código para `main` — 2026-10-10, commit `fc7d3fd04cabf8dbf19b87cb4c5b7196f97d501e`.
- [x] Registrar hash da correção; TypeScript e Expo lint passaram no run [38072504887](https://github.com/User82bit/my-app-clone/actions/runs/38072504887) — commit `fc7d3fd04cabf8dbf19b87cb4c5b7196f97d501e`, 2026-10-10.
- Isolamento: toda alteração desta tarefa fica em `fix/home-background-scroll`; nenhuma escrita em `main`.

- PR aberto para revisão, sem merge: [#6 — fundo escuro durante a rolagem](https://github.com/User82bit/my-app-clone/pull/6).


### Ajuste isolado — prioridade da localização dos sensores (2026-10-12)
- [x] Colocar a localização como título principal e o nome do sensor como subtítulo nos cards e detalhes.
- [x] Exibir alertas com a localização primeiro, sem separadores duplicados quando a localização estiver vazia.
- [x] Remover o texto “Sala” da área SALA_01, preservando o retângulo da planta sem rótulo e sem alterar o identificador interno.
- [x] Preservar timers (10 s fumaça / 2 s movimento), histórico, sessão, haptics, navegação e ações.
- [x] TypeScript e Expo lint passaram no run [38282537092](https://github.com/User82bit/my-app-clone/actions/runs/38282537092).
- [ ] Conferir o resultado no preview visual web antes do merge.
- Branch isolada: fix/sensor-location-priority; não editar main diretamente.


### Ajuste isolado — tamanho uniforme dos cards e quebra de linha da planta (2026-10-12)
- [x] Fixar a altura dos cards de sensores para 172 px e limitar textos longos a uma linha, preservando a hierarquia local em destaque.
- [x] Uniformizar a altura dos alertas ativos e dos registros de histórico em 68 px.
- [x] Permitir `\n` nos nomes de `constants/areas.ts` e renderizar cada linha no mapa com tamanho de fonte ajustado à largura da área.
- [x] Normalizar quebras de linha ao transferir o nome da área para dados do sensor, para não propagar quebras em alertas e histórico.
- [ ] Confirmar TypeScript e Expo lint pelo GitHub Actions.
- [ ] Conferir o preview visual web antes do merge.
- Branch: `fix/registro-uniform-cards`, derivada de `fix/sensor-location-priority` para manter as alterações anteriores sem editar `main` diretamente.
- PR aberto para revisão, sem merge: [#8 — cards uniformes e rótulos multilinha](https://github.com/User82bit/my-app-clone/pull/8).
