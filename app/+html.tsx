import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Base HTML exclusiva do preview web: impede que o fundo padrão do navegador
 * (branco) apareça no overscroll ou fora do conteúdo do React Native.
 */
export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style>{`
          html,
          body,
          #root {
            width: 100%;
            min-height: 100%;
            margin: 0;
            background-color: #1f1f1f;
          }

          body {
            min-height: 100vh;
            overscroll-behavior-y: none;
          }

          #root {
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body style={{ backgroundColor: '#1f1f1f', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
