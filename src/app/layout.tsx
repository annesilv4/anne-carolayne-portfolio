import type { Metadata, Viewport } from 'next';
import '@fontsource/anton/400.css';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anne | Desenvolvedora Front-end',
  description:
    'Anne Carolayne, desenvolvedora front-end com experiência em React, Next.js e TypeScript. Portfólio com projetos, habilidades e contato.',
};

export const viewport: Viewport = {
  themeColor: '#0D0C12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}