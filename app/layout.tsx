import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'IP Risk Analyzer',
  description: 'Analyze IP violation risks with AI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body className="antialiased flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>

        <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
=======
      <body className="antialiased flex flex-col min-h-screen bg-white text-black">
        <main className="flex-grow">{children}</main>

        {/* Footer biraz daha yukarıda, belirgin ve sabit kalacak şekilde */}
        <footer className="py-4 text-center text-sm text-gray-500">
>>>>>>> 2876e1ac1b8deba8229712059eb4508b59c3312e
          Created by{' '}
          <a
            href="https://x.com/abigrafikvarmi"
            target="_blank"
            rel="noopener noreferrer"
<<<<<<< HEAD
            className="underline hover:text-black transition"
=======
            className="text-blue-600 hover:underline"
>>>>>>> 2876e1ac1b8deba8229712059eb4508b59c3312e
          >
            dsad
          </a>
        </footer>
      </body>
    </html>
  );
}
