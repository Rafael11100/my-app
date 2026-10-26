# Segurança Escolar

Aplicativo de monitoramento escolar desenvolvido com Expo e React Native.

## Login administrativo por token

A tela de acesso aceita apenas um token. Os dois tokens administrativos são verificados no servidor, não no aplicativo; assim, o mesmo token pode ser usado em outro celular ou computador sem depender de hashes locais ou de uma máquina específica.

**Não coloque os tokens no código do app nem em arquivos públicos do repositório.** Configure-os somente nas variáveis de ambiente do servidor.

### Executar o servidor de autenticação localmente

1. Entre na pasta `server` e copie `.env.example` para `.env`.
2. Preencha `ADMIN_TOKEN_1`, `ADMIN_TOKEN_2` e `JWT_SECRET` com os valores secretos fornecidos ao administrador.
3. Execute `npm start`. A API ficará disponível na porta definida em `PORT` (padrão: `3000`).
4. Na raiz do app, crie um arquivo `.env` com `EXPO_PUBLIC_AUTH_URL=http://IP-DO-SERVIDOR:3000`.
5. Inicie o app com `npm install` e `npm start`.

Para testar em outro dispositivo, use o IP da máquina na mesma rede local ou, preferencialmente, publique o servidor com HTTPS e configure a URL pública. **Não use `localhost` no celular**, pois ele se refere ao próprio dispositivo.

### Publicar o servidor

Publique a pasta `server` como serviço Node.js (Node 20 ou superior), com o comando de inicialização `npm start`. Cadastre `ADMIN_TOKEN_1`, `ADMIN_TOKEN_2`, `JWT_SECRET` e, em produção, `ALLOWED_ORIGINS` como variáveis de ambiente no provedor de hospedagem. Configure `EXPO_PUBLIC_AUTH_URL` no ambiente de build do Expo com a URL HTTPS desse serviço.

A API compara os tokens diretamente em tempo constante, aplica limite básico de tentativas por IP e emite uma sessão JWT com expiração de 24 horas. A assinatura HMAC protege a sessão emitida; ela não substitui a validação dos tokens no servidor.

## Desenvolvimento do app

```bash
npm install
npm start
```

O nome visível, o identificador do app e os ícones foram configurados para **Segurança Escolar**.
