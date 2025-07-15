import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'IP Risk Analyzer',
  description: 'Analyze IP violation risks with AI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>

        <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
          Created by{' '}
          <a
            href="https://x.com/abigrafikvarmi"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-black transition"
          >
            dsad
          </a>
        </footer>
      </body>
    </html>
  );
}
