# Segurança Escolar

Aplicativo de monitoramento escolar desenvolvido com Expo SDK 58, Expo Router e React Native 0.88.

## Arquitetura

- **Autenticação e persistência:** o aplicativo usa diretamente o JazzSecurity. Somente os dois administradores fixos (operacao e coordenacao) podem entrar; não existe cadastro no aplicativo.
- **Sensores:** o ESP envia PIR 01 e MQ-2 01 diretamente ao JazzSecurity. Este aplicativo consulta /sensores e /eventos com o Bearer JWT da sessão.
- **Fonte de verdade:** leituras e eventos vêm do SQLite do JazzSecurity. O aplicativo não simula ativações nem permite apagar eventos do banco.
- **Atualização:** consulta automática a cada 10 segundos, com estado de conexão e erros visíveis.

O Projeto Éden / Adan-Stella não participa do login nem da telemetria deste app. A autenticação é compartilhada com o painel New-Security pelo backend JazzSecurity.

## Configuração

Copie .env.example para .env.local. O endereço padrão de produção já está configurado como `https://jazz-security.vercel.app`, então o aplicativo usa essa API no login e na consulta dos sensores/eventos sem precisar configurar outra URL.

Para desenvolvimento com uma API executada localmente, substitua `EXPO_PUBLIC_JAZZSECURITY_URL` no .env.local pelo endereço correto:
- Android Emulator: http://10.0.2.2:3001
- iOS Simulator ou Expo Web na mesma máquina: http://localhost:3001
- Celular físico: use o IP da máquina que hospeda a API, por exemplo http://192.168.1.20:3001.

A URL é pública e pode estar no bundle; não coloque tokens, senhas ou segredos em variáveis EXPO_PUBLIC_*.

No arquivo .env do JazzSecurity, configure JWT_SECRET, ADMIN_OPERACAO_PASSWORD e ADMIN_COORDENACAO_PASSWORD, além das variáveis já exigidas pelo backend. As duas senhas devem ser diferentes e ter ao menos 12 caracteres. O backend provisiona as duas contas no SQLite e armazena hashes de senha.

Para usar o app web, inclua a origem do Expo Web na variável CORS_ORIGINS do JazzSecurity (além das origens já usadas pelo New-Security), por exemplo http://localhost:8081. Apps nativos não aplicam CORS como o navegador.

> API padrão do aplicativo: `https://jazz-security.vercel.app`. A instância publicada precisa disponibilizar `POST /auth/login` e as rotas protegidas `GET /sensores` e `GET /eventos`, conforme o contrato consumido pelo app.

## Executar

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

Validar localmente:

```bash
npx tsc --noEmit
npx expo lint
```

## Serviço de autenticação legado

A pasta server/ e render.yaml contêm o antigo serviço independente baseado em tokens. A integração atual do aplicativo usa o JazzSecurity diretamente; não configure as antigas variáveis ADMIN_TOKEN_1 e ADMIN_TOKEN_2 para este fluxo.

## Ambiente de desenvolvimento

O projeto utiliza Expo SDK 58, React Native 0.88.1, React 19.3, Reanimated 4.7.1 e Worklets 0.13.0. O Expo SDK 58 requer Node.js 22.13 ou superior. Após atualizar a branch, instale as dependências com `npm ci` e execute `npx expo-doctor` para conferir o ambiente.

Para reiniciar o Metro limpando o cache, execute `npx expo start --clear`. Como a migração atualiza bibliotecas nativas, gere e instale um novo APK ou development build; um APK antigo continua contendo as versões nativas anteriores.

## Gerar o aplicativo Android

Para gerar um APK instalável diretamente em celulares Android, entre na conta Expo e configure o projeto EAS na primeira utilização:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Depois, na raiz do projeto, execute:

```bash
npm run build:android:apk
```

O perfil `preview` gera um arquivo **.apk**, adequado para instalar diretamente em dispositivos Android. Para gerar um **.aab** destinado à publicação na Google Play, execute:

```bash
npm run build:android:aab
```

Os builds são executados na infraestrutura do EAS Build e exigem uma conta Expo. Na primeira execução, o EAS pode pedir para vincular ou criar o projeto na conta.
