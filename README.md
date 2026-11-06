# Segurança Escolar

Aplicativo de monitoramento escolar desenvolvido com Expo Router e React Native.

## Arquitetura

- **Autenticação e persistência:** o aplicativo usa diretamente o JazzSecurity. Somente os dois administradores fixos (operacao e coordenacao) podem entrar; não existe cadastro no aplicativo.
- **Sensores:** o ESP envia PIR 01 e MQ-2 01 diretamente ao JazzSecurity. Este aplicativo consulta /sensores e /eventos com o Bearer JWT da sessão.
- **Fonte de verdade:** leituras e eventos vêm do SQLite do JazzSecurity. O aplicativo não simula ativações nem permite apagar eventos do banco.
- **Atualização:** consulta automática a cada 10 segundos, com estado de conexão e erros visíveis.

O Projeto Éden / Adan-Stella não participa do login nem da telemetria deste app. A autenticação é compartilhada com o painel New-Security pelo backend JazzSecurity.

## Configuração

Copie .env.example para .env.local e configure EXPO_PUBLIC_JAZZSECURITY_URL com a origem da API JazzSecurity.

Exemplos para desenvolvimento:
- Android Emulator: http://10.0.2.2:3001
- iOS Simulator ou app web na mesma máquina: http://localhost:3001
- Celular físico: use o IP da máquina que hospeda o JazzSecurity, por exemplo http://192.168.1.20:3001.
- Produção: use a URL HTTPS publicada da API.

A URL é pública e pode estar no bundle; não coloque tokens, senhas ou segredos em variáveis EXPO_PUBLIC_*.

No arquivo .env do JazzSecurity, configure JWT_SECRET, ADMIN_OPERACAO_PASSWORD e ADMIN_COORDENACAO_PASSWORD, além das variáveis já exigidas pelo backend. As duas senhas devem ser diferentes e ter ao menos 12 caracteres. O backend provisiona as duas contas no SQLite e armazena hashes de senha.

Para usar o app web, inclua a origem do Expo Web na variável CORS_ORIGINS do JazzSecurity (além das origens já usadas pelo New-Security), por exemplo http://localhost:8081. Apps nativos não aplicam CORS como o navegador.

> O login fixo do JazzSecurity já está na branch principal. Confirme que a instância usada por este app está implantada com essa versão; o endpoint POST /auth/login e as rotas de telemetria protegidas precisam estar ativos.

## Executar

```bash
npm install
npx expo start --clear
```

Validar localmente:

```bash
npx tsc --noEmit
npx expo lint
```

## Serviço de autenticação legado

A pasta server/ e render.yaml contêm o antigo serviço independente baseado em tokens. A integração atual do aplicativo usa o JazzSecurity diretamente; não configure as antigas variáveis ADMIN_TOKEN_1 e ADMIN_TOKEN_2 para este fluxo.
