# TODO – Persistência, exclusão e correção da tela inicial

## Passos
- [x] Instalar `@react-native-async-storage/async-storage`
- [x] `context/alerts-context.tsx`: carregar e salvar `history` no AsyncStorage; adicionar `removeRecord(id)`
- [x] `app/(tabs)/registro.tsx`: adicionar botão "x" em cada registro para apagar
- [x] `app/(tabs)/index.tsx`: corrigir identificação do detector na tela inicial usando o registro mais recente
- [x] Validar compilação com `npx tsc --noEmit`
