# Segurança Escolar

Aplicativo de monitoramento escolar desenvolvido com Expo e React Native.

## Acesso durante o desenvolvimento

Ao executar `npx expo start`, o painel abre diretamente no modo de desenvolvimento do Expo e não depende do serviço pago de autenticação.

**Builds de produção continuam exigindo autenticação.** Não remova o controle de acesso de um build público ou com dados sensíveis sem uma revisão de segurança.

## Autenticação de produção

A integração por tokens permanece em `context/auth-context.tsx` e `server/`. Para usar o login em produção, publique o serviço de autenticação, configure `ADMIN_TOKEN_1`, `ADMIN_TOKEN_2` e `JWT_SECRET` nas variáveis de ambiente do servidor e defina `EXPO_PUBLIC_AUTH_URL` com a URL HTTPS do serviço no ambiente de build.

## Desenvolvimento

```bash
npm install
npx expo start --clear
```
