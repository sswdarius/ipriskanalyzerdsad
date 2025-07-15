import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'IP Risk Analyzer',
  description: 'Analyze IP violation risks with AI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen bg-white text-black">
        <main className="flex-grow">{children}</main>

        {/* Footer biraz daha yukarıda, belirgin ve sabit kalacak şekilde */}
        <footer className="py-4 text-center text-sm text-gray-500">
          Created by{' '}
          <a
            href="https://x.com/abigrafikvarmi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            dsad
          </a>
        </footer>
      </body>
    </html>
  );
}
